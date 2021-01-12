import { toRefs, reactive } from '@vue/composition-api';
import { boolean, text } from '@storybook/addon-knobs';
import PTextInput from '@/atoms/inputs/PTextInput.vue';
import PFieldGroup from './PFieldGroup.vue';

export default {
    title: 'Inputs/FieldGroup',
    component: PFieldGroup,
    parameters: {
        info: {
            summary: '',
            components: { PFieldGroup },
        },
    },
};


export const fieldGroup = () => ({
    components: { PFieldGroup, PTextInput },
    template: `
        <PFieldGroup 
          :label="label" 
          :help-text="helpText" 
          :invalid-text="invalidText"
          :invalid="invalid"
          :valid-text="validText"
          :valid="valid"
          :required="required"
        >
            <template v-slot:default="{invalid}">
            <p-text-input
              v-model="value"
              class="block appearance-none w-full mb-1 text-base px-2 leading-normal bg-white text-grey-darker border border-grey rounded-sm"
              :disabled="disabled"
              :class="{
                'is-invalid':invalid
              }"
            />
            </template>
        </PFieldGroup>`,
    props: {
        label: {
            default: text('label', 'label'),
        },
        helpText: {
            default: text('helpText', 'this is help'),
        },
        invalidText: {
            type: String,
            default: text('invalidText', 'error'),
        },
        invalid: {
            default: boolean('invalid', false),
        },
        validText: {
            type: String,
            default: text('validText', 'good'),
        },
        valid: {
            default: boolean('valid', false),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        required: {
            default: boolean('required', false),
        },
    },
    setup(props, context) {
        const state = reactive({
            value: '',
        });
        return {
            ...toRefs(state),
        };
    },
});
