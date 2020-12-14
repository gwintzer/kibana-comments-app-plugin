import './index.scss';

import { KibanaCommentsAppPlugin } from './plugin';

// This exports static code and TypeScript types,
// as well as, Kibana Platform `plugin()` initializer.
export function plugin() {
  return new KibanaCommentsAppPlugin();
}
export { KibanaCommentsAppPluginSetup, KibanaCommentsAppPluginStart } from './types';
