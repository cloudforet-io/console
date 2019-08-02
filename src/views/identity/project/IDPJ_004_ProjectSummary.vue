<template>
  <div class="animated fadeIn">
    <div class="row">
      <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
        <b-card class="base summary border-top-0">
          <h5 class="page-header m-t-0">
            <i class="fa fa-hashtag m-r-5" />&nbsp;&nbsp; Base Information
          </h5>
          <hr>
          <b-container fluid>
            <dl class="dl-horizontal m-b-0 row">
              <div v-for="(info, idx) in summaryBaseInfo" :key="idx" class="col-sm-12 col-md-6 summary">
                <dt>{{ info.title }}</dt>
                <dd>{{ info.contents }}</dd>
                <span class="copy-clipboard"
                      title="Copy to Clipboard"
                      @click="CopyToClipboard(info.contents)"
                >
                  <i class="fa fa-copy" />
                </span>
              </div>
            </dl>
          </b-container>
          <h5 class="page-header">
            <i class="fa fa-tag m-r-5" />&nbsp;&nbsp; Tag
          </h5>
          <hr>
          <b-container fluid>
            <dl class="dl-horizontal m-b-0 row">
              <div v-for="tag in summaryBaseTag" class="col-sm-12 col-md-6 summary">
                <dt title="Tag Key">
                  {{ tag.tagKey }}
                </dt>
                <dd title="Tag Value">
                  {{ tag.tagValue }}
                </dd>
                <span v-b-tooltip.hover
                      class="copy-clipboard"
                      title="Copy to Clipboard" @click="CopyToClipboard(tag.tagValue)"
                >
                  <i class="fa fa-copy" />
                </span>
              </div>
            </dl>
          </b-container>
        </b-card>
      </b-col>
    </div>
    <div class="col-xs-12 p-0">
      <div class="row">
        <b-col v-for="asset in summaryAsset"
               :class="colSelector(summaryAsset.length)"
        >
          <!-- <div class="card base">
            <div class="card-header">
              <i :class="asset.icon" /> {{ asset.asKey }}
            </div>
            <div class="card-body">
              <h2 align="right">
                <a :href="asset.linkURL">{{ asset.assetValue }}</a>
              </h2>
            </div>
          </div> -->
          <b-row align-h="between" align-v="center" class="assets">
            <b-col cols="8">
              <h6>
                <i :class="asset.icon" />&nbsp;&nbsp; {{ asset.asKey }}
              </h6>
            </b-col>
            <b-col cols="4" class="text-right">
              <h6>
                <a :href="asset.linkURL">{{ asset.assetValue }}</a>
              </h6>
            </b-col>
          </b-row>
        </b-col>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <BaseChart
          :chart-type="'Line'"
          :chart-title-data="sampleTitleData1"
          :chart-data="chartDataAndOption1.data"
          :col-default-sizer="selectedChartCol"
          :legend-option="1"
          :options="chartDataAndOption2.option"
          :sample-use-y-n="true"
        />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <BaseChart
          :chart-data="chartDataAndOption2.data"
          :chart-title-data="sampleTitleData2"
          :chart-title-down-data="sampleDropData2"
          :chart-type="'else'"
          :legend-option="1"
          :options="chartDataAndOption2.option"
          :sample-use-y-n="false"
          @displayAll="displayAll"
          @displayVM="displayVM"
          @displayOS="displayOS"
        />
      </div>
    </div>
  </div>
</template>

<script>
import BaseTabs from '@/components/base/tab/BATA_001_BaseTab';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';

import { api } from '@/setup/api';

const BaseChart = () => import('@/components/base/charts/BACT_001_BaseChart.vue');
export default {
    name: 'ProjectSummary',
    components: {
        BaseChart
    },
    props: {},
    data () {
        return {
            selectedChartCol: {
                graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6'
            },
            sampleTitleData1: null,
            sampleTitleData2: null,
            sampleDropData2: null,
            chartDataAndOption1: null,
            chartDataAndOption2: null,
            summaryBaseInfo: null,
            summaryBaseTag: null,
            summaryAsset: null
        };
    },
    mounted: function () {

  },
  created: function () {
    this.setDummnyData();
    this.$bus.$on('treeSelectedEvent', this.setDummnyData);
  },
  beforeDestroy: function () {
    this.$bus.$off('treeSelectedEvent');
  },
  methods: {
    CopyToClipboard (text) {
      this.selectToCopyToClipboard(text);
    },
    displayAll: function (params) {
      this.sampleDropData2.dropDownTitle = params.optionTitle;
    },
    displayVM: function (params) {
      this.sampleDropData2.dropDownTitle = params.optionTitle;
    },
    displayOS: function (params) {
      this.sampleDropData2.dropDownTitle = params.optionTitle;
    },
    setDummnyData: function () {
        /*
        * Here's Data Set for Current Page
        * 1. sampleBaseInformation : Base Information Data
        * 2. sampleBaseTag : tags sample Data
        * 3. sampleAsset : Data for Asset
        */

      const sampleBaseInformation = [
        { title: 'ID', contents: 'pg-6bc72053' },
        { title: 'Name', contents: 'AWS KR' },
        { title: 'Created', contents: '2019-05-12' },
        { title: '', contents: '' }
      ];

      const sampleBaseTag = [
        { tagKey: 'Japan', tagValue: 'Tokyo' },
        { tagKey: 'South Korea', tagValue: 'Seoul' },
        { tagKey: 'USA', tagValue: 'Washington D.C.' },
        { tagKey: 'Canada', tagValue: 'Ottawa' },
        { tagKey: 'Austria', tagValue: 'Vienna' },
        { tagKey: 'Germany', tagValue: 'Berlin' },
        { tagKey: 'G.B', tagValue: 'London' },
        { tagKey: 'France', tagValue: 'Paris' }
      ];

      const sampleAsset = [
        { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', icon: 'fa fa-server' },
        { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', icon: 'fa fa-database' },
        { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', icon: 'fa fa-server' },
        { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', icon: 'fa fa-database' },
        { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', icon: 'fa fa-server' },
        { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', icon: 'fa fa-database' },
        { asKey: 'Project', assetValue: 17, linkURL: 'www.bing.com', icon: 'fa fa-star' },
        { asKey: 'Member', assetValue: 0, linkURL: 'www.naver.com', icon: 'fa fa-users' }
      ];

      const chartTitleSampleData1 = {
        isTitleIconUsed: true,
        TitleIconClass: 'fa fa-globe',
        cardTitle: 'Server By Region',
        isDropdownUSed: false
      };

      const chartTitleSampleData2 = {
        isTitleIconUsed: true,
        TitleIconClass: 'fa fa-tag',
        cardTitle: 'Server by Type',
        isDropdownUsed: true
      };

      const chartTitleDropSampleData2 = {
        dropDownTitle: 'All Types',
        dropDownDataArr: [
          { optionId: 'AT', optionTitle: 'All Types', optionClickMethod: 'displayAll' },
          { optionId: 'VM', optionTitle: 'VM', optionClickMethod: 'displayVM' },
          { optionId: 'OS', optionTitle: 'OS', optionClickMethod: 'displayOS' }
        ]
      };

      const chartDataAndOption1 = {
        data: {
          labels: ['S.Korea', 'USA', 'Russia', 'Italy', 'Mexico', 'China'],
          datasets: [
            {
              backgroundColor: this.getGraphColor(true, false, 6),
              data: [40.2, 120, 80.7, 10.9, 114, 121.02]
            }
          ]
        },
        option: {
          responsive: true,
          maintainAspectRatio: true,
          legend: {
            display: false
          }
        }
      };

      let Colors = this.getGraphColor(true, false, 3);
      const chartDataAndOption2 = {
        data: {
          labels: ['AWS', 'MS Azure', 'Google cloud'],
          datasets: [{
            data: [12, 4, 8],
            backgroundColor: Colors,
            hoverBackgroundColor: Colors
          }]
        },
        option: {
          tooltipUseYN: 1,
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          }
        }
      };

      this.summaryBaseInfo = sampleBaseInformation;
      this.summaryBaseTag = sampleBaseTag;
      this.summaryAsset = sampleAsset;
      this.sampleTitleData1 = chartTitleSampleData1;
      this.sampleTitleData2 = chartTitleSampleData2;
      this.sampleDropData2 = chartTitleDropSampleData2;
      this.chartDataAndOption1 = chartDataAndOption1;
      this.chartDataAndOption2 = chartDataAndOption2;
    }
  }
};
</script>

<style lang="scss" scoped>
  .summary > dt {
    float: left;
    width: 160px;
    overflow: hidden;
    clear: left;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    font-weight: 900;
    color: #777777
  }

  .summary > dd {
    float: left;
    margin-left: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 20px;
    color: #000000
  }

  .donutGrid {
    border-left: 1px solid #eee;
  }

  .donutCell {
    position: relative;
  }

  .donutDiv {
    width: 256px;
    height: 256px;
  }

  .centerLabel {
    position: absolute;
    left: 2px;
    top: 2px;
    width: 256px;
    line-height: 256px;
    text-align: center;
    font-family: 'Noto Sans', sans-serif;
    font-size: 36px;
    color: maroon;
  }

  .quote {
    border-left: 0.5em solid #415ee1;
    padding: 0.5em;
    padding-left: 12px;
    margin: 8px 0px;
    margin-left: 10px;
  }

  .copy-clipboard i {
    visibility: hidden;
    padding: 0px 3px 0px 10px;
    cursor: pointer
  }

  .copy-clipboard:hover i {
    visibility: visible;
  }

  .card.base {
    margin-top: 10px;
    margin-bottom: 10px;
    &.summary {
      margin-top: 0;
      border-top-left-radius: 0px !important;
    }
  }

  .assets {
    padding: 15px;
    margin: 15px 0;
    border: 1px solid lighten($blue, 30%);
    border-radius: $border-radius;
    a {
      text-decoration: underline;
    }
  }
</style>
