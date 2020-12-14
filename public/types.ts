import { NavigationPublicPluginStart } from '../../../src/plugins/navigation/public';

export interface KibanaCommentsAppPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KibanaCommentsAppPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
