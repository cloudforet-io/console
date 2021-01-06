import { number, text } from '@storybook/addon-knobs';
import PProgressBar from '@/molecules/progress-bar/PProgressBar.vue';

export default {
    title: 'Data Display/ProgressBar',
    component: PProgressBar,
    parameters: {
        info: {
            summary: '',
            components: { PProgressBar },
        },
    },
};

export const progressBar = () => ({
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
