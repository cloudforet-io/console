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
                      :fail-message="actionFailMsg"
                      :success-message="actionSuccessMsg"
                      primary-key="server_id"
                      @succeed="listServers"
                      @failed="listServers"
    >
      <template v-if="actionCheckCase === 'tree'" #contents>
        <BaseSimpleTree :list-url="treeUrl"
                        @selected="onSelectItem"
        />
      </template>
      <template v-else-if="actionCheckCase === 'collect'" #contents>
        <b-row class="collect-contents">
          <b-col cols="6">
            <BaseTable class="collector-table"
                       :table-data="selectedServers"
                       :fields="multiInfoFields"
                       :height="400"
                       headerless
                       underlined
            />
          </b-col>
          <b-col cols="6">
            <BaseTable class="server-table"
                       :table-data="selectedServers"
                       :fields="multiInfoFields"
                       :height="400"
                       headerless
                       underlined
            />
          </b-col>
        </b-row>
      </template>

      <template v-if="actionCheckCase !== 'basic'" #footer="{ ok, cancel }">
        <div class="footer">
          <b-button class="float-right ml-1 mb-1" 
                    size="sm" 
                    type="button" 
                    variant="primary"
                    @click="ok"
          >
            {{ customActionBtn }}
          </b-button>
          <b-button class="float-right mb-1" 
                    size="sm" 
                    type="button" 
                    variant="outline-secondary"
                    @click="cancel"
          >
            {{ tr('BTN_CANCEL') }}
          </b-button>
          <span v-if="actionCheckCase === 'tree'" class="float-left">
            <BaseCheckbox v-model="isRelease" class="unset-checkbox" /> 
            <span class="unset-text">{{ customReleaseBtn }}</span>
          </span>
        </div>
      </template>
    </ActionCheckModal>

    <BaseTabNav v-if="hasSelectedServer" 
                class="server-info"
                :fill="false"
                :nav-tabs="tabs"
                :is-footer-visible="false"
                use-slot
    >
      <template #summary>
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

      <template #data>
        <ServerData :server-data="selectedItems[0].data" />
      </template>
      
      <template #rawData>
        <ServerRawData :server-data="selectedItems[0].data" />
      </template>
      <template #admin>
        <ServerAdmin :server-id="selectedItems[0].data.server_id" />
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

const BaseSimpleTree = () => import('@/components/base/tree/BATR_002_BaseSimpleTree');
const BaseCheckbox = () => import('@/components/base/checkbox/BACB_001_BaseCheckbox.vue');

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
        BaseSimpleTree,
        BaseCheckbox,
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
            servers: [],
            selectedItems: [],
            selectedIdx: null,
            addModal: false,
            totalCount: 0,
            isReadyForSearch: false,
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
            defaultFilterItem: { key: 'state', value: 'DELETED', operator: 'not' }, 
            action: null,
            actionCheckTitle: '',
            actionCheckType: '',
            actionCheckText: '',
            actionSuccessMsg: '',
            actionFailMsg: '',
            actionCheckCase: 'basic', // basic, tree, or collect
            customActionBtn: '',
            customReleaseBtn: '',
            selected: null,
            isRelease: false,
            treeUrl: '',
            projects: [],
            loadingState: {
                server: true,
                project: true
            },
            isLoading: true
        };
    },
    computed: {
        tabs () {
            if (this.isMultiSelected) {
                return [
                    {
                        title: this.tr('PANEL.DETAILS'),
                        key: 'summary'
                    },
                    {
                        title: this.tr('COL_NM.C_ADMIN'),
                        key: 'admin'
                    }
                ];
            }
            return [
                {
                    title: this.tr('PANEL.DETAILS'),
                    key: 'summary'
                },
                {
                    title: this.tr('COL_NM.C_DT'),
                    key: 'data'
                },
                {
                    title: this.tr('COL_NM.C_RAW_DT'),
                    key: 'rawData'
                },
                {
                    title: this.tr('COL_NM.C_ADMIN'),
                    key: 'admin'
                }
            ];  
        },
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                // { key: 'server_id', label: `${this.tr('SERVER')} ${this.tr('COL_NM.ID')}`, sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '300px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'primary_ip_address', label: this.tr('COL_NM.IP'), sortable: true, ajaxSortable: true, thStyle: { width: '130px' }},
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
                { key: 'os_type', label: this.tr('COL_NM.O_TYPE'), sortable: true, ajaxSortable: true, thStyle: { width: '100px' }},
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
                    } ,
                    thStyle: { width: '130px' }
                },
                { key: 'server_type', label: this.tr('COL_NM.SE_TYPE'), sortable: true, ajaxSortable: true, thStyle: { width: '120px' }},
                { 
                    key: 'platform_type', 
                    label: this.tr('COL_NM.PLATFORM'),
                    sortable: true, 
                    filterByFormatted: true,
                    formatter: (val, key, data) => {
                        if (data.data.vm) {
                            return data.data.vm.platform_type;
                        } else {
                            return '';
                        }
                    } ,
                    thStyle: { width: '100px' }
                },
                { key: 'project', label: this.tr('COL_NM.PROJ'), sortable: true, formatter: this.projectFormatter, thStyle: { width: '180px' }},
                { key: 'pool', label: this.tr('COL_NM.POOL'),sortable: true, filterByFormatted: true, formatter: this.poolFormatter, thStyle: { width: '180px' }},
                {
                    key: 'updated_at', 
                    label: this.tr('COL_NM.UPDATE'), 
                    sortable: true, 
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getDatefromTimeStamp(val.seconds, localStorage.getItem('timezone'));
                    } ,
                    thStyle: { width: '160px' }
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
    watch: {
        loadingState: {
            deep: true,
            handler () {
                if (this.loadingState.server || this.loadingState.project) {
                    this.isLoading = true;
                } else {
                    this.isLoading = false;
                }
            }
        }
    },
    mounted() {
        this.listProjects();
        this.listServers();
    },
    methods: {
        reset() {
            this.servers = [];
            this.selectedItems = [];
            this.$set(this.loadingState, 'project', true);
            this.$set(this.loadingState, 'server', true);
        },
        setQuery (limit, start, sort, filter, filterOr) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.filter = filter || [];
            this.query.filter.push(this.defaultFilterItem);
            this.query.filter_or = filterOr || [];
        },
        setProjects (projects) {
            this.projects = {};
            projects.map((project) => {
                this.projects[project.project_id] = `${project.project_group_info.name} ${project.name}`;
            });
        },
        async listProjects () {
            try {
                let res = await this.$axios.post('/identity/project/list', {
                    domain_id: sessionStorage.getItem('domainId')
                });
                this.setProjects(res.data.results);
                this.$set(this.loadingState, 'project', false);
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('SERVER')]));
                this.$set(this.loadingState, 'project', false);
            }
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
                this.servers = res.data.results;
                this.servers[0].project_id = 'project-c06a33191f2c';
                this.totalCount = res.data.total_count;
                this.$set(this.loadingState, 'server', false);
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('SERVER')]));
                this.$set(this.loadingState, 'server', false);
            }
        },
        async listCollectors () {
        },
        rowSelected (rows) {
            this.selectedItems = rows;
        },
        onAllRowSelected (isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged (val) {
            this.query.page.limit = Number(val);
            this.listServers();
        },
        updateSelectedServerInfo (server) {
            this.selectedItems[0].data = server;
        },
        getParams (items, state) {
            let params = { servers: [], domain_id: sessionStorage.getItem('domainId') };
            if (state) {
                params.state = state;
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
        async changeProject () {
            if (!this.selected && !this.isRelease) {
                this.$alertify.error(this.tr('ALERT.NO_PARAM'));
                return { stop : true };
            }
            let params = this.getParams(this.selectedServers);
            params.release_project = this.isRelease;
            params.project_id = this.selected;
            await this.$axios.post('/inventory/server/change-project', params);
        },
        async changePool () {
            if (!this.selected && !this.isRelease) {
                this.$alertify.error(this.tr('ALERT.NO_PARAM'));
                return { stop : true };
            }
            let params = this.getParams(this.selectedServers);
            params.release_pool = this.isRelease;
            params.pool_id = this.selected;
            await this.$axios.post('/inventory/server/change-pool', params);
        },
        async collectInfo () {

        },
        onClickDelete () {
            this.actionCheckCase = 'basic';
            this.action = this.deleteServer;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
            this.actionCheckType = 'danger';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DELETE'), this.tr('SERVER')]);
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [this.tr('SERVER'), this.tr('DELETE_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('DELETE_CONT'), this.tr('POOL')]);
            
            this.showActionModal();
        },
        onClickSetMaintenance () {
            this.actionCheckCase = 'basic';
            this.action = this.setMaintenance;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_MANT'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_MANT'), this.tr('SERVER')]);
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [`${this.tr('SERVER')} ${this.tr('STATE')}`, this.tr('UPT_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('UPT_CONT'), `${this.tr('SERVER')} ${this.tr('STATE')}`]);
            this.showActionModal();
        },
        onClickSetInService () {
            this.actionCheckCase = 'basic';
            this.action = this.setInService;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_SERV'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_SERV'), this.tr('SERVER')]);
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [`${this.tr('SERVER')} ${this.tr('STATE')}`, this.tr('UPT_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('UPT_CONT'), `${this.tr('SERVER')} ${this.tr('STATE')}`]);
            this.showActionModal();
        },
        onClickSetClosed () {
            this.actionCheckCase = 'basic';
            this.action = this.setClosed;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_S_CLOSE'), this.tr('SERVER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_S_CLOSE'), this.tr('SERVER')]);
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [`${this.tr('SERVER')} ${this.tr('STATE')}`, this.tr('UPT_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('UPT_CONT'), `${this.tr('SERVER')} ${this.tr('STATE')}`]);
            this.showActionModal();
        },
        onClickChangeProject () {
            this.resetTreeOptions();
            this.customActionBtn = this.tr('TITLE', [this.tr('CHG'), this.tr('PROJECT')]);
            this.customReleaseBtn = this.tr('TITLE', [this.tr('RELEASE'), this.tr('PROJECT')]);
            this.actionCheckCase = 'tree';
            this.action = this.changeProject;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('CHG'), this.tr('PROJECT')]);
            this.actionCheckType = 'light';
            this.treeUrl = '/identity/project/tree';
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [this.tr('PROJECT'), this.tr('CHG_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('CHG_CONT'), this.tr('PROJECT')]);
            this.showActionModal();
        },
        onClickChangePool () {
            this.resetTreeOptions();
            this.customActionBtn = this.tr('TITLE', [this.tr('CHG'), this.tr('POOL')]);
            this.customReleaseBtn = this.tr('TITLE', [this.tr('RELEASE'), this.tr('POOL')]);
            this.actionCheckCase = 'tree';
            this.action = this.changePool;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('CHG'), this.tr('POOL')]);
            this.actionCheckType = 'light';
            this.treeUrl = '/inventory/data-center/tree';
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [this.tr('POOL'), this.tr('CHG_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('CHG_CONT'), this.tr('POOL')]);
            this.showActionModal();
        },
        onSelectItem (nodeObj) {
            this.selected = nodeObj.node.data.id;
        },
        resetTreeOptions () {
            this.selected = null;
            this.isRelease = false;
        },
        onClickConfirmChange () {
            this.action();
        },
        onClickCollectInfo () {
            this.listCollectors();
            this.customActionBtn = this.tr('COLLECT');
            this.actionCheckCase = 'collect';
            this.action = this.collectInfo;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('COLLECT'), `${this.tr('SERVER')} ${this.tr('INFO')}`]);
            this.actionCheckType = 'light';
            this.treeUrl = '/inventory/data-center/tree';
            this.actionSuccessMsg = this.tr('ALERT.SUCCESS', [`${this.tr('SERVER')} ${this.tr('INFO')}`, this.tr('COLLECT_PAST')]);
            this.actionFailMsg = this.tr('ALERT.ERROR', [this.tr('COLLECT_CONT'), `${this.tr('SERVER')} ${this.tr('INFO')}`]);
            this.showActionModal();
        },
        showActionModal () {
            this.$refs.IDSV001_ActionCheckModal.showModal();
        },
        projectFormatter (val, key, data) {
            let result = '';
            if (data.project_id) {
                result = this.projects[data.project_id];
            }
            return result;
                
        },
        poolFormatter (val, key, data) {
            let result = '';
            if (data.pool_info && data.pool_info.name) {
                result = data.pool_info.name;
            } 
            return result;
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

.footer {
    width: 100%;
    .unset-checkbox {
        vertical-align: middle;
    }
    .unset-text {
        vertical-align: middle;
    }
}

.collect-contents {
    .collector-table {
        box-shadow: none;
    }
    .server-table {
        margin: 0;
        box-shadow: none;
    }
}
</style>
