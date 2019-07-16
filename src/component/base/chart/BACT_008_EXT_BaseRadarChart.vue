<script>
  import { Radar } from 'vue-chartjs'
  export default {
    extends: Radar,
    name: 'RadarChartExt',
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
