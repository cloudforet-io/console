<template>
    <div class="card"  >
      <div class="card-header">
        <template v-if="chartTitleData.isTitleIconUsed">
           <i :class="chartTitleData.TitleIconClass"></i>
        </template>
            {{chartTitleData.cardTitle}}
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
          <b-row v-if="chartType === 'Bar'" :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
              <div>
                <bar-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
            </b-col>
          </b-row>
          <b-row v-else-if="chartType === 'Line'" :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
              <div>
                <line-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
            </b-col>
          </b-row>
          <b-row v-else-if="chartType === 'Pie'" :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
                <pie-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
            </b-col>
          </b-row>
          <b-row v-else-if="chartType === 'Polar'" :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
              <div>
                <polar-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
            </b-col>
          </b-row>
          <b-row v-else-if="chartType === 'Radar'" :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
              <div>
                <radar-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
            </b-col>
          </b-row>
          <b-row v-else :colDefaultSizer="selectedSizer">
            <b-col :class="selectedColSizeOption.graph">
              <div>
                <donut-chart-ext
                  class="wrapper"
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <b-col :class="selectedColSizeOption.legend">
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
            </b-col>
          </b-row>
        </div>
    </div>
</template>
<script>
  const defaultCol = {
    Bar: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-7',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-5'
    },
    Line: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-8',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-4'
    },
    Pie: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-5',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-7'
    },
    Radar: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-5',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-7'
    },
    Polar: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6'
    },
    Donut: {
      graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
      legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6'
    }
  };
  /*
   * Note: Graph chart types : ['Bar', 'Line','Pie', 'Radar','Polar','Donut']
   * default option is Donut, if chartType hasn't set.
   */
  import barChartExt from '@/component/base/chart/BACT_003_EXT_BaseBarChart.vue';
  import lineChartExt from '@/component/base/chart/BACT_004_EXT_BaseLineChart.vue';
  import pieChartExt from '@/component/base/chart/BACT_005_EXT_BasePieChart.vue';
  import donutChartExt from '@/component/base/chart/BACT_006_EXT_BaseDonutChart.vue';
  import polarChartExt from '@/component/base/chart/BACT_007_EXT_BasePolarAreaChart.vue';
  import radarChartExt from '@/component/base/chart/BACT_008_EXT_BaseRadarChart.vue';
  import chartLegend from '@/component/base/chart/BACT_002_BaseChartLegend.vue';
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
      chartLegend
    },
    props: {
      colDefaultSizer: {
        type: Object,
        required: false,
        default: () => {}
      },
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
      let typeOfChart = this.chartType;
      typeOfChart = ['Bar', 'Line','Pie', 'Radar','Polar','Donut'].includes(this.chartType) ? this.chartType :  'Donut';
      return {
          selectedSizer: this.colDefaultSizer,
          selectedData : this.chartData,
          selectedOption: this.options,
          selectedColSizeOption : defaultCol[typeOfChart]
      }
    },
    created() {
      /* SAMPLE_USE_YN:
       * This is a flag whether Use Sample Data
       */
      if (this.sampleUseYN) {
        const sampleData = this.getSampleData();
        this.selectedData = sampleData[0];
        this.selectedOption = sampleData[1];
        console.log('legendOption', this.legendOption)
      };
      /* LEGEND_OPTION:
       * Note: when flag == 0, No legend for chart.
       */
      if(this.legendOption == 0){
        this.selectedColSizeOption = {
          graph: 'col-xs-12 col-sm-12 col-md-12 col-lg-12',
          legend: 'col-xs-0 col-sm-0 col-md-0 col-lg-0'
        };
      } else if(!this.isEmpty(this.colDefaultSizer)) {
        this.selectedColSizeOption = this.colDefaultSizer;
      }
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

    },
  }
</script>

<style lang="scss" scoped>
  .wrapper {
    position: relative;
    max-height: 500px;
    height: 40%;
    width: 100%;
  }
</style>
