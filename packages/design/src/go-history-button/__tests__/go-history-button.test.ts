import type { GoGameOptions } from '@go-board/tool';

import type { GoSaveExposed } from '../../go-save/src/go-save';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import GoSave from '../../go-save/src/go-save.vue';
import DesignInstaller, { GoHistoryButton as PublicGoHistoryButton } from '../../index';
import { GoHistoryButton as InstallableGoHistoryButton } from '../index';
import GoHistoryButton from '../src/go-history-button.vue';

function snapshot(player: 1 | -1): GoGameOptions {
  return { size: 3, player };
}

function mountSavedButton(step = -1, value = [snapshot(1), snapshot(-1), snapshot(1)]) {
  const wrapper = mount(GoSave, {
    props: { value },
    slots: { default: () => h(GoHistoryButton, { step }, { default: () => '切换历史' }) },
  });

  return {
    button: wrapper.findComponent(GoHistoryButton),
    saveApi: wrapper.vm as unknown as GoSaveExposed,
    wrapper,
  };
}

describe('goHistoryButton', () => {
  it('renders a stable native button and forwards root attributes and the default slot', () => {
    const wrapper = mount(GoHistoryButton, {
      attrs: {
        'aria-label': '后退历史',
        'class': 'custom-button',
        'data-testid': 'history-button',
        'style': 'color: red;',
        'type': 'submit',
      },
      slots: { default: '自定义内容' },
    });

    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.attributes('type')).toBe('button');
    expect(wrapper.attributes('aria-label')).toBe('后退历史');
    expect(wrapper.attributes('data-testid')).toBe('history-button');
    expect(wrapper.classes()).toContain('go-history-button');
    expect(wrapper.classes()).toContain('custom-button');
    expect(wrapper.attributes('style')).toContain('color: red');
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toBe('自定义内容');
  });

  it('moves backward by the absolute value of a negative step and disables at the boundary', async () => {
    const { button, saveApi } = mountSavedButton(-2);
    const changes: Array<{ current: number, key: string }> = [];
    saveApi.onListen((change) => {
      changes.push({ current: change.current, key: change.key });
    }, () => {});
    changes.length = 0;

    expect(button.attributes('disabled')).toBeUndefined();
    await button.trigger('click');
    await nextTick();

    expect(changes).toEqual([{ current: 0, key: 'backward' }]);
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('moves forward by a positive step and disables at the boundary', async () => {
    const { button, saveApi } = mountSavedButton(2);
    const changes: Array<{ current: number, key: string }> = [];
    saveApi.onListen((change) => {
      changes.push({ current: change.current, key: change.key });
    }, () => {});

    expect(button.attributes('disabled')).toBeDefined();
    expect(saveApi.load(0)).toBeDefined();
    changes.length = 0;
    await nextTick();
    expect(button.attributes('disabled')).toBeUndefined();

    await button.trigger('click');
    await nextTick();

    expect(changes).toEqual([{ current: 2, key: 'forward' }]);
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('clears history when step is zero and disables after the history becomes empty', async () => {
    const { button, saveApi, wrapper } = mountSavedButton(0);
    const changes: Array<{ key: string, length: number }> = [];
    saveApi.onListen((change) => {
      changes.push({ key: change.key, length: change.length });
    }, () => {});
    changes.length = 0;

    expect(button.attributes('disabled')).toBeUndefined();
    await button.trigger('click');
    await nextTick();

    expect(changes).toEqual([{ key: 'clear', length: 0 }]);
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([]);
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('renders clear as the default content when step is zero', () => {
    const wrapper = mount(GoSave, {
      props: { value: [snapshot(1)] },
      slots: { default: () => h(GoHistoryButton, { step: 0 }) },
    });

    expect(wrapper.get('button.go-history-button').text()).toBe('清空');
  });

  it('uses one-step backward navigation by default', async () => {
    const { button, saveApi } = mountSavedButton();
    const changes: number[] = [];
    saveApi.onListen((change) => {
      changes.push(change.current);
    }, () => {});
    changes.length = 0;

    await button.trigger('click');

    expect(changes).toEqual([1]);
  });

  it('disables invalid, unavailable, empty, and explicitly disabled actions', () => {
    expect(mount(GoHistoryButton, { props: { step: 1 } }).attributes('disabled')).toBeDefined();
    expect(mountSavedButton(1, []).button.attributes('disabled')).toBeDefined();
    expect(mountSavedButton(Number.NaN).button.attributes('disabled')).toBeDefined();
    expect(mountSavedButton(1.5).button.attributes('disabled')).toBeDefined();
    expect(mountSavedButton(1).button.attributes('disabled')).toBeDefined();
    expect(mountSavedButton(-1, [snapshot(1)]).button.attributes('disabled')).toBeDefined();
    expect(mount(GoHistoryButton, { props: { disabled: true } }).attributes('disabled')).toBeDefined();
  });

  it('forwards native click events and exposes the installable public entry', async () => {
    const onClick = vi.fn();
    const wrapper = mount(GoSave, {
      props: { value: [snapshot(1), snapshot(-1)] },
      slots: { default: () => h(GoHistoryButton, { onClick }, { default: () => '后退' }) },
    });

    await wrapper.get('button.go-history-button').trigger('click');

    expect(onClick).toHaveBeenCalledOnce();
    expect(InstallableGoHistoryButton.install).toBeTypeOf('function');
    expect(PublicGoHistoryButton).toBe(InstallableGoHistoryButton);

    const use = vi.fn();
    DesignInstaller.install({ use } as never);
    expect(use).toHaveBeenCalledWith(InstallableGoHistoryButton);
  });
});
