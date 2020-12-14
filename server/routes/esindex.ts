import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';

export function defineRoutesIndex(router: IRouter) {
  router.get(
    {
      path: '/api/kibana_comments_app/example',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );

  const baseIndex = "comments";
  
    router.get(
      {
        path: '/api/kibana-comments-plugin/example',
        validate: false,
      },
      async (context, request, response) => {
        return response.ok({
          body: {
            time: new Date().toISOString(),
          },
        });
      }
    );
    router.get(
      {
        path: '/api/kibana-comments-plugin/cluster/_health',
        validate: false,
      },
      async (context, request, response) => {
        const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser('cluster.health')     
        //console.log('****************** ', data)
        return response.ok({
          body: {
            time: Object.keys(data.status)
          },
        });
      }
    );
  router.get(
    {
      path: '/api/kibana-comments-plugin/index',
      validate: false,
    },
    async (context, request, response) => {
      console.log('****************** ', request);
      const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser('cat.indices', {format: "json"})     
      console.log('****************** ', data);
  
      return response.ok({
        body: {
          data: data.filter((indexData: { status: string; index: string; }) => (indexData.status === 'open'
          && indexData.index.startsWith(baseIndex))) // filter
.sort((a: { index: number; }, b: { index: number; }) => (a.index > b.index)),
          time: new Date().toISOString(),
        },
      });
    }
  );

    // Route PUT : create a new index, or a default one if no name
    router.put(
      {
        path: '/api/kibana-comments-plugin/index/{name?}',
        validate: {
          body: schema.any(),
          params: schema.any()
        }
      },
      async (context, request, response) => {
      //try {
          console.log('***********************request.body : ', request.body);
          console.log('***********************request.params : ', request.params)
          console.log('***********************request : ', request)
          console.log('***********************context : ', context)
          //const config = context.core.uiSettings.client.;
          //const pluginConfig = config.get('kibana-comments-app-plugin');
  
          const newIndexSettings = {
            "settings" : {
                "number_of_shards" :  1,
                "number_of_replicas" :  1
            }
          }
          /*const newIndexSettings = {
            "settings" : {
                "number_of_shards" : pluginConfig.newIndexNumberOfShards || 1,
                "number_of_replicas" : pluginConfig.newIndexNumberOfReplicas || 1
            }
          }*/
  
          let indexName = baseIndex;
  
          if (request.params.name)
            indexName += '-' + encodeURIComponent(request.params.name);
            console.log('***************** indexName : ',indexName)
          const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser('indices.create', {
            index: indexName,
            body: newIndexSettings,
            ignore: [400]
          })
          console.log('***************** data : ',data)
          return response.ok({
            body: {
              data: data,
              time: new Date().toISOString(),
            },
          });
        } 
      /*catch (error) {
        const options = {}
          return wrapError(error,options);
        }
      }*/
    );
}
