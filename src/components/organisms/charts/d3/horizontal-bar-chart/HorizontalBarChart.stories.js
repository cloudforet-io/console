// eslint-disable-next-line import/no-extraneous-dependencies,import/extensions
import PHorizontalBarChart from '@/components/organisms/charts/d3/horizontal-bar-chart/HorizontalBarChart';
import { autoProps } from '@sb/storybook-util';
import { sampleDataGenerator } from '@/components/organisms/charts/d3/horizontal-bar-chart/HorizontalBarChart.map';

export default {
    title: 'Organisms/charts/d3/bar-chart',
    component: PHorizontalBarChart,
    parameters: {
        centered: { disable: true },
    },
};

export const defaultCase = () => ({
    components: { PHorizontalBarChart },
    props: {
        ...autoProps(PHorizontalBarChart),
    },
    template: `<div>
                    <button @click="refresh">refresh</button>
                    <p-horizontal-bar-chart v-bind="$props" :data="chartData" :loading="loadingChartData"/>
                </div>`,
    data() {
        return {
            chartData: [],
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
    },
});
