import { series } from 'gulp';
import { version } from '../../packages/ui/package.json';
import { delPath, publishTask, releaseTask, runBuildCommand, runBuildSteps } from '../common/tasks';
import { uiOutput, uiRoot } from './paths';

export const release = series(
  () => releaseTask('ui', uiRoot),
);

export function build() {
  return runBuildSteps('ui build', [
    { name: 'clean dist', run: () => delPath(uiOutput) },
    { name: 'bundle with tsdown', run: () => runBuildCommand('tsdown --config tsdown.config.ts') },
  ]);
}

export const publish = series(
  () => publishTask(version, uiRoot),
);
