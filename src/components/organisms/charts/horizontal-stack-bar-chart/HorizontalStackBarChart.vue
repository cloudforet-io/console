<script>
import PChart from '@/components/molecules/charts/Chart';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';

const HORIZONTAL_CHART_OPTIONS = {
    scales: {
        xAxes: [{
            display: false,
            stacked: true,
            scaleLabel: { display: false },
            gridLines: {
                offsetGridLines: true,
            },
            ticks: {
                beginAtZero: true,
            },
        }],
        yAxes: [{
            categoryPercentage: 1,
            barPercentage: 1,
            barThickness: 24,
            categorySpacing: 0,
            display: false,
            stacked: true,
            scaleLabel: { display: false },
            gridLines: {
                offsetGridLines: true,
            },
        }],
    },
    legend: {
        display: false,
    },
};

export default {
    name: 'p-horizontal-stack-bar-chart',
    components: { PChart },
    extends: PChart,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        max: {
            type: Number,
            default: null,
        },
    },
    computed: {
        chartData() {
            return this._.merge({}, {
                labels: [],
                datasets: this.data.datasets.map((dataset, i) => ({
                    backgroundColor: PRIMARY_COLORSET[i],
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
                this.max ? this.additionalOptions : {},
                this.options);
        },
    },
    methods: {
        testClick() {
            this.$router.push('/identity');
        },
        testHover(e) {
            console.log('hover', e)
        }
    },
};
</script>
