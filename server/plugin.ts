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
import { KibanaCommentAppPluginConfig } from '../config';
//import { Observable } from 'rxjs';
//import { first } from 'rxjs/operators';
export class KibanaCommentsAppPlugin
  implements Plugin<KibanaCommentsAppPluginSetup, KibanaCommentsAppPluginStart> {
  private readonly logger: Logger;
  //private readonly config$: Observable<KibanaCommentAppPluginConfig>;


  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    //this.config$ =  initializerContext.config.create();
  }

  //public async setup(core: CoreSetup,deps: Record<'kibana_comments_app', unknown> ) {
  public async setup(core: CoreSetup ) {
    this.logger.debug('kibana-comments-app: Setup');
    const router = core.http.createRouter();
    //const isEnabled = await this.config$.pipe(first()).toPromise();
    //console.log(this.config$);
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
