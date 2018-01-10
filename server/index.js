import esCommentRoute from './routes/esComment'
import esIndexRoute from './routes/esIndex'


export function initServer(server, options) {

  const config = server.config();

  // Add server routes and initalize the plugin here
  esCommentRoute(server, config);
  esIndexRoute(server, config);

}
