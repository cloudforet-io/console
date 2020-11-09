import {
    text,
} from '@storybook/addon-knobs/vue';
import PAbbreviation from './PAbbreviation.vue';

export default {
    title: 'atoms/abbreviation',
    component: PAbbreviation,
    parameters: {
        info: {
            summary: '',
            components: { PAbbreviation },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PAbbreviation },
    props: {
        description: {
            default: text('description', 'Hello World!'),
        },
        text: {
            default: text('text', 'Hello'),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PAbbreviation v-bind="$props">
        </PAbbreviation>
    </div>`,
});
