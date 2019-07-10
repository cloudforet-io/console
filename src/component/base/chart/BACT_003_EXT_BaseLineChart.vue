<script>
  import { Line } from 'vue-chartjs'
  import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'
  import { hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities'

  export default {
    name: 'lineChartExt',
    extends: Line,
    components:{
      hexToRgba,
      CustomTooltips
    },
    props: {
      chartdata: {
        type: Object,
        default: null
      },
      options: {
        type: Object,
        default: null
      }
    },
    mounted () {
      this.renderChart(this.chartdata, this.options)
    }
  }
</script>
