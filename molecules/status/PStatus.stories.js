import { select, text, color } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { safe } from '@/components/styles/colors';

export default {
    title: 'Data Display/Status',
    component: PStatus,
};

export const status = () => ({
    components: { PStatus },
    props: {
        ...autoProps(PStatus, [
            {
                name: 'text',
                default: text('text', 'enabled'),
            },
            {
                name: 'iconColor',
                default: color('iconColor', safe),
                knobType: 'color',
            },
            {
                name: 'textColor',
                default: color('textColor', safe),
                knobType: 'color',
            },
        ]),

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
