<template>
  <template v-if="legendOption === 1">
    <b-col class="col-lg-7 col-md-12 row">
      <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(selectedData)">
        <div class="legend" :style="legendDataHandler(selectedData, i,'style')">
          <div class="legend-title">
            <b>{{selectedData.labels[i]}}</b>
          </div>
          <div class="legend-data">
            <a href="#">
              {{legendDataHandler(selectedData, i,'data')}}
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
</template>
<script>

  import sampleChart from '@/component/base/chart/sample_data/chart_sample_data'

  export default {
    name: 'baseChart',
    components: {

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
      legendDataHandler(chartData, idx ,flag) {
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
