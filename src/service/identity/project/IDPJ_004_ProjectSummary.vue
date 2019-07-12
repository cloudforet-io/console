<template>
  <div class="animated fadeIn" >
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
        <b-col :class="colSelector(summaryAsset.length)"
               v-for="asset in summaryAsset">
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
        <BaseChart
          :chartTitleData="sampleTitleData1"
          :chartData="chartDataAndOption1.data"
          :options="chartDataAndOption2.option"
        />
      </div>
      <div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">
        <BaseChart
          :chartTitleData="sampleTitleData2"
          :chartTitleDownData="sampledropData2"
          :chartData="chartDataAndOption2.data"
          :options="chartDataAndOption2.option"
          @displayAll="displayAll"
          @displayVM="displayVM"
          @displayOS="displayOS"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import BaseTabs from '@/component/base/tab/BATA_001_BaseTab'
  import BaseModal from '@/component/base/modal/BAMO_001_BaseModal'
  import BaseTree from '@/component/base/tree/BATR_001_BaseTree'
  import {api} from '@/setup/api'

  const BaseChart = () => import('@/component/base/chart/BACT_001_BaseChart.vue')
  export default {
    name: 'ProjectSummary',
    components: {
      BaseChart
    },
    data() {
      return {
        percent: 0,
        seletMsg: 'This is center MSG',
        sampleTitleData1: null,
        sampleTitleData2: null,
        sampledropData2: null,
        chartDataAndOption1: null,
        chartDataAndOption2: null,
        summaryBaseInfo: null,
        summaryBaseTag: null,
        summaryAsset: null,
      }
    },
    props: {

    },
    mounted: function () {

    },
    created: function () {
      this.setDummnyData();
      this.$bus.$on('treeSelectedEvent', this.setDummnyData)
    },
    beforeDestroy: function(){
      this.$bus.$off('treeSelectedEvent');
    },
    methods: {
      colSelector: (dataLength) => {
        const colNumber = Math.round(12/dataLength);
          return 'col-xs-6 col-sm-6 col-md-6 col-lg-'+ colNumber+' col';
      },
      displayAll: function (params) {
        this.sampledropData2.dropDownTitle = params.optionTitle
      },
      displayVM: function (params) {
        this.sampledropData2.dropDownTitle = params.optionTitle

      },
      displayOS: function (params) {
        this.sampledropData2.dropDownTitle = params.optionTitle
      },
      setDummnyData: function () {
        /*
        * Here's Data Set for Current Page
        * 1. sampleBaseInformation : Base Information Data
        * 2. sampleBaseTag : tag sample Data
        * 3. sampleAsset : Data for Asset
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

        const chartTitleSampleData1 ={
          isTitleIconUsed: true,
          TitleIconClass: 'fa fa-globe fa-2x',
          cardTitle: 'Server By Region',
          isDropdownUSed: false,
        };

        const chartTitleSampleData2 ={
          isTitleIconUsed: true,
          TitleIconClass: 'fa fa-tag fa-2x',
          cardTitle: 'Server by Type',
          isDropdownUsed: true,
        };

        const chartTitleDropSampleData2 = {
          dropDownTitle:'All Types',
          dropDownDataArr: [
            {optionId: 'AT', optionTitle: 'All Types', optionClickMethod : 'displayAll'},
            {optionId: 'VM', optionTitle: 'VM', optionClickMethod : 'displayVM'},
            {optionId: 'OS', optionTitle: 'OS', optionClickMethod : 'displayOS'}
          ]
        };

        const chartDataAndOption1 = {
          data:{
            labels: ['VueJs', ' Beans. I was trying to explain to somebody as we were flying in, that\'s corn. That\'s beans. And they were very impressed at my agricultural knowledge. Please give it up for Amaury once again for that outstanding introduction. I have a bunch of good friends here today, including somebody who I served with, who is one of the finest senators in the country, and we\'re lucky to have him, your Senator, Dick Durbin is here. I also noticed, by the way, former Governor Edgar here, who I haven\'t seen in a long time, and somehow he has not aged and I have. And it\'s great to see you, Governor. I want to thank President Killeen and everybody at the U of I System for making it possible for me to be here today. And I am deeply honored at the Paul Douglas Award that is being given to me. He is somebody who set the path for so much outstanding public service here in Illinois.', 'ReactJs', 'AngularJs'],
            datasets: [
              {
                backgroundColor: this.getRandomColorArr(4),
                data: [40, 20, 80, 10]
              }
            ]
          },
          option: {
            responsive: true,
            maintainAspectRatio: true,
            legend: {
              display: false,
            }
          }
        };

        const chartDataAndOption2 = {
          data:{
            labels: ['AWS', 'MS Azure', 'Google cloud'],
            datasets: [{
                      data: [12, 4, 8],
                      backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                      ],
                      hoverBackgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56"
                      ]
                      }]
          },
          option: {
            responsive: true,
            maintainAspectRatio: true,
            legend: {
              display: false
            },
           tooltips: {
              enabled: false,
              custom: function(tooltipModel) {

                // Tooltip Element
                let tooltipEl = document.getElementById('chartjs-tooltip');
                let dataset = this._data.datasets
                let dataMeta = dataset[0]._meta;

                // Create element on first render
                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  tooltipEl.innerHTML =  "<svg></svg>";
                  document.body.appendChild(tooltipEl);
                }

                // Hide if no tooltip
                if (tooltipModel.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set caret Position
                  tooltipEl.classList.remove('above', 'below', 'no-transform');
                if (tooltipModel.yAlign) {
                  tooltipEl.classList.add(tooltipModel.yAlign);
                } else {
                  tooltipEl.classList.add('no-transform');
                }

                function getBody(bodyItem) {
                  return bodyItem.lines;
                }

                let selectedDonutBody = tooltipModel.body;
                if (selectedDonutBody) {

                  let selectedData = selectedDonutBody[0].lines[0].split(': ');
                  let currentColor = dataset[0].backgroundColor[dataset[0].data.indexOf(Number(selectedData[1]))];
                  let style = 'font-size:12px;'+'color:' + currentColor +';' +  'fill:' + currentColor + ';';
                  let titleLines = selectedData[0];
                  let bodyLines = selectedData[1];
                  let percent = Math.round((Number(bodyLines)/dataMeta[Object.keys(dataMeta)].total) * 100).toFixed(1);
                  let innerHtml = "<g style='color: black !important'>"
                                  + "<text y='30' x='8' style='font-size: 12px'>"
                                  + "<tspan style='font-size: 14px;font-weight: 900;  overflow: hidden;white-space: nowrap;text-overflow: ellipsis'>"+ titleLines +"</tspan>"
                                  + '<tspan style='+'\"fill:' + currentColor +'"\ x=\"8\" dy=\"17\"> ● </tspan>'
                                  + "<tspan dx='0'> Count: </tspan>"
                                  + "<tspan style='font-weight:bold' dx='0'> " +' '+ bodyLines + ' ' +" </tspan>"
                                  + "<tspan dx='0'>(" + percent +"%)</tspan>"
                                  + "</text>"
                                  + "</g>";

                  let textRoot = tooltipEl.querySelector('svg');
                  textRoot.style.fontFamily ='"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif;'
                  textRoot.style.background ='rgba(255, 255, 255, .5)'
                  textRoot.style.color = 'black';
                  textRoot.style.borderRadius ='5px'
                  textRoot.style.fontSize ='12px';
                  textRoot.style.border= '0.8px solid '+ currentColor
                  textRoot.style.width ='180px';
                  textRoot.style.height ='80px';
                  tooltipEl.style.pointerEvents='none'
                  textRoot.innerHTML = innerHtml;
                }

                // `this` will be the overall tooltip
                var position = this._chart.canvas.getBoundingClientRect();

                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                tooltipEl.style.position = 'absolute';
                tooltipEl.style.minHeight='100px';
                tooltipEl.style.overflow='hidden';
                tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                tooltipEl.style.top =  position.top + window.pageYOffset + tooltipModel.caretY + 'px';

              }
            }
            /*tooltips: {
              width: 2000,
              height: 300,
              callbacks: {
                title: function(tooltipItem, data) {
                  debugger;
                  return data['labels'][tooltipItem[0]['index']];
                },
                label: function(tooltipItem, data) {
                  return ' Count: ' + data['datasets'][0]['data'][tooltipItem['index']];
                },
                afterLabel: function(tooltipItem, data) {
                  let dataset = data['datasets'][0];
                  let dataMeta = dataset._meta;
                  let percent = Math.round((dataset['data'][tooltipItem['index']] / dataMeta[Object.keys(dataMeta)].total) * 100).toFixed(1);
                  return ' (' + percent + '%)';
                }
              },

              opacity: 0.7,
              backgroundColor: '#FFF',
              borderWidth: 1.5,
              borderColor: this.getRandomColor(),
              titleFontSize: 16,
              titleFontColor: '#0066ff',
              bodyFontColor: '#000',
              bodyFontSize: 14,
              displayColors: true
            }*/
          }
        };

        this.summaryBaseInfo = sampleBaseInformation;
        this.summaryBaseTag = sampleBaseTag;
        this.summaryAsset = sampleAsset;
        this.sampleTitleData1 = chartTitleSampleData1;
        this.sampleTitleData2 = chartTitleSampleData2;
        this.sampledropData2 = chartTitleDropSampleData2;
        this.chartDataAndOption1 = chartDataAndOption1;
        this.chartDataAndOption2 = chartDataAndOption2;
      },
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
