<template>
  <div class="animated fadeIn">
    <BaseDragHorizontal>
      <template #container="{ height }">
        <BaseTable class="server-table"
                   :table-data="servers"
                   :fields="fields"
                   :per-page="query.page.limit"
                   searchable
                   :total-rows="totalCount"
                   :search-context-data="contextData"
                   :busy="isLoading"
                   :cardless="false"
                   underlined
                   :height="height"
                   state-type="SERVER_STATE"
                   @rowSelected="rowSelected"
                   @onSelectAll="onAllRowSelected"
                   @list="listServers"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <b-dropdown v-if="hasSelectedServer" no-caret
                          variant="outline-info"
                          class="no-selected"
              >
                <template #button-content>
                  <span>{{ tr('BTN_ACTION') }}</span> &nbsp;
                  <i class="fal fa-angle-down" />
                </template>
                <b-dropdown-item @click="onClickDelete">
                  <div class="item sm">
                    <i class="icon fal fa-trash-alt" />
                    <span class="name">{{ tr('BTN_DELETE') }}</span>
                  </div>
                </b-dropdown-item>

                <b-dropdown-divider />

                <b-dropdown-item @click="onClickSetMaintenance">
                  <div class="item sm">
                    <i class="icon fal fa-traffic-cone" />
                    <span class="name">{{ tr('BTN_S_MANT') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickSetInService">
                  <div class="item sm">
                    <i class="icon fal fa-play-circle" />
                    <span class="name">{{ tr('BTN_S_SERV') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickSetClosed">
                  <div class="item sm">
                    <i class="icon fal fa-stop-circle" />
                    <span class="name">{{ tr('BTN_S_CLOSE') }}</span>
                  </div>
                </b-dropdown-item>

                <b-dropdown-divider />

                <b-dropdown-item @click="onClickChangeProject">
                  <div class="item sm">
                    <i class="icon fal fa-layer-group" />
                    <span class="name">{{ tr('CHG_PRO') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickChangePool">
                  <div class="item sm">
                    <i class="icon fal fa-map-pin" />
                    <span class="name">{{ tr('CHG_POOL') }}</span>
                  </div>
                </b-dropdown-item>

                <b-dropdown-divider />

                <b-dropdown-item @click="onClickCollectInfo">
                  <div class="item sm">
                    <i class="icon fal fa-sync-alt" />
                    <span class="name">{{ tr('COL_INFO') }}</span>
                  </div>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDragHorizontal>

    <ActionCheckModal ref="IDSV001_ActionCheckModal" 
                      :data="selectedServers" 
                      :fields="multiActionFields"
                      :action="action"
                      :title="actionCheckTitle"
                      :type="actionCheckType"
                      :text="actionCheckText"
                      primary-key="user_id"
                      @succeed="listServers"
                      @failed="listServers"
    />

    <BaseTabNav v-if="hasSelectedServer" class="server-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                :use-slot="true"
    >
      <template #SUMMARY>
        <b-card class="base first-tab">
          <ServerSummary :server-data="selectedItems[0].data" />
        </b-card>
      </template>
      <template #DATA>
        <ServerData />
      </template>
      <template #RAWDATA>
        <ServerRawData />
      </template>
      <template #ADMIN>
        <ServerAdmin />
      </template>
    </BaseTabNav>
    <div v-else class="empty">
      <span class="msg">{{ tr('PANEL.NO_SELECT', [tr('SERVER')]) }}</span>
    </div>
  </div>
</template>

<script>
import contextData from './search_context/query.js';

import BaseDragHorizontal from '@/components/base/drag/BADG_002_BaseDragHorizontal.vue';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';

const ActionCheckModal = () => import('@/components/base/modal/BAMO_003_EXT_ActionCheckModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

const ServerSummary = () => import('@/views/inventory/server/IVSV_002_ServerSummary');
const ServerData = () => import('@/views/inventory/server/IVSV_003_ServerData');
const ServerRawData = () => import('@/views/inventory/server/IVSV_004_ServerRawData');
const ServerAdmin = () => import('@/views/inventory/server/IVSV_005_ServerAdmin');

export default {
    name: 'Server',
    components: {
        BaseDragHorizontal,
        BaseTable,
        ActionCheckModal,
        BaseTabNav,
        ServerSummary,
        ServerData,
        ServerRawData,
        ServerAdmin

    },
    data() {
        return {
            tabs: [
                {
                    tabTitle: this.tr('COL_NM.C_SUMMARY'),
                    tabIdxTitle: 'SUMMARY'
                },
                {
                    tabTitle: this.tr('COL_NM.C_DT'),
                    tabIdxTitle: 'DATA'
                },
                {
                    tabTitle: this.tr('COL_NM.C_RAW_DT'),
                    tabIdxTitle: 'RAWDATA'
                },
                {
                    tabTitle: this.tr('COL_NM.C_ADMIN'),
                    tabIdxTitle: 'ADMIN'
                }
            ],
            servers: [],
            selectedItems: [],
            selectedIdx: null,
            addModal: false,
            totalCount: 0,
            isReadyForSearch: false,
            isLoading: true,
            contextData: contextData,
            query: { 
                sort: {}, 
                page: {
                    start: 0, 
                    limit: 10
                }, 
                filter: [],
                filter_or: []
            },
            action: null,
            actionCheckTitle: '',
            actionCheckType: '',
            actionCheckText: ''
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected' },
                { key: 'user_id', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: false },
                { key: 'name', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true },
                { key: 'state', label: this.tr('COL_NM.IP'), sortable: true, ajaxSortable: true },
                { key: 'password', label: this.tr('COL_NM.CORE'), sortable: true, ajaxSortable: false },
                { key: 'user_first_name', label: this.tr('COL_NM.MEMORY'), sortable: true, ajaxSortable: false },
                { key: 'user_last_name', label: this.tr('COL_NM.O_TYPE'), sortable: true, ajaxSortable: false },
                { key: 'mobile', label: this.tr('COL_NM.O_DIS'), sortable: true, ajaxSortable: false },
                { key: 'role_id', label: this.tr('COL_NM.SE_TYPE'), sortable: true, ajaxSortable: false },
                { key: 'project_id', label: this.tr('COL_NM.PLATFORM'), sortable: true, ajaxSortable: true },
                { key: 'pp', label: this.tr('COL_NM.PROJ'), sortable: true, ajaxSortable: false },
                { key: 'pool', label: this.tr('COL_NM.POOL'), sortable: true, ajaxSortable: false },
                { key: 'project_group_id', label: this.tr('COL_NM.UPDATE'), sortable: true, ajaxSortable: false },
                { key: 'query', label: this.tr('COL_NM.DISK_SZ'), sortable: true, ajaxSortable: false }
            ];
        },
        multiInfoFields () {
            return [
                { key: 'user_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') },
                { key: 'group', label: this.tr('COL_NM.GROUP') }
            ];
        },
        multiActionFields () {
            return [
                { key: 'user_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') }
            ];
        },
        isMultiSelected () {
            return this.selectedItems.length > 1;
        },
        hasSelectedServer () {
            return this.selectedItems.length > 0;
        },
        selectedServers () {
            return this.selectedItems.map((item) => {
                return item.data;
            });
        }
    },
    mounted() {
        this.listServers();
    },
    methods: {
        reset() {
            this.servers = [];
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
        async listServers (limit, start, sort, filter, filterOr) {
            this.reset();
            this.setQuery(limit, start, sort, filter, filterOr);
            let res = null;
            try {
                res = await this.$axios.post('/inventory/server/list', {
                    query: this.query,
                    domain_id: sessionStorage.getItem('domainId')
                });
                console.log('server data', res.data.results);
                this.servers = res.data.results;
                this.totalCount = res.data.total_count;
                this.isLoading = false;
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('SERVER')]));
                this.isLoading = false;
            }
        },
        rowSelected (rows) {
            this.selectedItems = rows;
        },
        onAllRowSelected (isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged(val) {
            this.query.page.limit = Number(val);
            this.listServers();
        },
        getParams (items) {
            let params = { servers: []};
            items.map((item) => {
                params.servers.push(item.user_id);
            });
            return params;
        },
        async deleteServer (commitItems) {
            await this.$axios.post('/identity/user/delete', this.getParams(commitItems));
        },
        onClickDelete () {
            this.action = this.deleteServer;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
            this.actionCheckType = 'danger';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
        },
        onClickSetMaintenance () {

        },
        onClickSetInService () {

        },
        onClickSetClosed () {

        },
        onClickChangeProject () {

        },
        onClickChangePool () {

        },
        onClickCollectInfo () {

        },
        showActionModal () {
            this.$refs.IDSV001_ActionCheckModal.showModal();
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
.server-table {
    margin-top: 20px;
}
.server-info {
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
.icon {
    font-size: 1rem !important;
}
</style>
