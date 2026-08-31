import type { GoGameOptions } from '@go-board/tool';
import type { GoSaveContext } from '../src/go-save';

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, inject, nextTick } from 'vue';
import GoSave from '../src/go-save.vue';
import { GO_SAVE_EVENT, GO_SAVE_INJECTION } from '../src/keys';

function snapshot(player: 1 | -1): GoGameOptions {
  return { size: 3, player, layout: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] };
}

function createChild(onContext: (context: GoSaveContext) => void) {
  return defineComponent({
    setup() {
      const context = inject(GO_SAVE_INJECTION);
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
      props: { value: [first, second] },
      slots: { default: () => h(Child) },
    });

    expect(wrapper.find('[data-current]').attributes('data-current')).toBe('1');
    expect(wrapper.find('[data-current]').attributes('data-length')).toBe('2');
    expect(context.snapshot).toBe(second);
    expect(context.snapshots).toEqual([first, second]);
    expect(context.backward()).toBe(first);
    expect(context.current).toBe(0);
    expect(context.forward()).toBe(second);
    expect(context.current).toBe(1);
    expect(context.load(0)).toBe(first);
    expect(context.current).toBe(0);

    const third = snapshot(1);
    expect(context.save(third)).toBe(true);
    expect(context.snapshot).toBe(third);
    expect(context.length).toBe(2);
    expect(context.snapshots).toEqual([first, third]);
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([first, third]);
    await nextTick();
    expect(wrapper.find('[data-current]').attributes('data-current')).toBe('1');
    expect(wrapper.find('[data-current]').attributes('data-length')).toBe('2');
  });

  it('updates internal history when the controlled value changes', async () => {
    let context!: GoSaveContext;
    const first = snapshot(1);
    const second = snapshot(-1);
    const Child = createChild((value) => { context = value; });
    const wrapper = mount(GoSave, {
      props: { value: [first] },
      slots: { default: () => h(Child) },
    });

    const changes: string[] = [];
    context.onListen((change) => { changes.push(change.key); }, () => {});
    expect(changes).toEqual([GO_SAVE_EVENT.REBUILD]);

    await wrapper.setProps({ value: [second] });
    expect(context.snapshot).toBe(second);
    expect(context.length).toBe(1);
    expect(changes).toEqual([GO_SAVE_EVENT.REBUILD, GO_SAVE_EVENT.REBUILD]);
    await nextTick();
    expect(wrapper.find('[data-current]').attributes('data-length')).toBe('1');
  });

  it('replays the latest history data when a listener registers after operations', () => {
    let context!: GoSaveContext;
    const Child = createChild((value) => { context = value; });
    mount(GoSave, { slots: { default: () => h(Child) } });

    const saved = snapshot(1);
    expect(context.save(saved)).toBe(true);

    let change!: { key: string, current: number, length: number, snapshot?: GoGameOptions };
    context.onListen((value) => { change = value; }, () => {});

    expect(change).toMatchObject({
      key: GO_SAVE_EVENT.REBUILD,
      current: 0,
      length: 1,
      snapshot: saved,
    });
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
      GO_SAVE_EVENT.REBUILD,
      GO_SAVE_EVENT.SAVE,
      GO_SAVE_EVENT.LOAD,
      GO_SAVE_EVENT.SAVE,
      GO_SAVE_EVENT.BACKWARD,
      GO_SAVE_EVENT.CLEAR,
    ]);
    expect(changes).toEqual([
      { key: 'rebuild', current: -1, length: 0 },
      { key: 'save', current: 0, length: 1 },
      { key: 'load', current: 0, length: 1 },
      { key: 'save', current: 1, length: 2 },
      { key: 'backward', current: 0, length: 2 },
      { key: 'clear', current: -1, length: 0 },
    ]);

    unregister();
    expect(context.save(first)).toBe(true);
    expect(changes).toHaveLength(6);
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
