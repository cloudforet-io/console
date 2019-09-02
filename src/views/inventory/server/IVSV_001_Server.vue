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
                      :fields="multiInfoFields"
                      :action="action"
                      :title="actionCheckTitle"
                      :type="actionCheckType"
                      :text="actionCheckText"
                      primary-key="server_id"
                      @succeed="listServers"
                      @failed="listServers"
    />

    <BaseModal ref="IDSV001_ProjectModal"
               :title="tr('PROJECT')"
               centered
               hide-footer
    >
      <template #contents>
        <BaseSimpleTree ref="IDSV001_ProjectTree" 
                        :tree-prop="treeData"
                        @selected="selectProject"
                        @toggled="getNextLayerProject"
        />
      </template>
    </BaseModal>


    <BaseTabNav v-if="hasSelectedServer" class="server-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                :use-slot="true"
    >
      <template #SUMMARY>
        <b-card class="base first-tab">
          <BaseMultiPanel v-if="isMultiSelected" 
                          :data="selectedServers"
                          :data-fields="multiInfoFields" 
          />
          <ServerSummary v-else 
                         :server-data="selectedItems[0].data"
                         @update="updateSelectedServerInfo"
          />
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

const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseSimpleTree = () => import('@/components/base/tree/BATR_002_BaseSimpleTree');

const ActionCheckModal = () => import('@/components/base/modal/BAMO_003_EXT_ActionCheckModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

const BaseMultiPanel = () => import('@/components/base/panel/BAPA_005_BaseMultiPanel');
const ServerSummary = () => import('@/views/inventory/server/IVSV_002_ServerSummary');
const ServerData = () => import('@/views/inventory/server/IVSV_003_ServerData');
const ServerRawData = () => import('@/views/inventory/server/IVSV_004_ServerRawData');
const ServerAdmin = () => import('@/views/inventory/server/IVSV_005_ServerAdmin');

export default {
    name: 'Server',
    components: {
        BaseDragHorizontal,
        BaseTable,
        BaseModal,
        BaseSimpleTree,
        ActionCheckModal,
        BaseTabNav,
        BaseMultiPanel,
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
            defaultFilterItem: { key: 'state', value: ['DELETED'], operator: 'not_in' }, 
            action: null,
            actionCheckTitle: '',
            actionCheckType: '',
            actionCheckText: '',
            treeData: [],
            project: null
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'server_id', label: `${this.tr('SERVER')} ${this.tr('ID')}`, sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '180px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'primary_ip_address', label: this.tr('COL_NM.IP'), sortable: true, ajaxSortable: true },
                { 
                    key: 'core', 
                    label: this.tr('COL_NM.CORE'), 
                    sortable: true, 
                    ajaxSortable: false,
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        return data.data.base.core;
                    },
                    thStyle: { width: '100px' }
                },
                { 
                    key: 'memory', 
                    label: this.tr('COL_NM.MEMORY'), 
                    sortable: true, 
                    ajaxSortable: false,
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        return data.data.base.memory;
                    },
                    thStyle: { width: '100px' }
                },
                { key: 'os_type', label: this.tr('COL_NM.O_TYPE'), sortable: true, ajaxSortable: true },
                { 
                    key: 'os_distro', 
                    label: this.tr('COL_NM.O_DIS'),
                    sortable: true, 
                    ajaxSortable: false,
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        if (this.isEmpty(data.data.os)) {
                            return '';
                        } else {
                            return data.data.os.os_distro;
                        }
                    } 
                },
                { key: 'server_type', label: this.tr('COL_NM.SE_TYPE'), sortable: true, ajaxSortable: true },
                { 
                    key: 'platform_type', 
                    label: this.tr('COL_NM.PLATFORM'),
                    sortable: true, 
                    ajaxSortable: false,
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        if (this.isEmpty(data.data.vm)) {
                            return '';
                        } else {
                            return data.data.vm.platform_type;
                        }
                    } 
                },
                { key: 'project_id', label: this.tr('COL_NM.PROJ'), sortable: true, ajaxSortable: true },
                { 
                    key: 'pool_id', 
                    label: this.tr('COL_NM.POOL'),
                    sortable: true, 
                    ajaxSortable: false,
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        if (this.isEmpty(data.pool_info)) {
                            return '';
                        } else {
                            return data.pool_info.pool_id;
                        }
                    } 
                },
                {
                    key: 'updated_at', 
                    label: this.tr('COL_NM.UPDATE'), 
                    sortable: true, 
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getDatefromTimeStamp(val.seconds, localStorage.getItem('timezone'));
                    } 
                }
            ];
        },
        multiInfoFields () {
            return [
                { key: 'server_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'primary_ip_address', label: this.tr('COL_NM.IP') }
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
            this.query.filter = filter || [this.defaultFilterItem];
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
        updateSelectedServerInfo (server) {
            this.selectedItems[0].data = server;
        },
        getParams (items, state, project, pool) {
            let params = { servers: [], domain_id: sessionStorage.getItem('domainId') };
            if (state) {
                params.state = state;
            }
            if (project) {
                params.release_pool = true;
                params.pool_id = project;
            }
            if (pool) {
                params.release_pool = false;
                params.pool_id = pool;
            }
            items.map((item) => {
                params.servers.push(item.server_id);
            });
            return params;
        },
        async deleteServer (commitItems) {
            await this.$axios.post('/inventory/server/delete', this.getParams(commitItems));
        },
        async setMaintenance (commitItems) {
            await this.$axios.post('/inventory/server/change-state', this.getParams(commitItems, 'MAINTENANCE'));
        },
        async setInService (commitItems) {
            await this.$axios.post('/inventory/server/change-state', this.getParams(commitItems, 'INSERVICE'));
        },
        async setClosed (commitItems) {
            await this.$axios.post('/inventory/server/change-state', this.getParams(commitItems, 'CLOSED'));
        },
        async listProject () {
            try {
                let res = await this.$axios.post('/identity/project/tree', {
                    item_type: 'ROOT',
                    sort: { key: 'name' }
                });
                this.treeData = this.treeDataHandler(res.data, { is_root: true });
            } catch (e) {
                console.error(e);
            }
        },
        selectProject (project) {
            this.project = project;
        },
        async getNextLayerProject (nodeObj) {
            nodeObj.node.data.is_cached = true;

            let param = {
                item_type: 'PROJECT_GROUP',
                item_id:this._.get(nodeObj.node, 'data.id'),
                domain_id: sessionStorage.domainId
            };
            try {
                let res = await this.$axios.post('/identity/project/tree', param);
                let childrenNode = this.getSelectedNodeArr(res.data.items);
                nodeObj.treeV.updateNode(nodeObj.node.path, { data: nodeObj.node.data });
                if (!this.isEmpty(childrenNode)){
                    childrenNode.forEach(curItem =>{
                        nodeObj.treeV.insert({ node: nodeObj.node, placement: 'inside' }, curItem);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        },
        async changeProject (commitItems) {
            // await this.$axios.post('/inventory/server/change-pool', this.getParams(commitItems, null, ));
        },
        async changePool (commitItems) {
            await this.$axios.post('/inventory/server/change-pool', this.getParams(commitItems, 'CLOSED'));
        },
        onClickDelete () {
            this.action = this.deleteServer;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
            this.actionCheckType = 'danger';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
            this.showActionModal();
        },
        onClickSetMaintenance () {
            this.action = this.setMaintenance;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_MANT'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_MANT'), this.tr('SERVER')]);
            this.showActionModal();
        },
        onClickSetInService () {
            this.action = this.setInService;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_SERV'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_SERV'), this.tr('SERVER')]);
            this.showActionModal();
        },
        onClickSetClosed () {
            this.action = this.setClosed;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_CLOSE'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_CLOSE'), this.tr('SERVER')]);
            this.showActionModal();
        },
        onClickChangeProject () {
            this.listProject();
            this.action = this.changeProject;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('CHG_PRO'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('CHG_PRO'), this.tr('SERVER')]);
            this.showProjectModal();
        },
        onClickChangePool () {
            this.action = this.changePool;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('CHG_POOL'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('CHG_POOL'), this.tr('SERVER')]);
            this.showActionModal();
        },
        onClickCollectInfo () {

        },
        showActionModal () {
            this.$refs.IDSV001_ActionCheckModal.showModal();
        },
        showProjectModal () {
            this.$refs.IDSV001_ProjectModal.showModal();
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
