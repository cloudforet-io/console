import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { LineChartData, lineChartProps } from '@/components/organisms/charts/line-chart/LineChart.toolset';
import PLineChart from './LineChart.vue';

export default {
    title: 'organisms/LineChart',
    component: PLineChart,
    parameters: {
        info: {
            summary: '',
            components: { PLineChart },
        },
        knobs: { escapeHTML: false },
    },
};

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PLineChart },
    props: getKnobProps(lineChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new LineChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div style="width: 80vw;">
        <PLineChart v-bind="$props"></PLineChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});


export const multiCase = () => ({
    components: { PLineChart },
    props: getKnobProps(lineChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new LineChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
            new LineChartData('line2', [2, 3, 7, 10, 30, 24, 39]),
            new LineChartData('line2', [1, 2, 5, 7, 8, 34, 20]),
            new LineChartData('line2', [0, 0, 0, 10, 20, 30, 54]),
        ],
        styleType: 'multi',
        loading: false,
    }),
    template: `
    <div>
        <PLineChart v-bind="$props" class="inline-block border border-secondary" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block border border-secondary" style="height: 200px; width: 300px;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block border border-secondary" style="height: 200px; width: 300px;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block border border-secondary" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLineChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
