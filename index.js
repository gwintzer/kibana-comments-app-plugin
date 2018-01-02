import { resolve } from 'path';
import { initServer } from './server';


export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'kibana-comments-app-plugin',

    init: initServer,

    uiExports: {
      
      injectDefaultVars(server, options) {
        const varsToInject = options;
        varsToInject.elasticsearchUrl = server.config().get('elasticsearch.url');
        return varsToInject;
      },

      app: {
        title: 'Comments',
        description: 'A plugin to add comments to your Kibana dashboards',
        main: 'plugins/kibana-comments-app-plugin/app'
      },
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ],
      

      hacks: [
        'plugins/kibana-comments-app-plugin/hack'
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },
    

  });
};
