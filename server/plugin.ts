import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';

import { KibanaCommentsAppPluginSetup, KibanaCommentsAppPluginStart } from './types';
import { defineRoutesIndex } from './routes/esindex';
import { defineRoutesComment } from './routes/esComment';
//import { configSchema, ConfigSchema } from '../config';
//import { Observable } from 'rxjs';

export class KibanaCommentsAppPlugin
  implements Plugin<KibanaCommentsAppPluginSetup, KibanaCommentsAppPluginStart> {
  private readonly logger: Logger;
  //private readonly config$: Observable<ConfigSchema>;


  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    //this.config$ =  initializerContext.config.create();
  }

  //public async setup(core: CoreSetup,deps: Record<'kibana_comments_app', unknown> ) {
  public async setup(core: CoreSetup ) {
    this.logger.debug('kibana-comments-app: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutesIndex(router);
    defineRoutesComment(router);
    return {};
  }

  public start(core: CoreStart) {    
    this.logger.debug('kibana-comments-app: Started');
    return {};
  }

  public stop() {}
}
