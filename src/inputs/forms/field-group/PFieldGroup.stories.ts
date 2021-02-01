import { toRefs, reactive } from '@vue/composition-api';
import { boolean, text, withKnobs } from '@storybook/addon-knobs';
import PTextInput from '@/inputs/input/PTextInput.vue';
import PFieldGroup from './PFieldGroup.vue';

export default {
    title: 'Inputs/Forms/Field Group',
    component: PFieldGroup,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5339%3A10120',
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
