<template>
  <div class="animated fadeIn">
    <div class="col-xs-12 p-0">
      <b-card>
        <div class="row">
          <div class="col-xs-6 col-sm-6 col-md-6 col-lg-12" style="display: block;">
            <h4 class="page-header m-t-0">
              <i class="fa fa-hashtag m-r-5">
              </i>&nbsp&nbsp Base Information</h4>
            <hr>
            <b-container fluid>
                <dl class="dl-horizontal m-b-0 row">
                  <div class="col-sm-12 col-md-6 summary" v-for="info in summaryBaseInfo">
                    <dt>{{info.title}}</dt>
                    <dd>{{info.contents}}</dd>
                  </div>
                </dl>
            </b-container>
            <h4 class="page-header">
              <i class="fa fa-tag m-r-5"></i>&nbsp&nbsp Tag
            </h4>
            <hr>
            <b-container fluid>
              <dl class="dl-horizontal m-b-0 row">
                <div class="col-sm-12 col-md-6 summary" v-for="tag in summaryBaseTag">
                  <dt title="Tag Key">{{tag.tagKey}}</dt>
                  <dd title="Tag Value">{{tag.tagValue}}</dd>
                </div>
              </dl>
            </b-container>
          </div>

        </div>
      </b-card>
      <br>
    </div>
    <div class="col-xs-12 p-0">
      <div class="row">
        <b-col :class="colSelector(summayAsset.length)"
               v-for="asset in summayAsset">
          <b-card header-tag="header">
            <div slot="header" class="mb-0"><i :class='asset.icon' style="float:left"></i>
              <h4>&nbsp &nbsp {{asset.asKey}}</h4></div>
            <h2 align="right"><a :href="asset.linkURL">{{asset.assetValue}}</a></h2>
          </b-card>
        </b-col>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <BaseDonutChart>
        </BaseDonutChart>
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <BaseDonutChart>
        </BaseDonutChart>
      </div>
    </div>
  </div>
</template>

<script>
/*
 * Here's Data Set for Current Page
 * 1. sampleBaseInformation : Base Information Data
 * 2. sampleBaseTag : tag sample Data
 */

  const sampleBaseInformation = [
    {title: 'ID', contents: 'pg-6bc72053'},
    {title: 'Name', contents: 'AWS KR'},
    {title: 'Created', contents: '2019-05-12'},
    {title: '', contents: ''}
    ];

  const sampleBaseTag = [
    {tagKey: 'Japan', tagValue: 'Tokyo'},
    {tagKey: 'South Korea', tagValue: 'Seoul'},
    {tagKey: 'USA', tagValue: 'Washington D.C.'},
    {tagKey: 'Canada', tagValue: 'Ottawa'},
    {tagKey: 'Austria', tagValue: 'Vienna'},
    {tagKey: 'Germany', tagValue: 'Berlin'},
    {tagKey: 'G.B', tagValue: 'London'},
    {tagKey: 'France', tagValue: 'Paris'}
  ];

const sampleAsset = [
  {asKey: 'Server',   assetValue: 27, linkURL: 'www.google.com', icon: 'fa fa-server fa-2x'},
  {asKey: 'Volume', assetValue: 2,    linkURL: 'www.yahoo.co.jp', icon: 'fa fa-database fa-2x'},
  {asKey: 'Project', assetValue: 17,  linkURL: 'www.bing.com', icon: 'fa fa-star fa-2x'},
  {asKey: 'Member', assetValue: 0,    linkURL: 'www.naver.com', icon: 'fa fa-users fa-2x'},
];

  const sampleData1 = [
    ['Task', 'Hours per Day'],
    ['Work', 11],
    ['Eat', 2],
    ['Commute', 2],
    ['Watch TV', 2],
    ['Sleep', 7]
  ];

  import BaseTabs from '@/component/base/tab/BATA_001_BaseTab'
  import BaseModal from '@/component/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/component/base/tree/BATR_001_BaseTree'
  import {api} from '@/setup/api'

  import {GChart} from 'vue-google-charts'

  const BaseChart = () => import('@/component/base/chart/BACT_001_BaseChart.vue')
  export default {
    name: 'ProjectSummary',
    components: {
      GChart,
      BaseChart
    },
    data() {
      return {
        summaryBaseInfo: sampleBaseInformation,
        summaryBaseTag: sampleBaseTag,
        summayAsset: sampleAsset,
        seletMsg: 'This is center MSG',
        percent: 0,

        options: {
          pieHole: 0.7,
          pieSliceText: 'none',
          legend: {position: 'none'},
          tooltip: {text: 'percentage'},
          tooltip: {textStyle: {fontSize: 12}},
          animation: {
            duration: 1000,
            easing: 'in',
            startup: true
          }
        },
        chartData: sampleData1
      }
    },
    props: {},
    mounted: function () {

    },
    methods: {
      colSelector: (dataLength) => {
        const colNumber = Math.round(12/dataLength);
          return 'col-xs-6 col-sm-6 col-md-6 col-lg-'+ colNumber+' col';
      }
    }
  }
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

  .summary > dd{
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
    font-family: Arial, Helvetica, sans-serif;
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

</style>
