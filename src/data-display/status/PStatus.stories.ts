import {
    select, text, color, boolean, number, withKnobs,
} from '@storybook/addon-knobs';
import PStatus from '@/data-display/status/PStatus.vue';
import { safe } from '@/styles/colors';
import { themes } from '@/data-display/status/config';

export default {
    title: 'Data Display/Status',
    component: PStatus,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124044',
        },
    },
};

export const status = () => ({
    components: { PStatus },
    props: {
        icon: {
            default: text('icon', 'fas fa-ad'),
        },
        text: {
            default: text('text', ''),
        },
        textColor: {
            default: color('textColor', safe),
        },
        iconColor: {
            default: color('iconColor', safe),
        },
        theme: {
            default: select('theme', themes, null),
        },
        disableIcon: {
            default: boolean('disableIcon', false),
        },
        lottie: {
            default: text('lottie', ''),
        },
        iconSize: {
            default: number('iconSize', 1),
        },
    },
    template: '<p-status  v-bind="$props"/>',
});

export const iconStatus = () => ({
    components: { PStatus },
    template: `<div>
                    <p-status icon="aws-ec2" iconColor="#60B731" text="enabled"/><br>
                </div>`
    ,
});
