import type { App, Component, Plugin } from 'vue';
import { version } from '../package.json';
import { GoBoard } from './go-board';

/** 用于防止组件库插件被同一个应用重复安装。 */
const INSTALLED_KEY = Symbol('INSTALLED_KEY');

/** 组件库默认安装器，注册所有对外提供的组件。 */
const installer = makeInstaller([
  GoBoard,
]);

export default installer;

/** 创建支持版本信息和幂等安装的 Vue 插件。 */
function makeInstaller(components: Component[] = []) {
  /** 将组件批量注册到 Vue 应用，并跳过重复安装。 */
  const install = (app: App & { [INSTALLED_KEY]?: boolean }) => {
    if (app[INSTALLED_KEY]) { return; }

    app[INSTALLED_KEY] = true;
    components.forEach(c => app.use(c as Plugin));
  };

  return {
    version,
    install,
  };
}
