<script>
  import { PolarArea } from 'vue-chartjs'
  export default {
    extends: PolarArea,
    name: 'PolarChartExt',
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
      this.renderChart(this.chartData,this.options)
    }
  }
</script>
