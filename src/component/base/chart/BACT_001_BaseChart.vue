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
          <b-row>
            <b-col>
              <div class="donutCell">
                <div id="donutchart1" class="donutDiv">
                  <donut-chart-ext
                    v-if="loaded"
                    :chartdata="chartData"
                    :options="options"/>
                </div>
              </div>
            </b-col>
            <b-col>

            </b-col>
          </b-row>
        </div>
    </div>

  <!--<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
    <div class="card text-left">
      <div class="card-header">
            <template v-if="chartCardIcon">
              <i class="fa fa-globe fa-2x">
                  {{chartCardTitle}}
              </i>
            </template>
            <template v-else>
                 <h5>{{chartCardTitle}}</h5>
            </template>
          <b-dropdown class="float-right" variant="p-0" right>
            <template slot="button-content">Server</template>
              <b-dropdown-item>Region</b-dropdown-item>
              <b-dropdown-item>Storage</b-dropdown-item>
              <b-dropdown-item>Net Device</b-dropdown-item>
          </b-dropdown>

      </div>
      <div class="card-body">
        <b-row>
          <b-col>
            <div class="donutCell">
              <div id="donutchart1" class="donutDiv">
                <doughnut-chart
                  v-if="loaded"
                  :chartdata="chartdata"
                  :options="options"/>
              </div>
              <div class="centerLabel">{{seletMsg}}</div>
            </div>
          </b-col>
          <b-col>
            <div class="row">
              <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 ">
                <div class="quote subtitle">This is Sparta
                  <br>
                  <a style="font-size: 22px;" href="#">
                    <b>0</b>
                  </a>
                </div>
              </div>
              <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 ">
                <div class="quote subtitle">This is Sparta
                  <br>
                  <a style="font-size: 22px;" href="#">
                    <b>0</b>
                  </a>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 ">
                <div class="quote subtitle">This is Sparta
                  <br>
                  <a style="font-size: 22px;" href="#">
                    <b>0</b>
                  </a>
                </div>

              </div>
              <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6 ">
                <div class="quote subtitle">This is Sparta
                  <br>
                  <a style="font-size: 22px;" href="#">
                    <b>0</b>
                  </a>
                </div>
              </div>
            </div></b-col>
        </b-row>
      </div>
    </div>
  </div>-->

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
      dropdownAction(emitFunction, item){
        this.$emit(emitFunction, item)
      },

    },
  }
</script>

<style lang="scss" scoped>
</style>
