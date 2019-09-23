<template>
  <b-row no-gutters class="animated fadeIn mb-3 pb-5">
    <b-col cols="12" class="p-0">
      <b-card class="base first-tab summary">
        <base-panel :panels="selectedSummaryData" />
      </b-card>
    </b-col>
    <b-col :cols="itemsByTitle ? 6 : 12" class="pr-2 mt-3 mb-3">
      <ServersByType :draw-by="drawBy" />
    </b-col>
    <b-col v-if="itemsByTitle" cols="6" class="pl-2 mt-3 mb-3">
      <ItemsByRegion :draw-by="drawBy" :title="itemsByTitle" />
    </b-col>
  </b-row>
</template>

<script>
import BaseTabs from '@/components/base/tab/BATA_001_BaseTab';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTree from '@/components/base/tree/BATR_001_BaseTree';
import ServerState from '@/views/dashboard/DSBD_004_ServerState';
import ItemsByRegion from '@/views/dashboard/DSBD_005_ItemsByRegion';
import ServersByType from '@/views/dashboard/DSBD_006_ServersByType';

import { api } from '@/setup/api';
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');
const BasePanelCard = () => import('@/components/base/panel/BAPA_003_BasePanelCard');
const BaseChart = () => import('@/components/base/charts/BACT_001_BaseChart');

const SummaryModel = {
    id: null,
    title: null,
    create: null,
    tags: []
};


export default {
    name: 'DataCenterSummary',
    components: {
        BaseChart,
        BasePanel,
        BasePanelCard,
        ServerState,
        ItemsByRegion,
        ServersByType
    },
    props: {
        summaryData: {
            type: Object,
            default: () => (SummaryModel)
        }
    },
    data () {
        return {
            selectedChartCol: {
                graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6'
            },
            panelData: null,
            panelCardData: [],
            sampleTitleData1: null,
            sampleTitleData2: null,
            sampleDropData2: null,
            chartDataAndOption1: null,
            chartDataAndOption2: null
        };
    },
    computed: {
        topPanel() {
            return [
                { title: this.tr('COL_NM.ID'), contents: this.summaryData.id, copyFlag: true },
                { title: this.tr('COL_NM.NAME'), contents: this.summaryData.title, copyFlag: true },
                { title: this.tr('COL_NM.CREAT'), contents: this.summaryData.create, copyFlag: true }
            ];
        },
        tag () {
            let tag = [];
            for (var key in this.summaryData.tags) {
                tag.push({
                    title: key,
                    contents: this.summaryData.tags[key],
                    copyFlag: true
                });
            }
            return tag;
        },
        tags () {
            return this.dictToKeyValueArray(this.summaryData.tags);
        },
        selectedSummaryData () {
            return [
                {
                    panelTitle: this.tr('PANEL.BASE_INFO'),
                    panelIcon: {
                        icon: 'fa-hashtag',
                        type: 'l',
                        size: 1,
                        color: 'primary'
                    },
                    data: this.topPanel
                },
                {
                    panelTitle: this.tr('PANEL.TAG'),
                    panelIcon: {
                        icon: 'fa-tags',
                        type: 'l',
                        size: 1,
                        color: 'danger'
                    },
                    data: this.tag,
                    editable: false
                }
            ];
        }, 
        drawBy () {

            let param = {};
            let id = this.$attrs["selected-data"].node.data.id;
            const key = `${this.$attrs["selected-data"].node.data.item_type.toLowerCase()}_id`;
            param[key] = id;

            return param;

        },
        itemsByTitle () {
            const group = this.$attrs["selected-data"].node.data.item_type;
            console.log(group);
            if (group) {
                if (group == 'REGION') {
                    return 'Items by Zone';
                } else if (group == 'ZONE') {
                    return 'Items by Pool';
                }
            }
            return null;
        }
    },
    created: function () {
        this.setDummyData();
        this.setInitData();
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
        async setInitData() {
            const selectedNode = this.$attrs['selected-data'].node;
            const itemType = selectedNode.data.item_type;
            let url = null;
            let param = {};
            if (itemType === 'REGION'){
                url = '/inventory/region/get';
                param['region_id'] = selectedNode.data.id;

            } else if (itemType === 'ZONE'){
                url = '/inventory/zone/get';
                param['zone_id'] = selectedNode.data.id;
            } else {
                url = '/inventory/pool/get';
                param['pool_id'] = selectedNode.data.id;
            }
            await this.$axios.post(url, param).then((response) => {
                if (!this.isEmpty(response.data)){
                    this.summaryData.id = response.data.hasOwnProperty('region_id') ? response.data.region_id : response.data.hasOwnProperty('zone_id') ?  response.data.zone_id : response.data.pool_id;
                    this.summaryData.title =  response.data.name;
                    this.summaryData.create = this.getDatefromTimeStamp(response.data.created_at.seconds, localStorage.timeZone);
                    this.summaryData.tags = response.data.tags;
                }
            }).catch((error) =>{
                console.error(error);
            });

        },
        setDummyData(){
            const sampleAsset = [
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon:
                    {
                        icon: 'fa-server',
                        type: 'l',
                        size: 1,
                        color: 'light'
                    }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon: {
                    icon: 'fa-users',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Server', assetValue: 27, linkURL: 'www.google.com', panelIcon: {
                    icon: 'fa-server',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Volume', assetValue: 2, linkURL: 'www.yahoo.co.jp', panelIcon: {
                    icon: 'fa-database',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Project', assetValue: 17, linkURL: 'www.bing.com', panelIcon: {
                    icon: 'fa-star',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }},
                { asKey: 'Member', assetValue: 0, linkURL: 'www.naver.com', panelIcon: {
                    icon: 'fa-users',
                    type: 'l',
                    size: 1,
                    color: 'light'
                }}
            ];

            const chartTitleSampleData1 = {
                isTitleIconUsed: true,
                TitleIconClass: {
                    icon: 'fa-globe',
                    type: 'l',
                    size: 1
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

            this.panelCardData = sampleAsset;
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
