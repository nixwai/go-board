import { GoBoard, GoHistoryButton, GoSave, GoSlider } from '@go-board/design';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import App from '../App.vue';

describe('playground App', () => {
  it('展示并联动组件库当前公开的全部组件', async () => {
    const wrapper = mount(App);

    await nextTick();

    const historyButtons = wrapper.findAllComponents(GoHistoryButton);
    const clearButton = historyButtons[2]!;
    expect(wrapper.findComponent(GoSave).exists()).toBe(true);
    expect(wrapper.findComponent(GoBoard).exists()).toBe(true);
    expect(historyButtons).toHaveLength(3);
    expect(clearButton.attributes('disabled')).toBeUndefined();
    expect(wrapper.findComponent(GoSlider).exists()).toBe(true);
    expect(wrapper.get('input.go-slider').attributes('max')).toBe('0');

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.get('input.go-slider').attributes('max')).toBe('1');
    expect(wrapper.findAll('.game-status dd')[2]?.text()).toBe('2');
    expect(historyButtons[0]?.attributes('disabled')).toBeUndefined();
    expect(historyButtons[1]?.attributes('disabled')).toBeDefined();

    await historyButtons[0]?.trigger('click');
    await nextTick();

    expect((wrapper.get('input.go-slider').element as HTMLInputElement).value).toBe('0');
    expect(historyButtons[0]?.attributes('disabled')).toBeDefined();
    expect(historyButtons[1]?.attributes('disabled')).toBeUndefined();

    await clearButton.trigger('click');
    await nextTick();

    expect(wrapper.findAll('.game-status dd')[2]?.text()).toBe('1');
    expect(wrapper.get('input.go-slider').attributes('max')).toBe('0');
    expect((wrapper.get('input.go-slider').element as HTMLInputElement).value).toBe('0');
    expect(historyButtons[0]?.attributes('disabled')).toBeDefined();
    expect(historyButtons[1]?.attributes('disabled')).toBeDefined();
    expect(clearButton.attributes('disabled')).toBeUndefined();
  });
});
