/* eslint-disable camelcase */
import {
    object, text,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import md from '@/components/organisms/dynamic-layout/PDynamicLayout.md';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';

export default {
    title: 'Others/Dynamic/DynamicLayout/html',
    component: PDynamicLayout,
    parameters: {
        notes: md,
    },
};

const data = '<html><body><h1>My First Heading</h1></body></html>';


export const defaultCase = () => ({
    components: { PDynamicLayout },
    template: `
        <div class="w-screen bg-white">
            <PDynamicLayout v-bind="$props" type="html" @init="onInit" />
        </div>
    `,
    props: {
        name: {
            default: text('name', 'HTML Type!'),
        },
        options: {
            default: object('options', {}),
        },
        data: {
            default: text('data', data),
        },
    },
    setup() {
        return {
            onInit: action('init'),
        };
    },
});
