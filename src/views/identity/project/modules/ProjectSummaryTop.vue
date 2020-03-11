<template>
    <div class="summary-padding" :style="responsiveStyle">
        <p-info-panel v-show="isVisible"
                      :info-title="topPanelTitle"
                      :item="item"
                      :defs="topPanel"
        />
        <p-dict-panel v-show="isVisible"
                      ref="tagPanel"
                      :dict.sync="tags"
                      @confirm="updateTag"
        />
    </div>
</template>

<script>
import _ from 'lodash';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel_origin.vue';

export default {
    name: 'ProjectSummary',
    components: {
        PInfoPanel,
        PDictPanel,
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
    },
    data() {
        return {
            isLoadingVisible: false,
            isVisible: false,
            renderTitle: null,
            renderData: [],
            item: {},
            tags: {},
        };
    },
    computed: {
        topPanelTitle() {
            return this.$t('COMMON.BASE_INFO');
        },
        destructTags() {
            return _.toPairsIn(this.tags);
        },
        topPanel() {
            return [
                {
                    name: 'id',
                    label: this.$t('COMMON.ID'),
                    copyFlag: true,
                },
                {
                    name: 'name',
                    label: this.$t('COMMON.NAME'),
                    copyFlag: true,
                },
                {
                    name: 'create',
                    label: this.$t('COMMON.CREAT'),
                    copyFlag: true,
                },
            ];
        },
    },
    mounted() {
        this.setInitData();
    },
    methods: {
        async updateTag() {
            const selectedNodeDT = this.selectedNode.node.data;
            const tags = { tags: this.tags };
            const param = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id, ...tags } : { project_id: selectedNodeDT.id, ...tags };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/update`;
            await this.$http.post(url, param).then((response) => {
                if (!this.isEmpty(response.data)) {
                    this.tags = response.data.tags;
                }
            }).catch((error) => {
                console.error(error);
            });
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
                }
            }).catch((error) => {
                console.error(error);
            });
        },
    },
};
</script>

<style lang="postcss" scoped>
    .summary-padding {
        padding-left: 15px;
        padding-right: 15px;
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

  .spinner-container {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 99;
      height: 50%;
      overflow: hidden;
      background: rgba(theme('colors.white'), .5);
      .spinner {
          position: relative;
          display: inline-flex;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
      }

      &.fade-in-enter-active {
          transition: opacity .3s, visibility .3s;
      }
      &.fade-in-leave-active {
          transition: opacity .3s, visibility .3s;
      }
      &.fade-in-enter, &.fade-in-leave-to {
          visibility: hidden;
          opacity: 0;
      }
      &.fade-in-leave, &.fade-in-enter-to {
          visibility: visible;
          opacity: 1;
      }
  }
</style>
