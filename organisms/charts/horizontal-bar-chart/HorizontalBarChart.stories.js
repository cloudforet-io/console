// eslint-disable-next-line import/no-extraneous-dependencies,import/extensions
import PHorizontalBarChart from './HorizontalBarChart';
import { autoProps } from '../../../../../.storybook/storybook-util';
import { sampleDataGenerator } from './HorizontalBarChart.map';

export default {
    title: 'Organisms/charts/horizontal-bar-chart',
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
