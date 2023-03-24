import { defineComponent, reactive, toRefs } from 'vue';

import { mount, createLocalVue } from '@vue/test-utils';

import { useFormValidator } from '@/common/composables/form-validator';

const localVue = createLocalVue();

describe('Form Validator Composable', () => {
    const mockComponent = defineComponent({
        setup() {
            const {
                forms: { name, address },
                invalidState,
                invalidTexts,
                setForm, isAllValid,
                initForm,
            } = useFormValidator({
                name: '',
                address: '',
            }, {
                name: (val: string) => {
                    if (!val.trim()) return '이름을 작성하세요';
                    return true;
                },
                address: (val: string) => {
                    if (val.trim().length < 5) return '주소는 5자 이상 작성하세요';
                    return true;
                },
            });

            const state = reactive({
                initValueRef: null as null|HTMLElement,
            });

            const handleNameInput = (e) => {
                setForm('name', e.target.value);
            };

            const handleAddressInput = (e) => {
                setForm('address', e.target.value);
            };

            const handleClickInitiate = () => {
                if (!state.initValueRef?.textContent) return;
                console.debug('JSON.parse(state.initValueRef.textContent)', JSON.parse(state.initValueRef.textContent));
                initForm(JSON.parse(state.initValueRef.textContent));
            };

            return {
                name,
                address,
                invalidState,
                invalidTexts,
                isAllValid,
                ...toRefs(state),
                handleNameInput,
                handleAddressInput,
                handleClickInitiate,
            };
        },
        template: `
            <div>
                <input id="name-input" :invalid="invalidState.name" :value="name" @input="handleNameInput"/>
                <span id="name-invalid-text">{{invalidTexts.name}}</span>
                
                <input id="address-input" :invalid="invalidState.address" :value="address" @input="handleAddressInput"/>
                <span id="address-invalid-text">{{invalidTexts.address}}</span>
                
                <button v-if="isAllValid" id="confirm-button">Confirm</button>
                <button id="init-button" @click="handleClickInitiate">Initiate with 
                    <p ref="initValueRef" id="init-value"></p>
                </button>
            </div>
        `,

    });

    const wrapper = mount(mockComponent, { localVue });

    it('Apply initiated form values.', () => {
        const nameEl = wrapper.find('#name-input').element as HTMLInputElement;
        const addressEl = wrapper.find('#address-input').element as HTMLInputElement;
        expect(nameEl.value).toBe('');
        expect(addressEl.value).toBe('');
    });

    it('Invalid text does not affected by validation logic when the value is not changed.', () => {
        const invalidText = wrapper.find('#address-invalid-text');
        expect(invalidText.text()).toBe('');
    });

    it('Renders updated value.', async () => {
        const addressForm = wrapper.find('#address-input');
        await addressForm.setValue('서울시');
        const el = addressForm.element as HTMLInputElement;
        expect(el.value).toBe('서울시');
    });

    it('Renders invalid text after update value which is invalid.', async () => {
        expect(wrapper.find('#address-invalid-text').text()).toBe('주소는 5자 이상 작성하세요');
    });

    it('Does not render invalid text after update value which is valid.', async () => {
        const addressForm = wrapper.find('#address-input');
        await addressForm.setValue('서울시 강남구 논현로');
        const el = addressForm.element as HTMLInputElement;
        expect(el.value).toBe('서울시 강남구 논현로');

        const invalidText = wrapper.find('#address-invalid-text');
        expect(invalidText.text()).toBe('');
    });

    it('isAllValid is true if all values are valid.', async () => {
        const nameForm = wrapper.find('#name-input');
        const addressForm = wrapper.find('#address-input');

        await nameForm.setValue('완진');
        await addressForm.setValue('서울시 강남구 논현로');

        const button = wrapper.find('#confirm-button');
        expect(button.exists()).toBeTruthy();
    });

    it('isAllValid is false if one of values is invalid.', async () => {
        const addressForm = wrapper.find('#address-input');
        await addressForm.setValue('서울시');
        const el = addressForm.element as HTMLInputElement;
        expect(el.value).toBe('서울시');

        const button = wrapper.find('#confirm-button');
        expect(button.exists()).toBeFalsy();
    });

    it('Initiate form with invalid value.', async () => {
        const nameForm = wrapper.find('#name-input');
        const addressForm = wrapper.find('#address-input');
        const initButton = wrapper.find('#init-button');

        // initiate values.
        const initFormValue = { name: 'hello', address: '' };
        wrapper.find('#init-value').element.textContent = JSON.stringify(initFormValue);
        await initButton.trigger('click');

        // initiated form values are set.
        const nameEl = nameForm.element as HTMLInputElement;
        const addressEl = addressForm.element as HTMLInputElement;
        expect(nameEl.value).toBe(initFormValue.name);
        expect(addressEl.value).toBe(initFormValue.address);

        // no address invalid text is shown.
        const invalidText = wrapper.find('#address-invalid-text');
        expect(invalidText.text()).toBe('');

        // but confirm button is hidden because address is invalid internally.
        const confirmButton = wrapper.find('#confirm-button');
        expect(confirmButton.exists()).toBeFalsy();
    });

    it('Initiate form with valid value.', async () => {
        const nameForm = wrapper.find('#name-input');
        const addressForm = wrapper.find('#address-input');
        const initButton = wrapper.find('#init-button');

        // initiate values.
        const initFormValue = { name: 'hello', address: '성남시 분당구' };
        wrapper.find('#init-value').element.textContent = JSON.stringify(initFormValue);
        await initButton.trigger('click');

        // initiated form values are set.
        const nameEl = nameForm.element as HTMLInputElement;
        const addressEl = addressForm.element as HTMLInputElement;
        expect(nameEl.value).toBe(initFormValue.name);
        expect(addressEl.value).toBe(initFormValue.address);

        // no address invalid text is shown.
        const invalidText = wrapper.find('#address-invalid-text');
        expect(invalidText.text()).toBe('');

        // confirm button is shown because address is valid.
        const confirmButton = wrapper.find('#confirm-button');
        expect(confirmButton.exists()).toBeTruthy();
    });
});
