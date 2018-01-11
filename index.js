import { resolve } from 'path';
import { initServer } from './server';
import serverRouteEsComment from './server/routes/esComment';
import serverRouteEsIndex from './server/routes/esIndex';


export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'kibana-comments-app-plugin',

    init: initServer,

    uiExports: {

      app: {
        title: 'Comments',
        description: 'A plugin to add comments to your Kibana dashboards',
        main: 'plugins/kibana-comments-app-plugin/app'
      },

      translations: [
        resolve(__dirname, './translations/es.json')
      ]


    },

    config(Joi) {

      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) {

      // Add server routes and initialize the plugin here
      const dataCluster = server.plugins.elasticsearch.getCluster('data');

      serverRouteEsComment(server, dataCluster);
      serverRouteEsIndex(server, dataCluster);
    }


  });
};
