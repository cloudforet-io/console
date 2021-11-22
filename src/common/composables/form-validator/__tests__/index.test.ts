import { mount, createLocalVue } from '@vue/test-utils';
import CompositionApi, { defineComponent } from '@vue/composition-api';
import { useFormValidator } from '@/common/composables/form-validator';

const localVue = createLocalVue();
localVue.use(CompositionApi);

describe('Form Validator Composable', () => {
    const mockComponent = defineComponent({
        template: `
            <div>
                <input id="name-input" :invalid="invalidState.name" :value="name" @input="handleNameInput"/>
                <span id="name-invalid-text">{{invalidTexts.name}}</span>
                
                <input id="address-input" :invalid="invalidState.address" :value="address" @input="handleAddressInput"/>
                <span id="address-invalid-text">{{invalidTexts.address}}</span>
                
                <button v-if="isAllValid" id="confirm-button">Confirm</button>
            </div>
        `,
        setup() {
            const {
                forms: { name, address },
                invalidState,
                invalidTexts,
                setForm, isAllValid,
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

            const handleNameInput = (e) => {
                setForm('name', e.target.value);
            };

            const handleAddressInput = (e) => {
                setForm('address', e.target.value);
            };

            return {
                name,
                address,
                invalidState,
                invalidTexts,
                isAllValid,
                handleNameInput,
                handleAddressInput,
            };
        },

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
});
