import type { GoGameOptions, GoLayout } from '@go-board/tool';
import type { GoSaveContext } from '../../go-save/src/go-save';
import type { GoBoardExposed } from '../src/go-board';

import { mount } from '@vue/test-utils';
import { h } from 'vue';
import GoSave from '../../go-save/src/go-save.vue';
import GoBoard from '../src/go-board.vue';

export function emptyLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }).fill(0)) as GoLayout;
}

export function exposed(wrapper: ReturnType<typeof mount>): GoBoardExposed {
  return wrapper.vm as unknown as GoBoardExposed;
}

export function lastEmittedArgument(wrapper: ReturnType<typeof mount>, event: string): unknown {
  const emittedEvents = wrapper.emitted(event) ?? [];

  return emittedEvents[emittedEvents.length - 1]?.[0];
}

export function mountSavedBoard(init: GoGameOptions, value?: GoGameOptions[]) {
  const saveWrapper = mount(GoSave, {
    props: { value },
    slots: { default: () => h(GoBoard, { init }) },
  });

  return {
    boardWrapper: saveWrapper.findComponent(GoBoard),
    saveApi: saveWrapper.vm as unknown as GoSaveContext,
    saveWrapper,
  };
}
