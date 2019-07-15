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
          <b-row v-if="chartType == 'Bar'">
            <b-col>
                <div>
                  <barChartExt
                    v-if="loaded"
                    :chartdata="chartData"
                    :options="options"/>
                </div>
            </b-col>
            <b-col>

            </b-col>
          </b-row>
          <b-row v-else-if="chartType == 'Line'">
            <b-col>
              <div>
                <line-chart-ext
                  v-if="loaded"
                  :chartdata="chartData"
                  :options="options"/>
              </div>
            </b-col>
            <b-col>

            </b-col>
          </b-row>
          <b-row v-else-if="chartType == 'Pie'">
            <b-col>
              <div>
                <pie-chart-ext
                  v-if="loaded"
                  :chartdata="chartData"
                  :options="options"/>
              </div>
            </b-col>
            <b-col>

            </b-col>
          </b-row>
          <b-row v-else>
            <b-col class="col-lg-5 col-md-12">
              <div>
                <donut-chart-ext
                  v-if="loaded"
                  :chartdata="chartData"
                  :options="options"/>
              </div>
            </b-col>
            <b-col class="col-lg-7 col-md-12 row">
              <div class="col-xs-4 col-sm-6 col-md-6 col-lg-6" v-for="(n, i) in getDataLength(chartData)">
                <div class="donut-legend" :style="donutChartDataHandler(chartData, i,'style')">
                     <div class="donut-legend-title" title="AWS KR">
                        <b>{{chartData.labels[i]}}</b>
                      </div>
                      <div class="donut-legend-data">
                        <a href="#">
                          {{donutChartDataHandler(chartData, i,'data')}}
                        </a>
                      </div>
                  </div>
              </div>

            </b-col>
          </b-row>
        </div>
    </div>
</template>

<script>
  import barChartExt from '@/component/base/chart/BACT_002_EXT_BaseBarChart.vue';
  import lineChartExt from '@/component/base/chart/BACT_003_EXT_BaseLineChart.vue';
  import pieChartExt from '@/component/base/chart/BACT_004_EXT_BasePieChart.vue';
  import donutChartExt from '@/component/base/chart/BACT_005_EXT_BaseDonutChart.vue';

  export default {
    name: 'baseChart',
    components: {
      barChartExt,
      lineChartExt,
      pieChartExt,
      donutChartExt
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
        default: 'donut'
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
      loaded: {
        type: Boolean,
        default: true,
      },
    },
    data: () => ({

    }),
    methods:{
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

        }
          return groundData;
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
