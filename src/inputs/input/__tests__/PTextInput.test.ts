import { mount } from '@vue/test-utils';
import PTextInput from '../PTextInput.vue';

describe('text-input', () => {
    it('renders span', () => {
        const wrapper = mount(PTextInput);

        const span = wrapper.find('span');
        expect(span.exists()).toBe(true);
    });
});
