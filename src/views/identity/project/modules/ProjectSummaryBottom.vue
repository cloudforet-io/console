<template>
    <div  class="row animated fadeIn no-gutters">
        <b-col cols="6" class="pr-2 mt-3 mb-3">
            <ServersByType :draw-by="drawBy" />
        </b-col>
        <b-col cols="6" class="pl-2 mt-3 mb-3">
            <ItemsByRegion :draw-by="drawBy" title="Items by Region" />
        </b-col>
    </div>
</template>

<script>

import ServerState from '@/views/dashboard/modules/ServerState';
import ItemsByRegion from '@/views/dashboard/modules/ItemsByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';
import InfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import { api } from '@/setup/api';

const BasePanel = () => import('@/components/base/panel/BasePanel');

const SummaryModel = {
    id: null,
    title: null,
    create: null,
    tags: [],
};


export default {
    name: 'ProjectSummary',
    components: {
        BasePanel,
        InfoPanel,
        ServerState,
        ItemsByRegion,
        ServersByType,
    },
    props: {
        summaryData: {
            type: Object,
            default: () => (SummaryModel),
        },
        selectedNode: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            selectedChartCol: {
                graph: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                legend: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
            },
            panelData: null,
            panelCardData: [],
            sampleTitleData1: null,
            sampleTitleData2: null,
            sampleDropData2: null,
            chartDataAndOption1: null,
            chartDataAndOption2: null,
        };
    },
    computed: {
        topPanel() {
            return [
                { title: this.tr('COL_NM.ID'), contents: this.summaryData.id, copyFlag: true },
                { title: this.tr('COL_NM.NAME'), contents: this.summaryData.title, copyFlag: true },
                { title: this.tr('COL_NM.CREAT'), contents: this.summaryData.create, copyFlag: true },
            ];
        },
        tag() {
            const tag = [];
            for (const key in this.summaryData.tags) {
                tag.push({
                    title: key,
                    contents: this.summaryData.tags[key],
                    copyFlag: true,
                });
            }
            return tag;
        },
        tags() {
            return this.dictToKeyValueArray(this.summaryData.tags);
        },
        selectedSummaryData() {
            return [
                {
                    panelTitle: this.tr('PANEL.BASE_INFO'),
                    panelIcon: {
                        icon: 'fa-hashtag',
                        type: 'l',
                        size: 1,
                        color: 'primary',
                    },
                    data: this.topPanel,
                },
                {
                    panelTitle: this.tr('PANEL.TAG'),
                    panelIcon: {
                        icon: 'fa-tags',
                        type: 'l',
                        size: 1,
                        color: 'danger',
                    },
                    data: this.tag,
                    editable: false,
                },
            ];
        },
        drawBy() {
            return { project_id: this.summaryData.id };
        },
    },
    created() {
        this.setDummyData();
        this.setInitData();
    },
    methods: {
        CopyToClipboard(text) {
            this.selectToCopyToClipboard(text);
        },
        displayAll(params) {
            this.sampleDropData2.dropDownTitle = params.optionTitle;
        },
        displayVM(params) {
            this.sampleDropData2.dropDownTitle = params.optionTitle;
        },
        displayOS(params) {
            this.sampleDropData2.dropDownTitle = params.optionTitle;
        },
        async setInitData() {
            const selectedNodeDT = this.selectedNode.node.data;
            const param = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/get`;

            await this.$http.post(url, param).then((response) => {
                debugger;
                if (!this.isEmpty(response.data)) {
                    this.summaryData.id = response.data.hasOwnProperty('project_group_id') ? response.data.project_group_id : response.data.project_id;
                    this.summaryData.title = response.data.name;
                    this.summaryData.create = this.getDatefromTimeStamp(response.data.created_at.seconds, localStorage.timeZone);
                    this.summaryData.tags = response.data.tags;
                }
            }).catch((error) => {
                console.error(error);
            });
        },
        setDummyData() {
            const sampleAsset = [
                {
                    asKey: 'Server',
                    assetValue: 27,
                    linkURL: 'www.google.com',
                    panelIcon:
                    {
                        icon: 'fa-server',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Volume',
                    assetValue: 2,
                    linkURL: 'www.yahoo.co.jp',
                    panelIcon: {
                        icon: 'fa-database',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Server',
                    assetValue: 27,
                    linkURL: 'www.google.com',
                    panelIcon: {
                        icon: 'fa-users',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Volume',
                    assetValue: 2,
                    linkURL: 'www.yahoo.co.jp',
                    panelIcon: {
                        icon: 'fa-database',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Server',
                    assetValue: 27,
                    linkURL: 'www.google.com',
                    panelIcon: {
                        icon: 'fa-server',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Volume',
                    assetValue: 2,
                    linkURL: 'www.yahoo.co.jp',
                    panelIcon: {
                        icon: 'fa-database',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Project',
                    assetValue: 17,
                    linkURL: 'www.bing.com',
                    panelIcon: {
                        icon: 'fa-star',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
                {
                    asKey: 'Member',
                    assetValue: 0,
                    linkURL: 'www.naver.com',
                    panelIcon: {
                        icon: 'fa-users',
                        type: 'l',
                        size: 1,
                        color: 'light',
                    },
                },
            ];

            const chartTitleSampleData1 = {
                isTitleIconUsed: true,
                TitleIconClass: {
                    icon: 'fa-globe',
                    type: 'l',
                    size: 1,
                },
                cardTitle: 'Server By Region',
                isDropdownUSed: false,
            };

            const chartTitleSampleData2 = {
                isTitleIconUsed: true,
                TitleIconClass: 'fa-tag',
                cardTitle: 'Server by Type',
                isDropdownUsed: true,
            };

            const chartTitleDropSampleData2 = {
                dropDownTitle: 'All Types',
                dropDownDataArr: [
                    { optionId: 'AT', optionTitle: 'All Types', optionClickMethod: 'displayAll' },
                    { optionId: 'VM', optionTitle: 'VM', optionClickMethod: 'displayVM' },
                    { optionId: 'OS', optionTitle: 'OS', optionClickMethod: 'displayOS' },
                ],
            };

            const chartDataAndOption1 = {
                data: {
                    labels: ['S.Korea', 'USA', 'Russia', 'Italy', 'Mexico', 'China'],
                    datasets: [
                        {
                            backgroundColor: this.getGraphColor(true, false, 6),
                            data: [40.2, 120, 80.7, 10.9, 114, 121.02],
                        },
                    ],
                },
                option: {
                    responsive: true,
                    maintainAspectRatio: true,
                    legend: {
                        display: false,
                    },
                },
            };

            const Colors = this.getGraphColor(true, false, 3);
            const chartDataAndOption2 = {
                data: {
                    labels: ['AWS', 'MS Azure', 'Google cloud'],
                    datasets: [{
                        data: [12, 4, 8],
                        backgroundColor: Colors,
                        hoverBackgroundColor: Colors,
                    }],
                },
                option: {
                    tooltipUseYN: 1,
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false,
                    },
                },
            };

            this.panelCardData = sampleAsset;
            this.sampleTitleData1 = chartTitleSampleData1;
            this.sampleTitleData2 = chartTitleSampleData2;
            this.sampleDropData2 = chartTitleDropSampleData2;
            this.chartDataAndOption1 = chartDataAndOption1;
            this.chartDataAndOption2 = chartDataAndOption2;
        },
    },
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
