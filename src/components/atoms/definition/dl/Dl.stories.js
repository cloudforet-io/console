import { text } from '@storybook/addon-knobs/vue';
import PDl from './Dl.vue';


export default {
    title: 'atoms/definition/dl',
    component: PDl,
    parameters: {
        info: {
            summary: '',
            components: { PDl },
        },
    },
};

export const dl = () => ({
    components: { PDl },
    template: '<p-dl>dl</p-dl>',
});
