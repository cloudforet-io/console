<script>
import PChart from '@/components/molecules/charts/Chart';
import { DEFAULT_OPTIONS } from '@/components/molecules/charts/Chart.map';
import {
    HORIZONTAL_CHART_OPTIONS,
    HORIZONTAL_PRIMARY_COLORSET,
    HORIZONTAL_HOVER_COLORSET,
} from './HorizontalBarChart.map';

export default {
    name: 'PHorizontalBarChart',
    components: { PChart },
    extends: PChart,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        max() {
            return this._.max(this.data.datasets.map(dataset => this._.max(dataset.data)));
        },
        chartData() {
            return this._.merge({}, {
                datasets: this.data.datasets.map(() => ({
                    // data: [this.max],
                    backgroundColor: HORIZONTAL_PRIMARY_COLORSET[0],
                    hoverBorderColor: HORIZONTAL_HOVER_COLORSET[0],
                    borderWidth: 0,
                })),
            },
            this.data);
        },
        additionalOptions() {
            return {
                scales: {
                    xAxes: [{
                        ticks: {
                            max: this.max,
                        },
                    }],
                },
            };
        },
        chartOptions() {
            return this._.merge({},
                DEFAULT_OPTIONS,
                HORIZONTAL_CHART_OPTIONS,
                this.additionalOptions,
                this.options);
        },
        chartConfig() {
            return {
                type: this.type,
                data: this.chartData,
                options: this.chartOptions,
                plugins: this.chartPlugins,
                externals: this.chartExternals,
            };
        },
    },
    methods: {
    },
};
</script>
