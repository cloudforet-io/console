import { number, text, color } from '@storybook/addon-knobs/vue';
import PChartLegend from './ChartLegend.vue';
import {
    alert, safe, other1, other2, gray,
} from '@/styles/colors';

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
