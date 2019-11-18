<template>
    <div :style="responsiveStyle">
        <InfoPanel v-show="isVisible"
                   :info-title="topPanelTitle"
                   :item="item"
                   :defs="topPanel"
        />
        <p-tag-panel ref="tagPanel"
                     :tags.sync="tags"
                     @confirm="updateTag"
        />
    </div>
</template>

<script>
import _ from 'lodash';
import InfoPanel from '@/components/organisms/panels/info-panel/InfoPanel';
import PTagPanel from '@/components/organisms/panels/tag-panel/TagPanel';

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
        PTagPanel,
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
            tags: {},
        };
    },
    computed: {
        topPanelTitle() {
            return this.tr('COMMON.DETAILS');
        },
        destructTags() {
            return _.toPairsIn(this.tags);
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
    },
    created() {
        this.setInitData();
    },
    methods: {
        async updateTag(){
        },
        async setInitData() {
            const selectedNodeDT = this.selectedNode.node.data;
            const param = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id } : { project_id: selectedNodeDT.id };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/get`;

            await this.$http.post(url, param).then((response) => {
                if (!this.isEmpty(response.data)) {
                    this.item = {
                        id: response.data.hasOwnProperty('project_group_id') ? response.data.project_group_id : response.data.project_id,
                        name: response.data.name,
                        create: this.getDatefromTimeStamp(response.data.created_at.seconds, localStorage.timeZone),
                    };

                    this.tags = response.data.tags;

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
