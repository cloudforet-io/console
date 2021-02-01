import { shallowMount } from '@vue/test-utils';
import PTextInput from '../PTextInput.vue';

describe('text-input', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = shallowMount(PTextInput);
    });
    test('1', () => {
        expect(wrapper.vm.msg).toBe('Hello Jest!');
    });
});
