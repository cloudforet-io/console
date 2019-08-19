<template>
  <b-col class="row">
    <template v-if="legendOption === 1">
      <template v-if="chartType === 'Bar'">
        <div v-for="(n, i) in getDataLength(selectedData)" :key="i" class="col-xs-4 col-sm-6 col-md-6 col-lg-6">
          <div class="legend">
            <div class="legend-title">
              <b>{{ selectedData.labels[i] }}</b>
            </div>
            <div>
              <template v-for="(n, p) in getDataLength(selectedData, '-')">
                <div :key="p">
                  <span :style="legendBackgroundColorLineExt(selectedData,p)"> ● </span>
                  <a v-b-tooltip.hover href="#" :title="legendLabelLineExt(selectedData, p)">
                    {{ legendDataHandler('data', selectedData, i, p) }}
                  </a>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="chartType === 'Line'">
        <div v-for="(n, i) in getDataLength(selectedData)" class="col-xs-4 col-sm-6 col-md-6 col-lg-6">
          <div class="legend">
            <div class="legend-title">
              <b>{{ selectedData.labels[i] }}</b>
            </div>
            <div>
              <template v-for="(n, p) in getDataLength(selectedData, '-')">
                <div>
                  <span :style="legendBackgroundColorLineExt(selectedData,p)"> ● </span>
                  <a v-b-tooltip.hover href="#" :title="legendLabelLineExt(selectedData, p)">
                    {{ legendDataHandler('data', selectedData, i, p) }}
                  </a>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="chartType === 'Pie'">
        <div v-for="(n, i) in getDataLength(selectedData)" class="col-xs-4 col-sm-6 col-md-6 col-lg-6">
          <div class="donut-legend" :style="legendDataHandler('style', selectedData, i)">
            <div class="donut-legend-title">
              <b>{{ selectedData.labels[i] }}</b>
            </div>
            <div class="donut-legend-data">
              <a href="#">
                {{ legendDataHandler('data', selectedData, i) }}
              </a>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="chartType === 'Radar'" />
      <template v-else-if="chartType === 'Polar'" />
      <template v-else>
        <div v-for="(n, i) in getDataLength(selectedData)" class="col-xs-4 col-sm-6 col-md-6 col-lg-6">
          <div class="legend" :style="legendDataHandler('style', selectedData, i)">
            <div class="legend-title">
              <b>{{ selectedData.labels[i] }}</b>
            </div>
            <div class="legend-data">
              <a href="#">
                {{ legendDataHandler('data', selectedData, i) }}
              </a>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template v-else-if="legendOption === 2">
      <div />
    </template>
  </b-col>
</template>
<script>
export default {
    name: 'BaseChartLegend',
    components: {},
    props: {
        chartType: {
            type: String,
            default: 'Bar'
        },
        chartData: {
            type: Object,
            default: null,
            required: true
        },
        legendOption: {

            type: Number,
            default: 0
        },
        loaded: {
            type: Boolean,
            default: true
        },
        sampleUseYN: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            selectedData: this.chartData
        };
    },
    mounted () {

    },
    methods: {
        getDataLength (chartData, type) {
            let length = 0;
            let dataSet = chartData.datasets;

            if (!this.isEmpty(type)) {
                length = dataSet.length;
            } else {
                length = (Array.isArray(dataSet)) ? dataSet[0].data.length : dataSet.data.length;
            }

            return length;
        },
        donutChartDataHandler (chartData, idx, flag) {
            let groundData = null;
            if (flag === 'style') {
                groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].backgroundColor[idx] : chartData.datasets.backgroundColor[idx];
                groundData = 'border-left:7px solid ' + groundData;
            } else if (flag === 'data') {
                groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].data[idx] : chartData.datasets.data[idx];
            } else {
        /*
           * TODO:: Please Add a default cases if needed
           */
            }
            return groundData;
        },
    /*
       *Please, add a case when graphs is newly added
       */
        legendDataHandler (flag, chartData, outerIdx, innerIdx) {
            let groundData = null;
            if (flag === 'style') {
                groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].backgroundColor[outerIdx] : chartData.datasets.backgroundColor[outerIdx];
                groundData = 'border-left:7px solid ' + groundData;
            } else if (flag === 'data') {
                this.consoleLogEnv('outer idx: ', outerIdx);
                if (this.isEmpty(innerIdx)) {
                    groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].data[outerIdx] : chartData.datasets.data[outerIdx];
                } else {
                    groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[innerIdx].data[outerIdx] : chartData.datasets.data[outerIdx];
                }
            } else {
            /**
              * TODO:: Please Add a default cases if needed
              */
            }
            return groundData;
        },
        legendLabelLineExt (chartData, idx) {
            let groundData = chartData.datasets[idx];
            return (groundData.hasOwnProperty('label')) ? groundData.label : '';
        },
        legendBackgroundColorLineExt (chartData, idx) {
            let groundData = chartData.datasets[idx];
            return (groundData.hasOwnProperty('backgroundColor')) ? 'color:' + groundData.backgroundColor + ';' : '';
        }
    }
};
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
  }

  .legend-data {
    font-size: 24px;
  }
</style>
