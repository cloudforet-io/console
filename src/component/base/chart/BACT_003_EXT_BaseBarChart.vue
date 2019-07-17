<script>
  import { Bar } from 'vue-chartjs'
  import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips'

  export default {
    name: 'BarChartExt',
    extends: Bar,
    components:{
      CustomTooltips,
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
    data () {
      return {
      }
    },
    mounted () {
      this.renderChart( this.chartData, this.options)
    },

  }
</script>
