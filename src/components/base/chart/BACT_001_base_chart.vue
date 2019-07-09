<template>
  <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
    <div class="card text-left">
      <div class="card-header">
        <i class="fa fa-globe fa-2x"> Servers by Region</i>

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
  </div>

</template>

<script>
  import DoughnutChart from './BACT_002_EXT_base_chart.vue'

  export default {
    name: 'baseChart',
    components: {
      DoughnutChart
    },
    props: {
      chartdata: {
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
    /*async mounted () {
      this.loaded = false
      try {
        //const { userlist } = await fetch('/api/userlist')
        //this.chartdata = userlist
        this.loaded = true
      } catch (e) {
          console.error(e)
      }
    }*/
  }
</script>

<style lang="scss" scoped>
</style>
