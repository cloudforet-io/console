// eslint-disable-next-line import/no-extraneous-dependencies,import/extensions
import { text, number } from '@storybook/addon-knobs/vue';
import PBubbleChart from './BubbleChart';
import { autoProps } from '../../../../../.storybook/storybook-util';
import { sampleDataGenerator } from './BubbleChart.map';

export default {
    title: 'Organisms/charts/bubble-chart',
    component: PBubbleChart,
    parameters: {
        centered: { disable: true },
    },
};

export const leftCase = () => ({
    components: { PBubbleChart },
    props: {
        ...autoProps(PBubbleChart, [
            {
                name: 'maxHeight',
                default: number('maxHeight', 260),
            },
        ]),
    },
    template: `<div>
                    <button @click="refresh">refresh</button>
                    <div style="border: 1px solid lightgray;">
                        <p-bubble-chart v-bind="$props" :data="chartData" :loading="loadingChartData"/>
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


export const bottomCase = () => ({
    components: { PBubbleChart },
    props: {
        ...autoProps(PBubbleChart, [
            {
                name: 'legendPosition',
                default: text('legendPosition', 'bottom'),
            },
        ]),
    },
    template: `<div >
                    <button @click="refresh">refresh</button>
                    <div style="border: 1px solid lightgray;
                                display: inline-block;
                                width: 100%;"
                    >
                        <p-bubble-chart v-bind="$props" :data="chartData" :loading="loadingChartData"/>
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
