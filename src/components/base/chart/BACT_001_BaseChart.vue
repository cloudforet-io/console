<template>
  <table class="Charts">
    <tr>
      <td class="donutCell">
        <div id="donutchart1" class="donutDiv">
          <GChart style="width: 100%; height: 100%;"
                  :settings="{packages: [chartType]}"
                  :data="chartData"
                  :options="options"
                  :createChart="(el, google) => new google.visualization.PieChart(el)"
          /></div>
        <div class="centerLabel">{{seletMsg}}</div>
      </td>
      <td class="chartGrid">
        <slot name="itemPanel">

        </slot>
      </td>
    </tr>
  </table>
</template>

<script>
  export default {
    name: 'BaseChart',
    props: {
      chartType:{
        type:String,
        default: () => 'corechart'
      },
      chartData: {
        type: Array,
        default: () => []
      }
    },
    data () {
      return {

      }
    },
    computed: {
    },
    created () {
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>
  .chartGrid{
    border-left: 1px solid #eee;
  }

  .donutCell
  {
    position: relative;
  }

  .donutDiv
  {
    width: 256px;
    height: 256px;
  }

  .centerLabel
  {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 256px;
    line-height: 256px;
    text-align: center;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 36px;
    color: maroon;
  }
</style>
