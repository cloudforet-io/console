<template>
    <b-row no-gutters class="animated fadeIn mb-3 pb-5">
        <b-col cols="12" class="p-0">
            <base-panel :panels="selectedSummaryData" />
        </b-col>
        <b-col cols="6" class="pr-2 mt-3 mb-3">
            <ServersByType :draw-by="drawBy" />
        </b-col>
        <b-col cols="6" class="pl-2 mt-3 mb-3">
            <ItemsByRegion :draw-by="drawBy" title="Items by Region" />
        </b-col>
    </b-row>
</template>

<script>
import ServerState from '@/views/dashboard/modules/ServerState';
import ItemsByRegion from '@/views/dashboard/modules/ItemsByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';
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
        ServerState,
        ItemsByRegion,
        ServersByType,
    },
    props: {
        summaryData: {
            type: Object,
            default: () => (SummaryModel),
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
            const selectedNode = this.$attrs['selected-data'].node;
            let url = null;
            const param = {};
            if (selectedNode.data.item_type === 'PROJECT_GROUP') {
                url = '/identity/project-group/get';
                param.project_group_id = selectedNode.data.id;
            } else {
                url = '/identity/project/get';
                param.project_id = selectedNode.data.id;
            }
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
