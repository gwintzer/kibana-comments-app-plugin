
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

      dataCluster.callWithRequest(req, 'search', {
        index,
        type,
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
      }).then(function (response) {

        reply({
          "total": response.hits.total,
          "items": response.hits.hits.map((hit) => ({
            "id": hit._id,
            "index": hit._index,
            ...hit._source
          }))
        });

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
        refresh: true,
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
        refresh: true,
        id: req.params.id
      }).then((response) => {
        reply(response)
      }, (e) => {
        reply({"error": e})
      })

    }

  });

}
