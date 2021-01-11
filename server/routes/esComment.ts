import { wrapError } from './wrapError'
import Boom from 'boom'
import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';

export function defineRoutesComment(router: IRouter) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const indexPattern = "comments,comments-*";
  // const type = "document";

  // Route GET : list comments
  router.get({
    path: '/api/kibana-comments-plugin/comment',
    validate: {
      body: schema.any(),
      params: schema.any(),
      query: schema.any(),
    }
  },
  async (context, request, response) => {
     try {
        const index         = request.query.index ? encodeURIComponent(request.query.index) : indexPattern,
              pageIndex     = request.query.pageIndex || 0,
              pageSize      = request.query.pageSize || 20,
              sortField     = request.query.sortField || 'date',
              sortDirection = request.query.sortDirection || 'desc'

        const getSortableField = () => {
        
          if (sortField === "body") {
            return "body.keyword";
          }
          if (sortField === "index") {
            return "_index";
          }
        
          return sortField;
        }
        
        const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser('search', {
          index,
          body: {
            "query": {
              "match_all": {}
            },
            "_source": ["date", "body"],
            "from": pageIndex * pageSize,
            "size": pageSize,
            "sort": [
              {
                [getSortableField()]: {
                  "order": sortDirection
                }
              }
            ]
        
          }
        });
       

        return response.ok({
          body: {
          "total": data.hits.total,
          "items": data.hits.hits.map((hit: { _id: any; _index: any; _source: any; }) => ({
            "id": hit._id,
            "index": hit._index,
            ...hit._source
          }))}});
        
     }
    catch (error) {
        return response.ok({
          body: {            
            message: error,
          }
      });
    
    }
  });


  //Route PUT : create a comment
  router.put({
    path: '/api/kibana-comments-plugin/comment',
    validate: {
      body: schema.any(),
      params: schema.any(),
      query: schema.any(),
      }
    },
    async (context, request, response) => {
      try {
        //console.log('******************** request ',request)
        var payload = request.body;
        //console.log('******************** payload ',payload)
        if (!payload.index)
          throw Boom.notAcceptable('index is required'); 
        var index = payload.index;
        
        const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser( 'index', {
          index,
          refresh: true,
          body: {
            "created_at": new Date().toISOString(),
            ...payload.comment
          }
        });
        
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });

      }
      catch (error) {
        return response.ok({
          body: {            
            message: "error",
          }
        });
      }
    });
 

  // Route DELETE : delete a comment, by id
  router.delete({
    path: '/api/kibana-comments-plugin/comment/{index}/{id}',
    validate: {
      body: schema.any(),
      params: schema.any(),
      query: schema.any(),
      }
    },
    async (context, request, response) => {
      try {
        //console.log('************** request',request.params);
        var data = await context.core.elasticsearch.legacy.client.callAsCurrentUser('delete', {
          index: request.params.index,
          // type: type,
          refresh: true,
          id: request.params.id
        });
        
        return response.ok({
          body: {
            data,
            time: new Date().toISOString(),
          },
        });

      }
      catch (error) {
        return response.ok({
          body: {            
            message: "error",
          }
        });
      }
    });
  

}
