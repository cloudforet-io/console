import { withKnobs, number } from '@storybook/addon-knobs/vue';
import PChart from './Chart';
import { autoProps } from '@/setup/storybook-util';
import { sampleDataGenerator } from '@/components/organisms/charts/donut-chart/DonutChartD3.map';

export default {
    title: 'Molecules/charts/chart-d3',
    component: PChart,
    decorators: [withKnobs],
};


export const SAMPLE_DATA = [
    { key: 'Bob', value: parseInt(Math.random() * 10) },
    { key: 'Robin', value: parseInt(Math.random() * 10) },
    { key: 'Anne', value: parseInt(Math.random() * 10) },
    { key: 'Mark', value: parseInt(Math.random() * 10) },
    { key: 'Joe', value: parseInt(Math.random() * 10) },
    { key: 'Eve', value: parseInt(Math.random() * 10) },
    { key: 'Mary', value: parseInt(Math.random() * 10) },
];

export const barChartSampleDataGenerator = function () {
    const start = Math.round(Math.random() * 10);
    return SAMPLE_DATA.slice(start < SAMPLE_DATA.length ? start : 0);
};


export const chart = () => ({
    components: { PChart },
    props: {
        ...autoProps(PChart),
    },
    template: `<div style="display: inline-block;">
                    <button style="position: absolute; 
                                    top: 100px; left: 50px;"
                            @click="refresh"
                    >refresh</button>
                    <div style="position: absolute; 
                                top: 150px; left: 50px;
                                border: 1px solid lightgray;
                                width: 600px;"
                    >
                        <p-chart v-bind="$props" :data="chartData" :loading="loadingChartData"/>
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
                this.chartData = barChartSampleDataGenerator();
                this.loadingChartData = false;
            }, 1000);
        },
    },
});
