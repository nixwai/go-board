import type { App, Component, Plugin } from 'vue';
import { version } from '../package.json';
import { GoBoard } from './go-board';
import { GoHistoryButton } from './go-history-button';
import { GoHistorySlider } from './go-history-slider';
import { GoSave } from './go-save';

const INSTALLED_KEY = Symbol('INSTALLED_KEY');

const installer = makeInstaller([GoBoard, GoHistoryButton, GoSave, GoHistorySlider]);

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
