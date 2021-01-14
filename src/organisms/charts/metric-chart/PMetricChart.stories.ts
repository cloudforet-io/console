import {
    toRefs, reactive,
} from '@vue/composition-api';
import { boolean, object, text } from '@storybook/addon-knobs';
import PMetricChart from '@/organisms/charts/metric-chart/PMetricChart.vue';
import casual, { arrayOf } from '@/util/casual';

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


export const defaultCase = () => ({
    components: { PMetricChart },
    props: {
        timezone: {
            default: text('timezone', 'UTC'),
        },
        title: {
            default: text('title', 'Title'),
        },
        error: {
            default: boolean('error', false),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p-metric-chart v-bind="$props" 
                            :dataset="dataset"
                            :labels="labels"
                            :colors="colors"
                            :loading="false"
            ></p-metric-chart>
        </div>`,
    setup(props, context) {
        const state = reactive({
            dataset: {
                a: arrayOf(7, () => casual.integer(0, 100)),
                b: arrayOf(7, () => casual.integer(0, 100)),
            },
            labels: arrayOf(7, () => casual.word),
            colors: arrayOf(7, () => casual.rgb_hex),
        });

        return {
            ...toRefs(state),
        };
    },
});
