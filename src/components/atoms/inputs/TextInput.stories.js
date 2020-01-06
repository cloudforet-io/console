import { boolean } from '@storybook/addon-knobs/vue';
import PTextInput from '@/components/atoms/inputs/TextInput.vue';

export default {
    title: 'atoms/inputs',
    component: PTextInput,
    parameters: {
        info: {
            summary: '',
            components: { PTextInput },
        },
    },
};

export const DefaultCase = () => ({
    components: { PTextInput },
    template: `<div>
                    <p-text-input v-model="value" :disabled="disabled"></p-text-input>
                    <p>{{value}}</p>
               </div>`,
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
    },
    data() {
        return {
            value: '입력',
        };
    },


});
