import { wrapError } from './wrapError'

export default function (server, dataCluster) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const baseIndex = "comments";
  const defaultType = "document";

  const defaultNewIndexSettings = {
    "settings" : {
        "number_of_shards" : 1,
        "number_of_replicas" : 1
    }
  }

  // Route GET : list indices
  server.route({
    path: '/api/kibana-comments-plugin/index',
    method: 'GET',
    handler: async(req, h) => {

      try { 

        var response = await dataCluster.callWithRequest(req, 'cat.indices', {format: "json"})

        return (response
              .filter((indexData) => (indexData.status === 'open'
                                   && indexData.index.startsWith(baseIndex))) // filter
              .sort((a, b) => (a.index > b.index)));
      }
      catch (error) {
        return wrapError(error);
      }
    }
  });

  // Route PUT : create a new index, or a default one if no name
  server.route({
    path: '/api/kibana-comments-plugin/index/{name?}',
    method: 'PUT',
    handler: async(req, h) => {
      try {
        let indexName = baseIndex;

        if (req.params.name)
          indexName += '-' + encodeURIComponent(req.params.name);

        var response = await dataCluster.callWithRequest(req, 'indices.create', {
          index: indexName,
          body: defaultNewIndexSettings,
          ignore: [400]
        })

        return {"acknowledged": true};
      } 
      catch (error) {
        return wrapError(error);
      }
    }
  });

}
