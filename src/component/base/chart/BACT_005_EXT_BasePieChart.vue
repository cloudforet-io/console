<script>
  import { Pie } from 'vue-chartjs'
  export default {
    name: 'pieChartExt',
    extends: Pie,
    components: {
    },
    props: {
      chartData: {
        type: Object,
        default: null
      },
      options: {
        type: Object,
        default: null
      },
    },
    mounted () {
      this.renderChart(this.chartData, this.options)
    },
  }
</script>
