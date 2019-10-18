import { withKnobs, number } from '@storybook/addon-knobs/vue';
import BaseChart from './BACT_009_BaseChart.vue';

export default {
    title: 'Base/BaseChart',
    component: BaseChart,
    decorators: [withKnobs]
};
let dataset = {
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
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
    }]
};

export const chart = () => ({
    components: { BaseChart },
    props: {
        width: {
            default: number('width', 500)
        }
    },
    template: '<BaseChart ref="chart" :width="width" :height="height" :data="chartData" v-if="reload"></BaseChart>',
    data() {
        return {
            height: 300,
            chartData: dataset,
            reload: true
        };
    }
});

export const line = () => ({
    components: { BaseChart },
    template: '<BaseChart ref="chart" type="line" :width="width" :height="height" :data="chartData"></BaseChart>',
    data() {
        return {
            width: 500,
            height: 300,
            chartData: dataset
        };
    }
});

export const bar = () => ({
    components: { BaseChart },
    template: '<BaseChart ref="chart" type="bar" :width="width" :height="height" :data="chartData"></BaseChart>',
    data() {
        return {
            width: 500,
            height: 300,
            chartData: dataset
        };
    }
});

export const radar = () => ({
    components: { BaseChart },
    template: '<BaseChart ref="chart" type="radar" :width="width" :height="height" :data="chartData"></BaseChart>',
    data() {
        return {
            width: 500,
            height: 300,
            chartData: dataset
        };
    }
});
