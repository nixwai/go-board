import type { GoGameOptions } from '@go-board/tool';

import type { GoSaveExposed } from '../../go-save/src/go-save';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import GoSave from '../../go-save/src/go-save.vue';
import { GoSlider as InstallableGoSlider } from '../index';
import GoSlider from '../src/go-slider.vue';

function snapshot(player: 1 | -1): GoGameOptions {
  return { size: 3, player };
}

function mountSavedSlider(value?: GoGameOptions[]) {
  const wrapper = mount(GoSave, {
    props: { value },
    slots: { default: () => h(GoSlider) },
  });

  return {
    saveApi: wrapper.vm as unknown as GoSaveExposed,
    slider: wrapper.findComponent(GoSlider),
    wrapper,
  };
}

describe('goSlider', () => {
  it('renders a range input with stable root attributes and accessibility semantics', () => {
    const wrapper = mount(GoSlider, {
      attrs: {
        'aria-label': '读档进度',
        'class': 'custom-slider',
        'data-testid': 'history-slider',
        'style': 'color: red;',
        'type': 'text',
      },
    });

    expect(wrapper.element.tagName).toBe('INPUT');
    expect(wrapper.attributes('type')).toBe('range');
    expect(wrapper.attributes('step')).toBe('1');
    expect(wrapper.attributes('aria-label')).toBe('读档进度');
    expect(wrapper.attributes('data-testid')).toBe('history-slider');
    expect(wrapper.classes()).toContain('go-slider');
    expect(wrapper.classes()).toContain('custom-slider');
    expect(wrapper.attributes('style')).toContain('color: red');
    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.attributes('min')).toBe('-1');
    expect(wrapper.attributes('max')).toBe('-1');
  });

  it('loads the selected snapshot through GoSave', async () => {
    const first = snapshot(1);
    const second = snapshot(-1);
    const { slider, wrapper } = mountSavedSlider([first, second]);

    expect(slider.attributes('min')).toBe('0');
    expect(slider.attributes('max')).toBe('1');
    expect((slider.element as HTMLInputElement).value).toBe('1');
    expect(slider.attributes('disabled')).toBeUndefined();

    const input = wrapper.get('input.go-slider');
    await input.setValue('0');

    expect((input.element as HTMLInputElement).value).toBe('0');
    expect(wrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([first, second]);
  });

  it('dynamically follows snapshot saves, clears and controlled rebuilds', async () => {
    const first = snapshot(1);
    const second = snapshot(-1);
    const { saveApi, slider, wrapper } = mountSavedSlider([first]);

    expect(slider.attributes('max')).toBe('0');
    expect((slider.element as HTMLInputElement).value).toBe('0');

    expect(saveApi.save(second)).toBe(true);
    await nextTick();
    expect(slider.attributes('max')).toBe('1');
    expect((slider.element as HTMLInputElement).value).toBe('1');

    saveApi.clear();
    await nextTick();
    expect(slider.attributes('disabled')).toBeDefined();
    expect(slider.attributes('min')).toBe('-1');
    expect(slider.attributes('max')).toBe('-1');

    await wrapper.setProps({ value: [first, second, first] });
    await nextTick();
    expect(slider.attributes('disabled')).toBeUndefined();
    expect(slider.attributes('min')).toBe('0');
    expect(slider.attributes('max')).toBe('2');
    expect((slider.element as HTMLInputElement).value).toBe('2');
  });

  it('forwards native input events and exposes the installable public entry', async () => {
    const onInput = vi.fn();
    const wrapper = mount(GoSave, {
      props: { value: [snapshot(1), snapshot(-1)] },
      slots: { default: () => h(GoSlider, { onInput }) },
    });

    await wrapper.get('input.go-slider').setValue('0');

    expect(onInput).toHaveBeenCalledOnce();
    expect(InstallableGoSlider.install).toBeTypeOf('function');
  });

  it('respects the disabled prop while history snapshots exist', () => {
    const wrapper = mount(GoSave, {
      props: { value: [snapshot(1)] },
      slots: { default: () => h(GoSlider, { disabled: true }) },
    });

    expect(wrapper.findComponent(GoSlider).attributes('disabled')).toBeDefined();
  });
});
