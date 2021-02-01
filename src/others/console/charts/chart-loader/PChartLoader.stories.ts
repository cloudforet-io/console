import {
    toRefs, reactive, watch,
} from '@vue/composition-api';
import {
    boolean,
} from '@storybook/addon-knobs';
import PChartLoader from './PChartLoader.vue';

export default {
    title: 'Others/Console/Chart Loader',
    component: PChartLoader,
    parameters: {
        info: {
            summary: '',
            components: { PChartLoader },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PChartLoader },
    props: {
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
    <div style="width: 80vw;">
        <p-chart-loader :loading="loading" style="height: 90vh; width: 90vw; border: 1px solid palevioletred;">
            <canvas ref="chartRef" style="height: 100%; width: 100%;" />
        </p-chart-loader>
    </div>`,
    setup(props, context) {
        const state = reactive({
            chartRef: null,
        });

        watch([() => state.chartRef, () => props.loading], ([ctx, loading]) => {
            if (ctx && !loading) {
                // draw chart
            }
        });

        return {
            ...toRefs(state),
        };
    },
});
