import { withKnobs } from '@storybook/addon-knobs/vue';
import PChart from '@/components/molecules/charts/PChartD3.vue';
import { autoProps } from '@sb/storybook-util';

export default {
    title: 'Molecules/chart',
    component: PChart,
    decorators: [withKnobs],
};


export const DefaultCase = () => ({
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
                this.chartData = [];
                this.loadingChartData = false;
            }, 1000);
        },
    },
});
