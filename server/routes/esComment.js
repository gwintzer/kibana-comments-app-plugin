
export default function (server, dataCluster) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const indexPattern = "comments,comments-*";
  const type = "document";

  // Route GET : list comments
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'GET',
    handler(req, reply) {

      var index = req.query.index ? encodeURIcomponent(req.query.index) : indexPattern;

      dataCluster.callWithRequest(req, 'search', {
        index,
        type,
        body: {
          "query": {
            "match_all": {}
          },
          "_source": ["date", "body"],
          "size": req.query.size || 10/*,
          "sort": [
            {
              "created_at": {
                "order": "desc"
              }
            }
          ]*/

        }
      }).then(function (response) {

        reply(response.hits.hits.map((hit) => ({
          "id": hit._id,
          "index": hit._index,
          ...hit._source
        })));

  		}).catch(function (e) {

          reply({"error": e})
      })

    }
  });


  // Route PUT : create a comment
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'PUT',
    handler(req, reply) {

      var payload = req.payload;

      if (!payload.index)
        reply({"error": e})

      var index = payload.index;

      dataCluster.callWithRequest(req, 'index', {
        index,
        type,
        body: {
          "created_at": new Date().toISOString(),
          ...payload.comment
        }
      }).then((response) => {

        reply(response);

      }).catch((e) => {

        console.error(e);
        reply({"error": e})
      });

    }
  });

  // Route DELETE : delete a comment, by id
  server.route({
    path: '/api/kibana-comments-plugin/comment/{index}/{id}',
    method: 'DELETE',
    handler(req, reply) {

      dataCluster.callWithRequest(req, 'delete', {
        index: req.params.index,
        type: type,
        id: req.params.id
      }).then((response) => {
        reply(response)
      }, (e) => {
        reply({"error": e})
      })

    }

  });

}
