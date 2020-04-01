import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { donutChartProps } from '@/components/organisms/charts/donut-chart/DonutChart.toolset';
import { ChartData } from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import PDonutChart from './DonutChart.vue';

export default {
    title: 'organisms/charts/DonutChart',
    component: PDonutChart,
    parameters: {
        info: {
            summary: '',
            components: { PDonutChart },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PDonutChart },
    props: getKnobProps(donutChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div class="text-center" style="width: 80vw;">
        <PDonutChart v-bind="$props" class="border border-gray" style="height: 170px; width: 170px;"></PDonutChart>
        <PDonutChart v-bind="$props" class="border border-gray" style="height: 150px; width: 200px;"></PDonutChart>
        <PDonutChart v-bind="$props" class="border border-gray" style="height: 250px; width: 200px;"></PDonutChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
