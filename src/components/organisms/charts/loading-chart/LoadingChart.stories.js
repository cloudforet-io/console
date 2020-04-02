import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { ChartData, loadingChartProps } from '@/components/organisms/charts/loading-chart/LoadingChart.toolset';
import casual, { arrayOf } from '@/lib/casual';
import { chartTimestampFormatter } from '@/lib/util';
import PLoadingChart from '@/components/organisms/charts/loading-chart/LoadingChart.vue';

export default {
    title: 'organisms/LoadingChart',
    component: PLoadingChart,
    parameters: {
        info: {
            summary: '',
            components: { PLoadingChart },
        },
        knobs: { escapeHTML: false },
    },
};

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PLoadingChart },
    props: getKnobProps(loadingChartProps, {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        dataset: [
            new ChartData('line1', [12, 19, 3, 5, 2, 3, 9]),
        ],
        loading: false,
    }),
    template: `
    <div style="width: 80vw;">
        <PLoadingChart v-bind="$props"></PLoadingChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});


export const multiCase = () => ({
    components: { PLoadingChart },
    props: getKnobProps(loadingChartProps, {
        labels: arrayOf(7, () => chartTimestampFormatter(casual._timestamp())),
        dataset: [
            new ChartData('line1', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line2', arrayOf(7, () => casual.integer(0, 500))),
            new ChartData('line3', arrayOf(7, () => casual.integer(0, 500))),
        ],
        styleType: 'multi',
        loading: false,
        max: 500,
    }),
    template: `
    <div>
        <PLoadingChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLoadingChart>
        <PLoadingChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PLoadingChart>
        <PLoadingChart v-bind="$props" class="inline-block" style="height: 200px; width: 300px;"></PLoadingChart>
        <PLoadingChart v-bind="$props" class="inline-block" style="min-height: 200px; min-width: 300px; height: 30%; width: 50%;"></PLoadingChart>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);
        return {
            ...toRefs(state),
        };
    },
});
