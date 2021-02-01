import { number, text, withKnobs } from '@storybook/addon-knobs';
import PProgressBar from '@/data-display/progress-bar/PProgressBar.vue';

export default {
    title: 'Data Display/Progress Bar',
    component: PProgressBar,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124064',
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

export const labeled = () => ({
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
