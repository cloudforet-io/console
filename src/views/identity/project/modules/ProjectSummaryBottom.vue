<template>
    <div class="row no-gutters">
        <ServersByType class="col"
                       :server-data="serverTypeData"
                       :vm-data="vmTypeData"
                       :os-data="osTypeData"
                       :hypervisor-data="hypervisorTypeData"
                       :col-max="2"
                       :draw-by="drawBy"
        />
        <ResourcesByRegion class="col region"
                           :data="resourcesByRegionData"
                           legend-position="bottom"
                           :draw-by="drawBy"
        />
    </div>
</template>

<script>

import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
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
        ResourcesByRegion,
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
            serverTypeData: {},
            vmTypeData: {},
            osTypeData: {},
            hypervisorTypeData: {},
            resourcesByRegionData: {},
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
    },
};
</script>

<style lang="scss" scoped>
    .region {
        margin-left: 1rem;
    }

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
