import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { metricChartProps } from '@/components/organisms/charts/metric-chart/PMetricChart.toolset';
import casual, { arrayOf } from '@/components/util/casual';
import PMetricChart from '@/components/organisms/charts/metric-chart/PMetricChart.vue';

export default {
    title: 'organisms/charts/MetricChart',
    component: PMetricChart,
    parameters: {
        info: {
            summary: '',
            components: { PMetricChart },
        },
        knobs: { escapeHTML: false },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PMetricChart },
    props: getKnobProps(metricChartProps, {
        dataset: {
            a: arrayOf(7, () => casual.integer(0, 100)),
            b: arrayOf(7, () => casual.integer(0, 100)),
        },
        labels: arrayOf(7, () => casual.word),
        colors: arrayOf(7, () => casual.rgb_hex),
    }),
    template: `
        <div style="width: 80vw;">
            <PMetricChart v-bind="$props"></PMetricChart>
        </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
