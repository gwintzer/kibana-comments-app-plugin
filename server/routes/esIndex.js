
export default function (server, dataCluster) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const baseIndex = "comments";
  const defaultType = "document";

  const defaultNewIndexSettings = {
    "settings" : {
        "number_of_shards" : 1,
        "number_of_replicas" : 0
    }
  }

  // Route GET : list indices
  server.route({
    path: '/api/kibana-comments-plugin/index',
    method: 'GET',
    handler(req, reply) {

      dataCluster.callWithRequest(req, 'cat.indices', {
        format: "json"
      })
      .then((response) => {

        reply(response
              .filter((indexData) => (indexData.status === 'open'
                                   && indexData.index.startsWith(baseIndex))) // filter
              .sort((a, b) => (a.index > b.index)));

      })
      .catch((e) => {
        reply([]);
      })

    }
  });

  // Route PUT : create a new index, or a default one if no name
  server.route({
    path: '/api/kibana-comments-plugin/index/{name?}',
    method: 'PUT',
    handler(req, reply) {

      let indexName = baseIndex;

      if (req.params.name)
        indexName += '-' + encodeURIComponent(req.params.name);

      //createIndex(indexName, req, reply)
      dataCluster.callWithRequest(req, 'indices.create', {
        index: indexName,
        body: defaultNewIndexSettings,
        ignore: [400]
      })
      .then((response) => {

        reply({"acknowledged": true});

      }).catch((e) => {

        console.error(e);
        reply({"error": e})
      });

    }
  });

}
