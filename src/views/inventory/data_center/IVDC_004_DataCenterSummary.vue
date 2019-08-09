<template>
  <div class="animated fadeIn">
    <base-panel :panels="panelData" />
    <div class="col-xs-12 p-0">
      <base-panel-card :panels-card="panelCardData" />
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
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');
const BasePanelCard = () => import('@/components/base/panel/BAPA_003_BasePanelCard');
const BaseChart = () => import('@/components/base/charts/BACT_001_BaseChart');
export default {
    name: 'ProjectSummary',
    components: {
        BaseChart,
        BasePanel,
        BasePanelCard
    },
    props: {},
    data () {
        return {
            selectedChartCol: {
                graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6'
            },
            panelData: null,
            panelCardData: null,
            sampleTitleData1: null,
            sampleTitleData2: null,
            sampleDropData2: null,
            chartDataAndOption1: null,
            chartDataAndOption2: null,
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

            const samplePanelData = [{ panelTitle: 'Base Information',
                panelIcon: {
                    icon: 'fa-hashtag',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                },
                data: [
                    { title: 'ID', contents: 'pg-6bc72053' },
                    { title: 'Name', contents: 'AWS KsssR' },
                    { title: 'Created', contents: '2019-05-12' },
                    { title: '', contents: '' }
                ]},
            {
                panelTitle: 'Tag',
                panelIcon: {
                    icon: 'fa-tags',
                    type: 'l',
                    size: 1,
                    color: 'danger'
                },
                data: [
                    { title: 'Japan', contents: 'Tokyo' },
                    { title: 'South Korea', contents: 'Seoul' },
                    { title: 'USA', contents: 'Washington D.C.' },
                    { title: 'Canada', contents: 'Ottawa' },
                    { title: 'Austria', contents: 'Vienna' },
                    { title: 'Germany', contents: 'Berlin' },
                    { title: 'G.B', contents: 'London' },
                    { title: 'France', contents: 'Paris' }
                ]
            }];


            const sampleAsset = [
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon:
                          {
                              icon: 'fa-server',
                              type: 'l',
                              size: 1,
                              color: 'primary'
                          }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon: {
                    icon: 'fa-users',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon: {
                    icon: 'fa-server',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Project', assetValue: 17, linkURL: 'www.bing.com', panelIcon: {
                    icon: 'fa-star',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }},
                { asKey: 'Member', assetValue: 0, linkURL: 'www.naver.com', panelIcon: {
                    icon: 'fa-users',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                }}
            ];

            const chartTitleSampleData1 = {
                isTitleIconUsed: true,
                TitleIconClass: {
                    icon: 'fa-globe',
                    type: 'l',
                    size: 1,
                    color: 'primary'
                },
                cardTitle: 'Server By Region',
                isDropdownUSed: false
            };

            const chartTitleSampleData2 = {
                isTitleIconUsed: true,
                TitleIconClass: 'fa-tag',
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
            this.panelData = samplePanelData;
            this.panelCardData = sampleAsset;
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


  .quote {
    border-left: 0.5em solid #415ee1;
    padding: 0.5em;
    padding-left: 12px;
    margin: 8px 0px;
    margin-left: 10px;
  }

  .card.base {
    margin-top: 10px;
    margin-bottom: 10px;
    &.summary {
      margin-top: 0;
      border-top-left-radius: 0px !important;
    }
  }

</style>
