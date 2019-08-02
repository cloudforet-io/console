<script>
import { PolarArea } from 'vue-chartjs';
export default {
    name: 'PolarChartExt',
    extends: PolarArea,
    props: {
        chartData: {
            type: Object,
            default: null
        },
        options: {
            type: Object,
            default: null
        }
    },
    mounted () {
        this.renderChart(this.chartData, this.options);
    }
};
</script>
