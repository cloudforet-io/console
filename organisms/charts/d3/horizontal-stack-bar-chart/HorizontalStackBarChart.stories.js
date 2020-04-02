import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';
import PHorizontalStackBarChart from '@/components/organisms/charts/d3/horizontal-stack-bar-chart/HorizontalStackBarChart.vue';

import { sampleDataGenerator } from '@/components/organisms/charts/d3/horizontal-stack-bar-chart/HorizontalStackBarChart.map';

export default {
    title: 'organisms/charts/d3/horizontal-stack-bar-chart',
    component: PHorizontalStackBarChart,
    parameters: {
        centered: { disable: true },
    },
};

export const defaultCase = () => ({
    components: { PHorizontalStackBarChart },
    props: {
        ...autoProps(PHorizontalStackBarChart),
    },
    template: `<div>
                    <button @click="refresh">refresh</button>
                    <div style="border: 1px solid lightgray;
                                display: inline-block;
                                width: 100%;"
                    >
                        <p-horizontal-stack-bar-chart v-bind="$props" 
                            :data="chartData" 
                            :loading="loadingChartData"
                            style="width: 100%;"
                            @legendClick="legendClick"
                        />
                    </div>
               </div>`,
    data() {
        return {
            chartData: {},
            loadingChartData: true,
        };
    },
    methods: {
        refresh() {
            this.loadingChartData = true;
            setTimeout(() => {
                this.chartData = sampleDataGenerator();
                this.loadingChartData = false;
            }, 1000);
        },
        legendClick: action('legendClick'),
    },
});
