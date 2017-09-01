import request from 'superagent'
import url from 'url'
import http from 'http'
import https from 'https'
import querystring from 'querystring'

import { getElasticsearchProxyConfig } from '../elasticsearch_proxy_config'



export default function (server, config) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const index = ".metriks-comments";

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
        "_source": ["date", "comment"],
        "size": req.query.size || 100
      };
      var reqBody = JSON.stringify(body);

      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'POST',
        path: '/' + index + "/_search",
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(querystring.stringify(reqBody))
        }
      }

      const ESReq = http.request(options, (res) => {

          var resultData = "";

          res.on('data', (chunk) => {
            resultData += chunk;
          });

          res.on('end', () => {

            try {
              resultData = JSON.parse(resultData).hits.hits.map((hit) => ({"id": hit._id, ...hit._source}));
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

      // pass the body of the POST request 
      ESReq.write(reqBody);  

      // finalize the request 
      ESReq.end();           
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

      console.log ("payload",req.payload)
      var body = req.payload;
      console.log ("body", body)
      var reqBody = JSON.stringify(body);
      console.log ("reqBody", reqBody)

      console.log(querystring, querystring.stringify(reqBody));

      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'POST',
        path: '/' + index + "/document",
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

            console.log (resultData)
            reply(JSON.parse(resultData));
          });

          res.on('error', (e) => {
            console.error(e);
            reply({"error": e})
          });

        });

        // pass the body of the POST request 
        console.log("avant write");
        console.log(reqBody);
        ESReq.write(reqBody);
        
        // finalize the request
        ESReq.end();


    }
  });

  // Route DELETE : delete a comment, by id
  server.route({
    path: '/api/kibana-comments-plugin/comment/{id}',
    method: 'DELETE',
    handler(req, reply) {

      console.log ("id",encodeURIComponent(req.params.id))
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

            console.log ("delete : on data ", chunk)
            resultData += chunk;
          });
          res.on('end', (a) => {

            console.log ("delete : on end", a)
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
