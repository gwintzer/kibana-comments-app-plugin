import request from 'superagent'
import url from 'url'
import http from 'http'
import https from 'https'
import querystring from 'querystring'

import { getElasticsearchProxyConfig } from '../elasticsearch_proxy_config'



export default function (server, config) {

  // TODO : check given fields
  //const mandatoryFields = ["date", "comment"];

  const baseIndex = "comments";

  const esBaseUrl = url.parse(config.get('elasticsearch.url'));
  const esProxyConfig = getElasticsearchProxyConfig(server);

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
    config: {
      cors: {}
    },
    handler(req, reply) {

      var options = {
        ...esBaseUrl,
        ...esProxyConfig,
        method: 'GET',
        path: '/_cat/indices?format=json',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      const ESReq = http.request(options, (res) => {

        var resultData = "";

        res.on('data', (chunk) => {
          resultData += chunk;
        });

        res.on('end', () => {
          
          try {
            resultData = JSON.parse(resultData)
                         .filter((indexData) => (indexData.status === 'open' && indexData.index.startsWith(baseIndex))) // filter 
                         .sort((a, b) => (a.index > b.index));
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
      ESReq.end();           
    }
  });

  // Route PUT : create a new index, or a default one if no name
  server.route({
    path: '/api/kibana-comments-plugin/index/{name?}',
    method: 'PUT',
    config: {
      cors: {}
    },
    handler(req, reply) {

      let indexName = baseIndex;

      if (req.params.name)  
        indexName += '-' + encodeURIComponent(req.params.name);
      
      createIndex(indexName, req, reply)

    }
  });
  
  function createIndex(index, req, reply) {

    var reqBody = JSON.stringify(defaultNewIndexSettings);

    var options = {
      ...esBaseUrl,
      ...esProxyConfig,
      method: 'PUT',
      path: '/' + index,
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

      // pass the body of the PUT request 
      ESReq.write(reqBody);
      
      // finalize the request
      ESReq.end();

  }

}
