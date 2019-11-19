import { text } from '@storybook/addon-knobs/vue';
import PLabel from './Label.vue';


export default {
    title: 'atoms/legends/label',
    component: PLabel,
    parameters: {
        info: {
            summary: '',
            components: { PLabel },
        },
    },
};

export const label = () => ({
    components: { PLabel },
    template: '<p-label>this is label</p-label>',
});
