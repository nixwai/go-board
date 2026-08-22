import type { App, Component, Plugin } from 'vue';

/** 为组件附加 Vue 单组件安装能力。 */
export function withInstall<T extends Component>(comp: T) {
  (comp as T & Plugin).install = (app: App) => {
    if (comp.name) {
      app.component(comp.name, comp);
    }
  };
  return comp;
}
