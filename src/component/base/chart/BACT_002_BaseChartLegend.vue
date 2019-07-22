<template>
  <b-col class="col-lg-7 col-md-12 row">
    <template v-if="legendOption === 1">
        <template v-if="chartType === 'Bar'">
          <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
            <div class="donut-legend">
              <div class="donut-legend-title">
                <b>{{selectedData.labels[i]}}</b>
              </div>
              <div class="donut-legend-data">
                <template v-for="(n, p) in getDataLength(selectedData, '-')">
                  <a href="#" v-b-tooltip.hover :title="legendLabelLineExt(selectedData, p)">
                    {{legendDataHandler('data', selectedData, i, p)}}
                  </a>
                </template>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="chartType === 'Line'">
          <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
            <div class="donut-legend">
              <div class="donut-legend-title">
                <b>{{selectedData.labels[i]}}</b>
              </div>
              <div class="donut-legend-data">
                <template v-for="(n, p) in getDataLength(selectedData, '-')">
                  <a href="#" v-b-tooltip.hover :title="legendLabelLineExt(selectedData, p)">
                    {{legendDataHandler('data', selectedData, i, p)}}
                  </a>
                </template>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="chartType === 'Pie'">
          <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
            <div class="donut-legend" :style="legendDataHandler(selectedData, i,'style')">
              <div class="donut-legend-title">
                <b>{{selectedData.labels[i]}}</b>
              </div>
              <div class="donut-legend-data">
                  <a href="#" >
                    {{legendDataHandler('data', selectedData, i)}}
                  </a>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="chartType === 'Radar'">

        </template>
        <template v-else-if="chartType === 'Polar'">

        </template>
        <template v-else>
          <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
            <div class="donut-legend" :style="legendDataHandler(selectedData, i,'style')">
              <div class="donut-legend-title">
                <b>{{selectedData.labels[i]}}</b>
              </div>
              <div class="donut-legend-data">
                <a href="#">
                  {{legendDataHandler('data', selectedData, i)}}
                </a>
              </div>
            </div>
          </div>
        </template>
    </template>
    <template v-else-if="legendOption === 2">
      <div>
        This is second option
      </div>
    </template>
  </b-col>
</template>
<script>

  import sampleChart from '@/component/base/chart/sample_data/chart_sample_data';

  export default {
    name: 'baseChartLegend',
    components: {

    },
    props: {
      chartType: {
        type: String,
        default: 'Bar',
      },
      chartData: {
        type: Object,
        default: null,
        required: true,
      },
      legendOption: {
        type: Number,
        default: 0
      },
      loaded: {
        type: Boolean,
        default: true,
      },
      sampleUseYN: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        selectedData : this.chartData,
      }
    },
    mounted(){

    },
    methods:{
      getDataLength(chartData, type){
        let length = 0;
        let dataSet = chartData.datasets

        if(!this.isEmpty(type)){
          length = dataSet.length;
        }else{
          length = (Array.isArray(dataSet)) ? dataSet[0].data.length : dataSet.data.length;
        }

        return length;
      },
      legendDataHandler(flag, chartData, outerIdx, innerIdx) {
        let groundData = null
        if (flag === 'style') {
          groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].backgroundColor[outerIdx] : chartData.datasets.backgroundColor[outerIdx];
          groundData = 'border-left:7px solid ' + groundData;
        } else if (flag === 'data') {
          this.consoleLogEnv('idx', outerIdx);
          if (this.isEmpty(innerIdx)){
            groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].data[outerIdx] : chartData.datasets.data[outerIdx];
          } else {
            groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[innerIdx].data[outerIdx] : chartData.datasets.data[outerIdx];
          }
        } else{
        /*
         * TODO:: Please Add a default cases if needed
         */
        }
          return groundData;
      },
      legendLabelLineExt(chartData, idx) {
        let groundData = chartData.datasets[idx];
        return (groundData.hasOwnProperty('label')) ? groundData.label : "";
      },
    },
  }
</script>

<style lang="scss" scoped>
  .legend {
    padding-left: 12px;
    margin: 8px 0px;
  }

  .legend-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Noto Sans', sans-serif;
  }

  .legend-data {
    font-size: 24px;
    font-family: 'Noto Sans', sans-serif;
  }
</style>
