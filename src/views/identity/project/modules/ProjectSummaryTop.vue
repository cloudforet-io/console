<template>
    <InfoPanel v-show="isVisible"
               :info-title-style="responsiveStyle"
               :info-title="topPanelTitle"
               :item="topPanelItem"
               :defs="topPanel"
    />
</template>

<script>
import InfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import { api } from '@/setup/api';

const SummaryModel = {
    id: null,
    title: null,
    create: null,
    tags: [],
};


export default {
    name: 'ProjectSummary',
    components: {
        InfoPanel,
    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
        },
        responsiveStyle: {
            type: Object,
            default: null,
        },
        summaryData: {
            type: Object,
            default: () => (SummaryModel),
        },
    },
    data() {
        return {
            isVisible: false,
            renderTitle: null,
            renderData: [],
            item: {},
        };
    },
    computed: {
        topPanelTitle() {
            return this.tr('COMMON.DETAILS');
        },
        topPanelItem() {
            console.log('##########################################################');
            return this.item;
        },
        topPanel() {
            return [
                {
                    name: 'name',
                    label: this.tr('COMMON.ID'),
                    copyFlag: true,
                },
                {
                    name: 'name',
                    label: this.tr('COMMON.NAME'),
                    copyFlag: true,
                },
                {
                    name: 'create',
                    label: this.tr('COMMON.CREAT'),
                    copyFlag: true,
                },
            ];
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
    },
    created() {
        this.setInitData();
    },
    methods: {
        async setInitData() {
            const selectedNodeDT = this.selectedNode.node.data;
            const param = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/get`;

            await this.$http.post(url, param).then((response) => {
                if (!this.isEmpty(response.data)) {
                    this.item.id = response.data.hasOwnProperty('project_group_id') ? response.data.project_group_id : response.data.project_id;
                    this.item.name = response.data.name;
                    this.item.create = this.getDatefromTimeStamp(response.data.created_at.seconds, localStorage.timeZone);
                    this.isVisible = true;
                    // this.summaryData.tags = response.data.tags;
                    console.log('this.item', this.item);
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
