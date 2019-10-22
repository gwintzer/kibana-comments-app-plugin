import { wrapError } from './wrapError'
import Boom from 'boom'

export default function (server, dataCluster) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const indexPattern = "comments,comments-*";
  // const type = "document";

  // Route GET : list comments
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'GET',
    handler: async(req, h) => {
      try {
        const index         = req.query.index ? encodeURIcomponent(req.query.index) : indexPattern,
              pageIndex     = req.query.pageIndex || 0,
              pageSize      = req.query.pageSize || 20,
              sortField     = req.query.sortField || 'date',
              sortDirection = req.query.sortDirection || 'desc'

        const getSortableField = () => {
        
          if (sortField === "body") {
            return "body.keyword";
          }
          if (sortField === "index") {
            return "_index";
          }
        
          return sortField;
        }
        
        var response = await dataCluster.callWithRequest(req, 'search', {
          index,
          // type,
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

        return {
          "total": response.hits.total,
          "items": response.hits.hits.map((hit) => ({
            "id": hit._id,
            "index": hit._index,
            ...hit._source
          }))
        };
      }
      catch (error) {
        return wrapError(error);
      }
    }
  });


  // Route PUT : create a comment
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'PUT',
    handler: async(req, h) => {
      try {
        var payload = req.payload;
        
        if (!payload.index)
          throw Boom.notAcceptable('index is required'); 
        
        var index = payload.index;
        
        var response = await dataCluster.callWithRequest(req, 'index', {
          index,
          // type,
          refresh: true,
          body: {
            "created_at": new Date().toISOString(),
            ...payload.comment
          }
        });
        
        return response;

      }
      catch (error) {
        return wrapError(error);
      }
    }
  });

  // Route DELETE : delete a comment, by id
  server.route({
    path: '/api/kibana-comments-plugin/comment/{index}/{id}',
    method: 'DELETE',
    handler: async(req, h) => {
      try {
        var response = await dataCluster.callWithRequest(req, 'delete', {
          index: req.params.index,
          // type: type,
          refresh: true,
          id: req.params.id
        });
        
        return response;
      }
      catch (error) {
        return wrapError(error);      
      }
    }
  });

}
