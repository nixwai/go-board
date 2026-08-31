import type { GoGameOptions } from '@go-board/tool';
import type { GoSaveContext } from '../src/go-save';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, inject, nextTick } from 'vue';
import GoSave from '../src/go-save.vue';
import { GO_SAVE_EVENT_KEYS, GO_SAVE_INJECTION_KEY } from '../src/keys';

function snapshot(player: 1 | -1): GoGameOptions {
  return { size: 3, player, layout: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] };
}

function createChild(onContext: (context: GoSaveContext) => void) {
  return defineComponent({
    setup() {
      const context = inject(GO_SAVE_INJECTION_KEY);
      if (!context) { throw new Error('GoSave context is missing'); }
      onContext(context);
      return () => h('div', {
        'data-current': context.current,
        'data-length': context.length,
      });
    },
  });
}

describe('goSave', () => {
  it('provides history operations and reactive history properties to its default slot', async () => {
    let context!: GoSaveContext;
    const first = snapshot(1);
    const second = snapshot(-1);
    const Child = createChild((value) => { context = value; });
    const wrapper = mount(GoSave, {
      props: { snapshots: [first, second], currentPosition: 0 },
      slots: { default: () => h(Child) },
    });

    expect(wrapper.find('[data-current]').attributes('data-current')).toBe('0');
    expect(wrapper.find('[data-current]').attributes('data-length')).toBe('2');
    expect(context.snapshot).toBe(first);
    expect(context.snapshots).toEqual([first, second]);
    expect(context.backward()).toBeUndefined();
    expect(context.forward()).toBe(second);
    expect(context.current).toBe(1);
    expect(context.load(0)).toBe(first);
    expect(context.current).toBe(0);

    const third = snapshot(1);
    expect(context.save(third)).toBe(true);
    expect(context.snapshot).toBe(third);
    expect(context.length).toBe(2);
    expect(context.snapshots).toEqual([first, third]);
    await nextTick();
    expect(wrapper.find('[data-current]').attributes('data-current')).toBe('1');
    expect(wrapper.find('[data-current]').attributes('data-length')).toBe('2');
  });

  it('notifies registered listeners with operation keys and history data', () => {
    let context!: GoSaveContext;
    const changes: Array<{ key: string, current: number, length: number }> = [];
    let unregister!: () => void;
    const Child = createChild((value) => {
      context = value;
      value.onListen((change) => {
        changes.push({ key: change.key, current: change.current, length: change.length });
      }, (remove) => { unregister = remove; });
    });
    mount(GoSave, { slots: { default: () => h(Child) } });

    const first = snapshot(1);
    const second = snapshot(-1);
    expect(context.save(first)).toBe(true);
    expect(context.load(0)).toBe(first);
    expect(context.forward()).toBeUndefined();
    expect(context.save(second)).toBe(true);
    expect(context.backward()).toBe(first);
    context.clear();

    expect(changes.map(change => change.key)).toEqual([
      GO_SAVE_EVENT_KEYS.save,
      GO_SAVE_EVENT_KEYS.load,
      GO_SAVE_EVENT_KEYS.save,
      GO_SAVE_EVENT_KEYS.backward,
      GO_SAVE_EVENT_KEYS.clear,
    ]);
    expect(changes).toEqual([
      { key: 'save', current: 0, length: 1 },
      { key: 'load', current: 0, length: 1 },
      { key: 'save', current: 1, length: 2 },
      { key: 'backward', current: 0, length: 2 },
      { key: 'clear', current: -1, length: 0 },
    ]);

    unregister();
    expect(context.save(first)).toBe(true);
    expect(changes).toHaveLength(5);
  });

  it('keeps caller-provided snapshot references without implicit deep copies', () => {
    let context!: GoSaveContext;
    const Child = createChild((value) => { context = value; });
    mount(GoSave, { slots: { default: () => h(Child) } });

    const saved = snapshot(1);
    expect(context.save(saved)).toBe(true);
    expect(context.snapshot).toBe(saved);
    saved.layout![0]![0] = 1;
    expect(context.snapshot?.layout?.[0]?.[0]).toBe(1);
  });
});
