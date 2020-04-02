import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { ChartData } from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import casual, { arrayOf } from '@/lib/casual';
import { chartTimestampFormatter } from '@/lib/util';
import PLineChart from '@/components/organisms/charts/line-chart/LineChart.vue';
import { lineChartProps } from '@/components/organisms/charts/line-chart/LineChart.toolset';

export default {
    title: 'organisms/charts/LineChart',
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
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div style="width: 80vw;">
        <PLineChart v-bind="$props" ref="lineChart"></PLineChart>
        <button class="my-2 w-full h-12 border border-secondary text-secondary text-center" @click="onRedraw">REDRAW</button>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        const lineChart = ref(null);
        return {
            lineChart,
            ...toRefs(state),
            onRedraw() {
                lineChart.value.initChart();
            },
        };
    },
});


export const multiCase = () => ({
    components: { PLineChart },
    props: getKnobProps(lineChartProps, {
        labels: arrayOf(7, () => chartTimestampFormatter(casual._timestamp())),
        dataset: [
            new ChartData('line1', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line2', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line3', arrayOf(7, () => casual.integer(0, 500))),
        ],
        styleType: 'multi',
        loading: false,
        max: 500,
        gradient: false,
    }),
    template: `
    <div class="bg-white" style="width: 80vw;">
        <PLineChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PLineChart>
        <PLineChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLineChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        return {
            ...toRefs(state),
        };
    },
});
