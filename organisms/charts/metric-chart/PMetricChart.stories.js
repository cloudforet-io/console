import {
    toRefs, reactive,
} from '@vue/composition-api';
import { getKnobProps } from '@sb/storybook-util';
import casual, { arrayOf } from '@/components/util/casual';
import PMetricChart from '@/components/organisms/charts/metric-chart/PMetricChart.vue';

export default {
    title: 'Others/Charts/MetricChart',
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
    props: getKnobProps({
        loading: {
            type: Boolean,
            default: true,
        },
        dataset: {
            type: Object,
            default: () => ({}),
        },
        labels: {
            type: Array,
            default: () => [],
        },
        colors: {
            type: Array,
            default: () => [],
        },
        unit: {
            type: Object,
            default: () => ({ x: 'Timestamp', y: 'Count' }),
            validator(unit) {
                return typeof unit.x === 'string' && typeof unit.y === 'string';
            },
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        title: {
            type: String,
            default: '',
        },
        error: {
            type: Boolean,
            default: false,
        },
    }, {
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
