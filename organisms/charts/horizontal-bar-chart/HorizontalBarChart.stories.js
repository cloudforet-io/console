// eslint-disable-next-line import/no-extraneous-dependencies,import/extensions
import PHorizontalBarChart from './HorizontalBarChart';
import { autoProps } from '@/setup/storybook-util';
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
    template: `<div style="display: inline-block; position: relative;
                           height: 600px; width: 600px;"
               >
                    <button style="position: absolute; 
                                    top: 100px; left: 50px;"
                            @click="refresh"
                    >refresh</button>
                    <div style="position: absolute; 
                                top: 150px; left: 50px;
                                border: 1px solid lightgray;"
                    >
                        <p-horizontal-bar-chart v-bind="$props" :data="chartData" :loading="loadingChartData"/>
                    </div>
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
