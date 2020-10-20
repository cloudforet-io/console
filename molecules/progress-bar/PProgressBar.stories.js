import { number, text } from '@storybook/addon-knobs/vue';
import PProgressBar from '@/components/molecules/progress-bar/PProgressBar.vue';

export default {
    title: 'molecules/progress-bar',
    component: PProgressBar,
    parameters: {
        info: {
            summary: '',
            components: { PProgressBar },
        },
    },
};

export const baseCase = () => ({
    components: { PProgressBar },
    template: `<p-progress-bar :percentage="percentage"
                                :style="'width: 160px;'" />`,
    props: {
        percentage: {
            default: number('percentage', 50, { min: 0 }),
        },
    },
});

export const labelCase = () => ({
    components: { PProgressBar },
    template: `<p-progress-bar :percentage="percentage"
                               :label="label"
                                :style="'width: 160px'" />`,
    props: {
        percentage: {
            default: number('percentage', 50, { min: 0 }),
        },
        label: {
            type: String,
            default: text('label', 'label'),
        },
    },
});
