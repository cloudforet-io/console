import { boolean, withKnobs } from '@storybook/addon-knobs';
import PTextInput from '@/inputs/input/PTextInput.vue';

export default {
    title: 'Inputs/Input',
    component: PTextInput,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5191%3A2',
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
