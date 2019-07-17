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
            <b-col :class="selectedLegendOption">
              <div>
                <bar-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
              <chartLegend
                :chartType="chartType"
                :sampleUseYN ="sampleUseYN"
                :chartData="selectedData"
                :legendOption="legendOption"/>
          </b-row>
          <b-row v-else-if="chartType === 'Line'">
            <b-col :class="selectedLegendOption">
              <div>
                <line-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
          </b-row>
          <b-row v-else-if="chartType === 'Pie'">
            <b-col :class="selectedLegendOption">
                <pie-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
            </b-col>
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
          </b-row>
          <b-row v-else-if="chartType === 'Polar'">
            <b-col :class="selectedLegendOption">
              <div>
                <polar-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
          </b-row>
          <b-row v-else-if="chartType === 'Radar'">
            <b-col :class="selectedLegendOption">
              <div>
                <radar-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
          </b-row>
          <b-row v-else>
            <b-col :class="selectedLegendOption">
              <div>
                <donut-chart-ext
                  v-if="loaded"
                  :sampleUseYN ="sampleUseYN"
                  :chartData="selectedData"
                  :options="selectedOption"/>
              </div>
            </b-col>
            <chartLegend
              :chartType="chartType"
              :sampleUseYN ="sampleUseYN"
              :chartData="selectedData"
              :legendOption="legendOption"/>
          </b-row>
        </div>
    </div>
</template>

<script>
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
        selectedOption: this.options,
        selectedLegendOption : 'col-lg-5 col-md-12'
      }
    },
    created(){
      //Set Sample Data for User
      if (this.sampleUseYN) {
        const sampleData = this.getSampleData();
        this.selectedData = sampleData[0];
        this.selectedOption = sampleData[1];
        console.log('legendOption', this.legendOption)
      }

      //Set new column size if user doesn't use legend option;
      if(this.legendOption == 0){
        this.selectedLegendOption = 'col-lg-12 col-md-6'
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
