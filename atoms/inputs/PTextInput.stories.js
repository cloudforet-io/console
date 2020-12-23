import { boolean } from '@storybook/addon-knobs/vue';
import PTextInput from '@/components/atoms/inputs/PTextInput.vue';

export default {
    title: 'Inputs/Input',
    component: PTextInput,
    parameters: {
        info: {
            summary: '',
            components: { PTextInput },
        },
    },
};

export const input = () => ({
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
    setup() {
        return {
            value: '입력',
        };
    },
});

export const placeHolder = () => ({
    components: { PTextInput },
    template: `<div>
                    <p-text-input v-model="value" :disabled="disabled" placeholder="this is placeholder"></p-text-input>
                    <p>{{value}}</p>
               </div>`,
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
    },
    setup() {
        return {
            value: '',
        };
    },

});
