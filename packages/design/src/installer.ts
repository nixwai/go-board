import type { App, Component, Plugin } from 'vue';
import { version } from '../package.json';
import { GoBoard } from './go-board';
import { GoSave } from './go-save';
import { GoSlider } from './go-slider';

const INSTALLED_KEY = Symbol('INSTALLED_KEY');

const installer = makeInstaller([GoBoard, GoSave, GoSlider]);

export default installer;

function makeInstaller(components: Component[] = []) {
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
