import { action } from '@storybook/addon-actions';
import { toRefs, computed } from '@vue/composition-api';
import ServerState from '@/views/dashboard/modules/ServerState';
import { autoProps } from '@/setup/storybook-util';
import { sampleDataGenerator } from '@/components/organisms/charts/bubble-chart/BubbleChart.map';
import casual from '@/views/dashboard/models/dashboard-model';

export default {
    title: 'view/dashboard/server-state',
    component: ServerState,
};

export const mockPage = () => ({
    components: { ServerState },
    props: {
        ...autoProps(ServerState),
    },
    template: `<div >
                    <button @click="refresh">refresh</button>
                    <div style="border: 1px solid lightgray;
                                display: inline-block;
                                width: 278px;"
                    >
                        <ServerState v-bind="$props" :data="chartData" :loading="loadingChartData"/>
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
                this.chartData = casual.serverStates;
                this.loadingChartData = false;
            }, 1000);
        },
    },
});
