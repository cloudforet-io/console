<template>
  <div class="animated fadeIn">
    <BaseDragHorizontal>
      <template #container="{ height }">
        <BaseTable class="collector-table"
                   :table-data="collectors"
                   :fields="fields"
                   :per-page="query.page.limit"
                   searchable
                   :total-rows="totalCount"
                   :search-context-data="contextData"
                   :busy="isLoading"
                   :cardless="false"
                   underlined
                   :height="height"
                   @rowSelected="rowSelected"
                   @onSelectAll="onAllRowSelected"
                   @list="listCollectors"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <b-button class="btn mr-4" variant="primary" @click="onClickAdd">
                {{ tr('BTN_ADD') }}
              </b-button>
              <b-dropdown v-if="hasSelectedCollector" no-caret
                          variant="outline-info"
                          class="no-selected"
              >
                <template #button-content>
                  <span>{{ tr('BTN_ACTION') }}</span> &nbsp;
                  <i class="fal fa-angle-down" />
                </template>
                <b-dropdown-item v-if="!isMultiSelected" @click="onClickUpdate">
                  <div class="item sm">
                    <i class="icon fal fa-pencil-alt" />
                    <span class="name">{{ tr('BTN_UPT') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickDelete">
                  <div class="item sm">
                    <i class="icon fal fa-trash-alt" />
                    <span class="name">{{ tr('BTN_DELETE') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickEnable">
                  <div class="item sm">
                    <i class="icon fal fa-check-circle" />
                    <span class="name">{{ tr('BTN_ENABLE') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickDisable">
                  <div class="item sm">
                    <i class="icon fal fa-ban" />
                    <span class="name">{{ tr('BTN_DISABLE') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item v-if="!isMultiSelected" @click="onCollectData">
                  <div class="item sm">
                    <i class="icon fal fa-cloud-download-alt" />
                    <span class="name">{{ tr('BTN_COL_DATA') }}</span>
                  </div>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDragHorizontal>

    <BaseModal ref="IVCO001_CollectorDataModal"
               :title="tr('TITLE', [isCreateMode ? tr('BTN_COL_DATA') : tr('BTN_COL_DATA'), tr('COLLECTOR')])"
               centered
               :use-custom-msg="true"
               backdrop-off
               prevent-esc-close
               size="xl"
               interactive
               hide-footer
               :type="'primary'"
               :custom-yes-or-no-msg="popMsgButton"
               @esc="hideCollectorDataModal"
               @cancel="hideCollectorDataModal"
    >
      <template #contents>
        <CollectorCollectData ref="IVCO001_CollectorData"
                              :filter-format-data="isCreateMode ? undefined : isEmpty(selectedItems[0].data) ? undefined :selectedItems[0].data.plugin_info.options.filter_format"
                              :collector-data="isCreateMode ? undefined : selectedItems[0].data"
                              :creatable="isCreateMode ? true : false"
                              :is-local-user="isLocalMode"
                              size="xl"
                              @create="createCollector"
                              @update="updateCollector"
                              @cancel="hideCollectorDataModal"
        />
      </template>
    </BaseModal>

    <ActionCheckModal ref="IVCO001_ActionCheckModal"
                      :data="selectedCollectors"
                      :fields="multiActionFields"
                      :action="action"
                      :title="actionCheckTitle"
                      :type="actionCheckType"
                      :text="actionCheckText"
                      primary-key="user_id"
                      @succeed="listCollectors"
                      @failed="listCollectors"
    />
    <BaseTabNav v-if="hasSelectedCollector" class="user-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                use-slot
    >
      <template #info>
        <b-card class="base first-tab">
          <BaseMultiPanel v-if="isMultiSelected"
                          :data="selectedCollectors"
                          :data-fields="multiInfoFields"
          />
          <CollectorDetails v-else
                            :collector-data="selectedItems[0].data"
                            @update="updateSelectedCollectorInfo"
          />
        </b-card>
      </template>
      <template #credentials>
        <CollectorCredentials :collector-data="selectedItems[0].data" />
      </template>
      <template #jobs>
        <CollectorJobs :collector-data="selectedItems[0].data" />
      </template>
    </BaseTabNav>
    <div v-else class="empty">
      <span class="msg"> {{ tr('PANEL.NO_SELECT', [tr('COLLECTOR')]) }} </span>
    </div>
  </div>
</template>

<script>
import BaseDragHorizontal from '@/components/base/drag/BADG_002_BaseDragHorizontal';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import contextData from './search_context/query.js';
import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseMultiPanel from '@/components/base/panel/BAPA_005_BaseMultiPanel';
import BaseModal  from '@/components/base/modal/BAMO_001_BaseModal';

import CollectorDetails  from '@/views/inventory/collector/IVCO_004_CollectorDetailsSingle';
import CollectorCredentials  from '@/views/inventory/collector/IVCO_006_CollectorCredentials';
import CollectorCollectData  from '@/views/inventory/collector/IVCO_007_CollectorCollectData';
import CollectorJobs  from '@/views/inventory/collector/IVCO_008_CollectorJobs';
import ActionCheckModal  from '@/components/base/modal/BAMO_003_EXT_ActionCheckModal.vue';

export default {
    name: 'Collector',
    components: {
        BaseDragHorizontal,
        BaseTable,
        BaseTabNav,
        CollectorDetails,
        BaseMultiPanel,
        BaseModal,
        CollectorCollectData,
        CollectorCredentials,
        CollectorJobs,
        ActionCheckModal
    },
    data () {
        return {
            popMsgButton: { NO: this.tr('BTN_CANCEL'), YES: this.tr('BTN_OK') },
            collectors: [],
            selectedItems: [],
            addModal: false,
            totalCount: 0,
            isReadyForSearch: false,
            isLoading: true,
            contextData: contextData,
            query: {
                sort: {},
                page: {
                    start: 1,
                    limit: 10
                },
                filter: [],
                filter_or: []
            },
            isCreateMode: true,
            isLocalMode: false,
            action: null,
            actionCheckTitle: '',
            actionCheckType: '',
            actionCheckText: ''
        };
    },
    computed: {
        tabs () {
            if (this.isMultiSelected) {
                return [
                    {
                        title: this.tr('PANEL.DETAILS'),
                        key: 'info'
                    }
                ];
            }
            return [
                {
                    title: this.tr('PANEL.DETAILS'),
                    key: 'info'
                },
                {
                    title: this.tr('PANEL.CREDENTIAL'),
                    key: 'credentials'
                },
                {
                    title: this.tr('PANEL.JOBS'),
                    key: 'jobs'
                }
            ];
        },
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'priority', label: this.tr('COL_NM.PRIORITY'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'plugin_info', label: this.tr('COL_NM.RESOURCE'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'last_collected_at', label: this.tr('COL_NM.LAST_COL'), sortable: true, ajaxSortable: true, filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val);
                    }, thStyle: { width: '200px' }},
                {
                    key: 'created_at',
                    label: this.tr('COL_NM.CREATED'),
                    sortable: true,
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val);
                    },
                    thStyle: { width: '160px' }
                }
            ];
        },
        multiInfoFields () {
            return [
                { key: 'collector_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'state', label: this.tr('COL_NM.STATE') },
                { key: 'priority', label: this.tr('COL_NM.PRIORITY') },
                { key: 'plugin_info', label: this.tr('COL_NM.RESOURCE') }
            ];
        },
        multiActionFields () {
            return [
                { key: 'collector_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'state', label: this.tr('COL_NM.STATE') },
                { key: 'created_at', label: this.tr('COL_NM.CREATED'), filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val);
                    } }
            ];
        },
        isMultiSelected () {
            return this.selectedItems.length > 1;
        },
        hasSelectedCollector () {
            return this.selectedItems.length > 0;
        },
        selectedCollectors () {
            return this.selectedItems.map((item) => {
                return item.data;
            });
        }
    },
    mounted () {
        this.listCollectors();
    },
    methods: {
        reset () {
            this.collectors = [];
            this.selectedItems = [];
            this.isLoading = true;
        },
        setQuery (limit, start, sort, filter, filterOr) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.filter = filter || [];
            this.query.filter_or = filterOr || [];
        },
        async listCollectors (limit, start, sort, filter, filterOr) {
            this.reset();
            this.setQuery(limit, start, sort, filter, filterOr);
            let res = null;
            try {
                res = await this.$axios.post('/inventory/collector/list', {
                    query: this.query
                });
                this.collectors = res.data.results;
                console.log('collectors',this.collectors);
                this.totalCount = res.data.total_count;
                this.isLoading = false;
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('COLLECTOR')]));
                this.isLoading = false;
            }
        },
        rowSelected (rows) {
            this.selectedItems = rows;
        },
        onAllRowSelected (isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged (val) {
            this.query.page.limit = Number(val);
            this.listCollectors();
        },
        updateSelectedCollectorInfo (user) {
            this.selectedItems[0].data = user;
        },
        updateCollector (user) {
            this.hideCollectorDataModal();
            user.selected = true;
            this.selectedItems[0].data = user;
            this.$set(this.collectors, this.selectedItems[0].idx, user);
        },
        createCollector () {
            this.hideCollectorDataModal();
            this.listCollectors();
        },
        getParams (items) {
            let params = {
                collectors: [],
                domain_id: sessionStorage.domainId
            };
            items.map((item) => {
                params.collectors.push(item.collector_id);
            });
            return params;
        },
        getComputedTime (selectedTimeStamp) {
            return !this.isEmpty(selectedTimeStamp) ? this.getDatefromTimeStamp(selectedTimeStamp.seconds, localStorage.getItem('timezone')) : '';
        },
        async deleteCollector (commitItems) {
            await this.$axios.post('/inventory/collector/delete', this.getParams(commitItems));
        },
        async enableCollector (commitItems) {
            await this.$axios.post('/inventory/collector/enable', this.getParams(commitItems));
        },
        async disableCollector (commitItems) {
            await this.$axios.post('/inventory/collector/disable', this.getParams(commitItems));
        },
        onClickAdd () {
            this.isCreateMode = true;
            this.$router.push({ path: '/inventory/collector/new-collector' });
        },
        onClickUpdate () {
            this.isCreateMode = false;
            this.showCollectorDataModal();
        },
        onClickDelete () {
            this.action = this.deleteCollector;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DELETE'), this.tr('COLLECTOR')]);
            this.actionCheckType = 'danger';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DELETE'), this.tr('COLLECTOR')]);
            this.showActionModal();
        },
        onClickEnable () {
            this.action = this.enableCollector;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_ENABLE'), this.tr('COLLECTOR')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_ENABLE'), this.tr('COLLECTOR')]);
            this.showActionModal();
        },
        onClickDisable () {
            this.action = this.disableCollector;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DISABLE'), this.tr('COLLECTOR')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DISABLE'), this.tr('COLLECTOR')]);
            this.showActionModal();
        },
        showCollectorDataModal () {
            this.$refs.IVCO001_CollectorDataModal.showModal();
        },
        hideCollectorDataModal () {
            this.$refs.IVCO001_CollectorDataModal.hideModal();
        },
        showActionModal () {
            this.$refs.IVCO001_ActionCheckModal.showModal();
        },
        onCollectData () {
            this.popMsgButton = { NO: this.tr('BTN_CANCEL'), YES: this.tr('BTN_COL_DATA') };
            this.isCreateMode = false;
            this.showCollectorDataModal();
        }
    }
};
</script>

<style lang="scss" scoped>
  .animated.fadeIn {
    padding: $top-pad $side-pad $bottom-pad $side-pad;
  }
  .base-table {
    @extend %sheet;
  }
  .btn {
    margin: 0 5px;
  }
  .collector-table {
    margin-top: 20px;
  }
  .user-info {
    margin-bottom: 20px;
  }
  .empty {
    text-align: center;
    margin-top: 40px;
    .msg {
      color: $darkgray;
      font-size: 1.3rem;
      font-weight: 600;
    }

  }

</style>
