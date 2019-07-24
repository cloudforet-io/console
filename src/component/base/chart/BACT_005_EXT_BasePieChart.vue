<script>
import { Pie } from 'vue-chartjs';
export default {
  name: 'PieChartExt',
  components: {
  },
  extends: Pie,
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
