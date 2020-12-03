import {
    toRefs, reactive, watch,
} from '@vue/composition-api';
import {
    boolean,
} from '@storybook/addon-knobs/vue';
import { PChart } from '@/components/organisms/charts/chart-helper';
import PChartLoader from './PChartLoader.vue';

export default {
    title: 'Others/Charts/ChartLoader',
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
                new PChart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                },
                            }],
                        },
                    },
                });
            }
        });

        return {
            ...toRefs(state),
        };
    },
});
