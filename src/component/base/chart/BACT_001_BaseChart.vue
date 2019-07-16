<template>
    <div class="card">
      <div class="card-header">
        <template v-if="chartTitleData.isTitleIconUsed">
          <span class="d-inline-block">
           <i :class="chartTitleData.TitleIconClass"></i>
          </span>
        </template>
          <span class="d-inline-block">
            <h4>&nbsp&nbsp {{chartTitleData.cardTitle}}</h4>
          </span>
        <template v-if="chartTitleData.isDropdownUsed">
          <b-dropdown class="float-right" variant="p-0" right>
            <template slot="button-content">{{chartTitleDownData.dropDownTitle}}</template>
              <b-dropdown-item v-for="(opt, idx) in chartTitleDownData.dropDownDataArr"
                               :data="opt"
                               :key="idx"
                               @click="dropdownAction(opt.optionClickMethod, opt)">{{opt.optionTitle}}
              </b-dropdown-item>
          </b-dropdown>
        </template>
      </div>
        <div class="card-body">
          <b-row v-if="chartType === 'Bar'">
            <b-col class="col-lg-5 col-md-12">
                <div>
                  <barChartExt
                    v-if="loaded"
                    :sampleUseYN ="sampleUseYN"
                    :chartData="selectedData"
                    :options="selectedOption"/>
                </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">
              <b-col>

              </b-col>
            </template>
            <template v-else>

            </template>
          </b-row>
          <b-row v-else-if="chartType === 'Line'">
            <b-col class="col-lg-5 col-md-12">
              <div>
                <line-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">
              <b-col>

              </b-col>
            </template>
            <template v-else>

            </template>
          </b-row>
          <b-row v-else-if="chartType === 'Pie'">
            <b-col class="col-lg-5 col-md-12 col-lg-12">
              <div>
                <pie-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">
              <b-col>

              </b-col>
            </template>
            <template v-else>

            </template>
          </b-row>
          <b-row v-else-if="chartType === 'Polar'">
            <b-col class="col-lg-5 col-md-12 col-lg-12">
              <div>
                <polar-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">
              <b-col>

              </b-col>
            </template>
            <template v-else>

            </template>
          </b-row>
          <b-row v-else-if="chartType === 'Radar'">
            <b-col class="col-lg-5 col-md-12 col-lg-12">
              <div>
                <radar-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">
              <b-col>

              </b-col>
            </template>
            <template v-else>

            </template>
          </b-row>
          <b-row v-else>
            <b-col class="col-lg-5 col-md-12 ">
              <div>
                <donut-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <template v-if="legendOption === 1">
              <b-col class="col-lg-7 col-md-12 row">
                <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
                  <div class="donut-legend" :style="donutChartDataHandler(selectedData, i,'style')">
                    <div class="donut-legend-title">
                      <b>{{selectedData.labels[i]}}</b>
                    </div>
                    <div class="donut-legend-data">
                      <a href="#">
                        {{donutChartDataHandler(selectedData, i,'data')}}
                      </a>
                    </div>
                  </div>
                </div>
              </b-col>
            </template>
            <template v-else-if="legendOption === 2">

            </template>
            <template v-else>

            </template>
          </b-row>
        </div>
    </div>
</template>

<script>
  import barChartExt from '@/component/base/chart/BACT_003_EXT_BaseBarChart.vue';
  import lineChartExt from '@/component/base/chart/BACT_004_EXT_BaseLineChart.vue';
  import pieChartExt from '@/component/base/chart/BACT_005_EXT_BasePieChart.vue';
  import donutChartExt from '@/component/base/chart/BACT_006_EXT_BaseDonutChart.vue';
  import polarChartExt from '@/component/base/chart/BACT_007_EXT_BasePolarAreaChart.vue';
  import radarChartExt from '@/component/base/chart/BACT_008_EXT_BaseRadarChart.vue';
  import sampleChart from '@/component/base/chart/sample_data/chart_sample_data';

  export default {
    name: 'baseChart',
    components: {
      barChartExt,
      lineChartExt,
      pieChartExt,
      donutChartExt,
      polarChartExt,
      radarChartExt,
    },
    props: {
      chartTitleData:{
        type: Object,
        required: true,
        default: {
          isTitleIconUsed: false,
          TitleIconClass: 'fa fa-globe fa-2x',
          cardTitle: 'This is Default Title',
          isDropdownUsed: false,
        }
      },
      chartTitleDownData:{
        type: Object,
        required: false,
        default: () => ({
          dropDownTitle:'Sample Title',
          dropDownDataArr: [ { optionId: 'id1', optionTitle: 'sample title1', optionClickMethod : 'optionAction1' },
                             { optionId: 'id2', optionTitle: 'sample title2', optionClickMethod : 'optionAction2' }
                           ]
        })
      },
      chartType: {
        type: String,
        default: 'Bar',
      },
      chartData: {
        type: Object,
        default: null,
        required: true,
      },
      options: {
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
        selectedOption: this.options
      }
    },
    created(){
      if (this.sampleUseYN) {
        const sampleData = this.getSampleData();
        this.selectedData = sampleData[0];
        this.selectedOption = sampleData[1];
      }
    },
    mounted(){

    },
    methods:{
      getSampleData() {
        let returnVal = null;
        if(this.chartType === 'Bar') {
          returnVal = sampleChart.barChartSample();
        } else if(this.chartType === 'Line') {
          returnVal = sampleChart.lineChartSample();
        } else if(this.chartType === 'Pie') {
          returnVal = sampleChart.pieChartSample();
        } else if(this.chartType === 'Polar') {
          returnVal = sampleChart.polarAreaChartSample();
        } else if(this.chartType === 'Radar') {
          returnVal = sampleChart.radarChartSample();
        } else {
          returnVal = sampleChart.donutChartSample();
        }
        return returnVal;
      },
      dropdownAction(emitFunction, item) {
        this.$emit(emitFunction, item)
      },
      getDataLength(chartData){
        let dataSet = chartData.datasets
        return (Array.isArray(dataSet)) ? dataSet[0].data.length : dataSet.data.length;
      },
      donutChartDataHandler(chartData, idx ,flag) {
        let groundData = null
        if (flag === 'style') {
          groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].backgroundColor[idx] : chartData.datasets.backgroundColor[idx];
          groundData = 'border-left:7px solid ' + groundData;
        } else if(flag === 'data') {
          groundData = (Array.isArray(chartData.datasets)) ? chartData.datasets[0].data[idx] : chartData.datasets.data[idx];
        } else{
        /*
         * TODO:: Please Add a default cases if needed
         */
        }
          return groundData;
      },
      setLegendOption(legendProp) {

      },
    },
  }
</script>

<style lang="scss" scoped>
  .donut-legend {
    padding-left: 12px;
    margin: 8px 0px;
  }

  .donut-legend-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Noto Sans', sans-serif;
  }

  .donut-legend-data {
    font-size: 24px;
    font-family: 'Noto Sans', sans-serif;
  }
</style>
