<template>
  <div class="animated fadeIn">
    <div class="col-xs-12 p-0">
      <b-card>
        <div class="row">
          <div class="col-xs-6 col-sm-6 col-md-6 col-lg-12" style="display: block;">
            <h4 class="page-header m-t-0"><i class="fa fa-hashtag m-r-5"></i>Base Information</h4>
            <hr>
            <b-container fluid>
              <b-row>
                <b-col class='psColtitleleft' sm="2">
                  ID
                </b-col>
                <b-col class='psColtitleRight' sm="4">
                  abcdef
                </b-col>
                <b-col class='psColtitleleft' sm="2">
                  Name
                </b-col>
                <b-col class='psColtitleRight' sm="4">
                  abcdef
                </b-col>
                <b-col class='psColtitleleft' sm="2">
                  Created
                </b-col>
                <b-col class='psColtitleRight' sm="4">
                  abcdef
                </b-col>
                <b-col class='psColtitleleft' sm="2">

                </b-col>
                <b-col class='psColtitleRight' sm="4">

                </b-col>
              </b-row>
            </b-container>
            <hr>
            <h4 class="page-header"><i class="fa fa-tag m-r-5"></i> Tag</h4>
            <div class="warning-panel" style="display: block;">No tags.</div>
          </div>

        </div>
      </b-card>
      <br>
    </div>
    <div class="col-xs-12 p-0">
      <div class="row">
        <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-3">
          <b-card header-tag="header">
            <div slot="header" class="mb-0"><i class='fa fa-server fa-2x' style="float:left"></i>
              <h4>&nbsp &nbsp Server</h4> </div>
            <h2 align="right"><a href="#">27</a></h2>
          </b-card>
        </b-col>
        <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-3">
          <b-card header-tag="header">
            <div slot="header" class="mb-0"><i class='fa fa-database fa-2x' style="float:left"></i>
              <h4>&nbsp &nbsp Volume</h4> </div>
            <h2 align="right"><a href="#">2</a></h2>
          </b-card>
        </b-col>
        <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-3">
          <b-card header-tag="header">
            <div slot="header" class="mb-0"><i class='fa fa-star fa-2x' style="float:left"></i>
              <h4>&nbsp &nbsp Project</h4> </div>
            <h2 align="right"><a href="#">17</a></h2>
          </b-card>
        </b-col>
        <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-3">
          <b-card header-tag="header">
            <div slot="header" class="mb-0"><i class='fa fa-users fa-2x' style="float:left"></i>
              <h4>&nbsp &nbsp Member</h4> </div>
            <h2 align="right"><a href="#">0</a></h2>
          </b-card>
        </b-col>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <div class="card text-left">
          <div class="card-header">
            <i class="fa fa-globe"></i>Item by Region
            <b-dropdown class="float-right" variant="p-0" right>
              <template slot="button-content">Server</template>
              <b-dropdown-item>Region</b-dropdown-item>
              <b-dropdown-item>Storage</b-dropdown-item>
              <b-dropdown-item>Net Device</b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="brand-card-body">
            <div>
              <GChart style="width: 100%; height: 400px;"
                      :settings="{packages: ['corechart']}"
                      :data="chartData"
                      :options="options"
                      :createChart="(el, google) => new google.visualization.PieChart(el)"
              />
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <div class="card text-left">
          <div class="card-header">
            <i class="fa fa-globe"></i>Item by Region
            <b-dropdown class="float-right" variant="p-0" right>
              <template slot="button-content">Server</template>
              <b-dropdown-item>Region</b-dropdown-item>
              <b-dropdown-item>Storage</b-dropdown-item>
              <b-dropdown-item>Net Device</b-dropdown-item>
            </b-dropdown>
          </div>
          <div class="brand-card-body">
            <div>
              <GChart style="width: 100%; height: 400px;"
                      :settings="{packages: ['corechart']}"
                      :data="chartData"
                      :options="options"
                      :createChart="(el, google) => new google.visualization.PieChart(el)"
              />
            </div>
            <div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const sampleData1 = [
    ['Task', 'Hours per Day'],
    ['Work',     11],
    ['Eat',      2],
    ['Commute',  2],
    ['Watch TV', 2],
    ['Sleep',    7]
  ];

  const sampleData2 = [
    ['Task', 'Hours per Day'],
    ['Work',     11],
    ['Eat',      2],
    ['Commute',  2],
    ['Watch TV', 2],
    ['Sleep',    7]
  ];

  import BaseTabs from '@/components/base/tabs/BATA_001_BaseTabs'
  import BaseModal from '@/components/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/components/base/tree/BATR_001_BaseTree'
  import {api} from '@/setup/api'

  import { GChart } from 'vue-google-charts'

  export default {
    name: 'ProjectSummary',
    components: {
      GChart
    },
    data() {
      return {
        options : {
          pieHole: 0.7,
          pieSliceTextStyle: {
            color: 'black',
          },
          legend: 'none'
        },
        chartData: [
          ['Effort', 'Amount given'],
          ['My all',     12],
        ]
      }
    },
    props:{

    },
    mounted: function () {

    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>

  .psColtitleleft{
    text-align: right;
    font-weight: 900;
    color: #777777
  }

  .psColtitleRight{
    text-align: left;
  }

</style>
