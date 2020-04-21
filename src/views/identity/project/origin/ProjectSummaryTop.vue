<template>
    <div class="summary-padding" :style="responsiveStyle">
        <p-info-panel v-show="isVisible"
                      :info-title="topPanelTitle"
                      :item="item"
                      :defs="topPanel"
        />
        <p-dict-panel v-if="isVisible"
                      :dict.sync="tagsApi.ts.syncState.dict"
                      :edit-mode.sync="tagsApi.ts.syncState.editMode"
                      v-on="tagsApi.ts.listeners"
        />
    </div>
</template>

<script>
import _ from 'lodash';
import PInfoPanel from '@/components/organisms/panels/info-panel/InfoPanel.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import { DictPanelAPI } from '@/lib/api/dict';
import { fluentApi } from '@/lib/fluent-api';

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
            idKey: '',
            tagsApi: null,
        };
    },
    computed: {
        topPanelTitle() {
            return this.$t('COMMON.BASE_INFO');
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
                    label: this.$t('COMMON.CREATE'),
                    copyFlag: true,
                },
            ];
        },
    },
    mounted() {
        this.setInitData();
    },
    methods: {
        async setInitData() {
            const selectedNodeDT = this.selectedNode.node.data;
            const key = selectedNodeDT.item_type.toLowerCase();
            this.idKey = `${key}_id`;
            const param = { [this.idKey]: selectedNodeDT.id };
            const url = `/identity/${_.kebabCase(key)}/get`;

            try {
                const response = await this.$http.post(url, param);
                if (response.data) {
                    this.item = {
                        id: response.data[this.idKey],
                        name: response.data.name,
                        create: this.getDatefromTimeStamp(response.data.created_at.seconds, localStorage.timeZone),
                    };
                    this.tagsApi = new DictPanelAPI(fluentApi.identity()[_.camelCase(key)]());
                    this.tagsApi.ts.syncState.dict = response.data.tags;
                    this.tagsApi.setIdKey(this.idKey);
                    this.tagsApi.setId(this.item.id);
                    this.tagsApi.ts.toReadMode();
                    this.isVisible = true;
                }
            } catch (e) {
                console.error(e);
            }
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
