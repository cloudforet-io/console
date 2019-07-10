<template>
    <div class="card">
      <div class="card-header">
        <template v-if="chartTitleSetData.isTitleIconUsed">
          <span class="d-inline-block">
           <i :class="chartTitleSetData.TitleIconClass"></i>
          </span>
        </template>
          <span class="d-inline-block">
            <h4>&nbsp&nbsp {{chartTitleSetData.cardTitle}}</h4>
          </span>
        <template v-if="chartTitleDownSetData.isDropdownUSed">
          <b-dropdown class="float-right" variant="p-0" right>
            <template slot="button-content">{{chartTitleDownSetData.dropDownTitle}}</template>
              <b-dropdown-item v-for="(opt) in chartTitleDownSetData.dropDownDataArr"
                               @click="dropdownAction(opt.optionClickMethod, opt)">{{opt.optionTitle}}
              </b-dropdown-item>
          </b-dropdown>
        </template>
      </div>
      <div class="card-body">

        <div class="text-muted">intro</div>
        <h4 class="card-title">Heading</h4>
        <p class="card-text"> a description that takes a couple of lines. It may have two or three lines of text and they'll wrap like this.</p>
        <ul class="list-inline text-muted">
          <li class="list-inline-item"><i class="fa fa-tag"></i> tag 1</li>
          <li class="list-inline-item"><i class="fa fa-tag"></i> tag 2</li>
        </ul>
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
      chartTitleSetData:{
        type: Object,
        required: true,
        default: {
          isTitleIconUsed: false,
          TitleIconClass: 'fa fa-globe fa-2x',
          cardTitle: 'This is Default Title',
          isDropdownUSed: false,
        }
      },
      chartTitleDownSetData:{
        type: Object,
        required: true,
        default: {
          isDropdownUSed: true,
          dropDownTitle:'Sample Title',
          dropDownDataArr: [
            {optionTitle: 'sample title1',
             optionClickMethod : 'optionAction1'
            },{optionTitle: 'sample title2',
              optionClickMethod : 'optionAction1'
            }
          ]
        }
      },
      dropOption: {
        type: Object,
        default: {
          isUsed: false,
        },
        required: true,
      },
      chartData: {
        type: Object,
        default: null
      },
      options: {
        type: Object,
        default: null
      },
      loaded: {
        type: Boolean,
        default: false
      },
      seletMsg: {
        type: String,
        default: 'Title'
      }
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
