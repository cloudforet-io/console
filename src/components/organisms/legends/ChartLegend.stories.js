import { number, text, color } from '@storybook/addon-knobs/vue';
import {
    safe,
} from '@/styles/colors';
import PChartLegend from './ChartLegend.vue';

import { autoProps } from '../../../../.storybook/storybook-util';


export default {
    title: 'organisms/legends/ChartLegend',
    component: PChartLegend,
};


export const base = () => ({
    components: { PChartLegend },
    props: {
        ...autoProps(PChartLegend, [
            {
                name: 'text',
                default: text('text', 'contents'),
            },
            {
                name: 'iconColor',
                default: color('iconColor', safe),
            },
            {
                name: 'count',
                default: number('count', 7),
            },

        ]),
    },
    template: '<p-chart-legend  v-bind="$props"/>',
});
