import request from 'superagent'
import url from 'url'
import http from 'http'
import https from 'https'
import querystring from 'querystring'

import { getElasticsearchProxyConfig } from '../elasticsearch_proxy_config'



export default function (server, config) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const defaultIndex = "comments,comments-*";

  const esBaseUrl = url.parse(config.get('elasticsearch.url'));
  const esProxyConfig = getElasticsearchProxyConfig(server);
  
  
  // Route GET : list comments
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'GET',
    config: {
      cors: {}
    },
    handler(req, reply) {

      var body = {
        "query": {
          "match_all": {}
        },
        "_source": ["date", "body"],
        "size": req.query.size || 10,
        "sort": [
          {
            "created_at": {
              "order": "desc"
            }
          }
        ]

      };
      var reqBody = JSON.stringify(body);

      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'POST',
        path: '/' + (req.query.index ? encodeURIcomponent(req.query.index) : defaultIndex) + "/_search",
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(reqBody)
        }
      }

      const ESReq = http.request(options, (res) => {

          var resultData = "";

          res.on('data', (chunk) => {
            resultData += chunk;
          });

          res.on('end', () => {

            try {
              resultData = JSON.parse(resultData).hits.hits.map((hit) => ({
                "id": hit._id, 
                "index": hit._index, 
                ...hit._source
              }));
            }
            catch (e) {
              resultData = {};
            }
            reply(resultData);
          });

          res.on('error', (e) => {
            reply({"error": e})
          });

        });

      // finalize the request 
      ESReq.end(reqBody);
    }
  });


  // Route PUT : create a comment
  server.route({
    path: '/api/kibana-comments-plugin/comment',
    method: 'PUT',
    config: {
      cors: {}
    },
    handler(req, reply) {

      var payload = req.payload;

      if (!payload.index)
        reply({"error": e})


      var reqBody = JSON.stringify({
        "created_at": new Date().toISOString(), 
        ...payload.comment
      });

      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'POST',
        path: '/' + payload.index + "/document",
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(reqBody)
        }
      }

      const ESReq = http.request(options, (res) => {

          var resultData = "";

          res.on('data', (chunk) => {
            resultData += chunk;
          });
          res.on('end', () => {
            reply(JSON.parse(resultData));
          });

          res.on('error', (e) => {
            console.error(e);
            reply({"error": e})
          });

        });

        // pass the body of the POST request 
        ESReq.write(reqBody);
        
        // finalize the request
        ESReq.end();

    }
  });

  // Route DELETE : delete a comment, by id
  server.route({
    path: '/api/kibana-comments-plugin/comment/{index}/{id}',
    method: 'DELETE',
    handler(req, reply) {

      var index = req.params.index;
      var id = req.params.id;
      
      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'DELETE',
        path: '/' + index + "/document/" + id,
        headers: {
          'Content-Type': 'application/json'
        }
      }

      // build request
      const ESReq = http.request(options, (res) => {

          var resultData = "";

          res.on('data', (chunk) => {
            resultData += chunk;
          });
          res.on('end', (a) => {
            reply({"status": JSON.parse(resultData), deleted: true});
          });

          res.on('error', (e) => {
            console.log ("delete : on end", e)
            reply({"error": e})
          });

        });
        
        // finalize the request
        ESReq.end();


    }
  });

}
