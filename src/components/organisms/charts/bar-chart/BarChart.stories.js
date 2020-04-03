import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { barChartProps } from '@/components/organisms/charts/bar-chart/BarChart.toolset';
import { ChartData } from '@/components/organisms/charts/abstract-chart/AbstractChart.toolset';
import casual, { arrayOf } from '@/lib/casual';
import PBarChart from '@/components/organisms/charts/bar-chart/BarChart.vue';

export default {
    title: 'organisms/charts/BarChart',
    component: PBarChart,
    parameters: {
        info: {
            summary: '',
            components: { PBarChart },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PBarChart },
    props: getKnobProps(barChartProps, {
        labels: arrayOf(7, () => casual.word),
        dataset: arrayOf(2, () => new ChartData(casual.word, arrayOf(7, () => casual.integer(0)))),
        loading: false,
        stacked: true,
    }),
    template: `
    <div class="bg-white" style="width: 80vw;">
        <PBarChart v-bind="$props" ref="barChart" style="height: 250px; width: 550px;"></PBarChart>
        <button class="my-2 w-full h-12 border border-secondary text-secondary text-center" @click="onRedraw">REDRAW</button>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        const barChart = ref(null);
        return {
            barChart,
            ...toRefs(state),
            onRedraw() {
                barChart.value.initChart();
            },
        };
    },
});


export const horizontalBar = () => ({
    components: { PBarChart },
    props: getKnobProps(barChartProps, {
        type: 'horizontalBar',
        labels: ['Mon', 'Tue', 'Wed', 'Thu'],
        dataset: [
            new ChartData(casual.word, arrayOf(4, () => casual.integer(0))),
            new ChartData(casual.word, arrayOf(4, () => casual.integer(0))),
        ],
        loading: false,
        stacked: true,
    }),
    template: `
    <div class="bg-white" style="width: 80vw;">
        <PBarChart v-bind="$props" ref="barChart" style="height: 200px; width: 100%;"></PBarChart>
        <button class="my-2 w-full h-12 border border-secondary text-secondary text-center" @click="onRedraw">REDRAW</button>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        const barChart = ref(null);
        return {
            barChart,
            ...toRefs(state),
            onRedraw() {
                barChart.value.initChart();
            },
        };
    },
});
