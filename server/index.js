import commentRoute from './routes/comment';


export function initServer(server, options) {

  const config = server.config();

  // Add server routes and initalize the plugin here
  commentRoute(server, config);

}