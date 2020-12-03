import { text, number } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PMarkdown from './PMarkdown.vue';

export default {
    title: 'Data Display/Markdown',
    component: PMarkdown,
    parameters: {
        info: {
            summary: '',
            components: { PMarkdown },
        },
        centered: { disable: true },
    },
};

export const markdown = () => ({
    components: { PMarkdown },
    template: `<div style="width: 80vw;">
                    
                </div>`,
    data() {
        return {
        };
    },
    props: {
    },
    methods: {
    },
});
