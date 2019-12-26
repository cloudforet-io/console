<template>
    <div class="server">
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :dragable="true"
                    :hover="true"
                    :responsive="true"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :select-index.sync="selectIndex"
                    :page-size.sync="pageSize"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}"
                    :setting-visible="false"
                    :loading="loading"
                    :use-spinner-loading="true"
                    :use-cursor-loading="true"
                    @changePageSize="getServers"
                    @changePageNumber="getServers"
                    @clickRefresh="getServers"
                    @changeSort="getServers"
                >
                    <template slot="toolbox-left">
                        <p-button style-type="primary" @click="clickCollectData">
                            Collect Data
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-in-service="clickInService"
                            @click-maintenance="clickMaintenance"
                            @click-closed="clickClosed"
                            @click-delete="clickDelete"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-search :search-text.sync="searchText" @onSearch="getServers" />
                        </div>
                    </template>
                    <template v-slot:col-state-format="data">
                        <p-status v-bind="serverStateFormatter(data.value)" />
                    </template>
                    <template />
                    <template v-slot:col-updated_at-format="data">
                        {{ timestampFormatter(data.value) }}
                    </template>
                    <template v-slot:col-core-format="data">
                        {{ data | getValue(['item','data','base','core']) }}
                    </template>
                    <template v-slot:col-memory-format="data">
                        {{ data | getValue(['item','data','base','memory']) }}
                    </template>
                    <template v-slot:col-pool-format="data">
                        {{ data | getValue(['item','pool_info','name']) }}
                    </template>
                    <template v-slot:col-os_distro-format="data">
                        {{ data | getValue(['item','data','os','od_distro']) }}
                    </template>
                    <template v-slot:col-server_type-format="data">
                        <PBadge v-bind="platformBadgeFormatter(data.value)">
                            {{ data.value }}
                        </PBadge>
                    </template>
                    <template v-slot:col-platform_type-format="data">
                        <PBadge v-bind="platformBadgeFormatter(data.item.data.vm.platform_type)">
                            {{ data | getValue(['item','data','vm','platform_type']) }}
                        </PBadge>
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-server-detail ref="serverDetail"
                                 :item="items[selectIndex[0]]"
                                 :tag-confirm-event="tagConfirmEvent"
                                 :tag-reset-event="tagResetEvent"
                />
            </template>
            <template #data="{tabName}">
                <PServerData
                    :server-id="items[selectIndex[0]].server_id"
                    :items="subData.items"
                    :sort-by.sync="subData.sortBy"
                    :sort-desc.sync="subData.sortDesc"
                    :page-size.sync="subData.pageSize"
                    :all-page="subData.allPage"
                    :this-page.sync="subData.thisPage"
                    :search-text.sync="subData.searchText"
                    :loading="subData.loading"
                    :get-server-sub-data="getServerSubData"
                />
            </template>
            <template #rawData="{tabName}">
                <p-server-raw-data :item="items[selectIndex[0]]" />
            </template>
            <template #admin="{tabName}">
                <p-server-admin :select-index="selectIndex"
                                :items="admin.items"
                                :sort-by.sync="admin.sortBy"
                                :sort-desc.sync="admin.sortDesc"
                                :page-size.sync="admin.pageSize"
                                :all-page="admin.allPage"
                                :this-page.sync="admin.thisPage"
                                :search-text.sync="admin.searchText"
                                :loading="admin.loading"
                                :get-server-admin="getServerAdmin"
                />
            </template>
        </PTab>
        <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">
            <template #data="{tabName}">
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="getSelectServerItems"
                    :col-copy="true"
                >
                    <template v-slot:col-state-format="data">
                        <p-status v-bind="serverStateFormatter(data.value)" />
                    </template>
                    <template />
                </p-data-table>
            </template>
            <template #admin="{tabName}">
                <p-server-admin :select-index="selectIndex"
                                :items="admin.items"
                                :sort-by.sync="admin.sortBy"
                                :sort-desc.sync="admin.sortDesc"
                                :page-size.sync="admin.pageSize"
                                :all-page="admin.allPage"
                                :this-page.sync="admin.thisPage"
                                :search-text.sync="admin.searchText"
                                :loading="admin.loading"
                                :get-server-admin="getServerAdmin"
                />
            </template>
        </PTab>

        <div v-else id="empty-space">
            Select a Server above for details.
        </div>
        <p-table-check-modal
            v-if="!!checkTableModalState.mode"
            :visible.sync="checkTableModalState.visible"
            :header-title="checkTableModalState.title"
            :sub-title="checkTableModalState.subTitle"
            :theme-color="checkTableModalState.themeColor"
            :fields="multiSelectFields"
            size="lg"
            :centered="true"
            :selectable="false"
            :items="getSelectServerItems"

            @confirm="checkModalConfirm"
        />
    </div>
</template>

<script>
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status';
import PButton from '@/components/atoms/buttons/Button';
import PBadge from '@/components/atoms/badges/Badge';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import {
    timestampFormatter, serverStateFormatter, platformBadgeFormatter, getValue,
} from '@/lib/util';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { makeTrItems } from '@/lib/view-helper';


const PTab = () => import('@/components/organisms/tabs/tab/Tab');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable');
const PDropdownMenuBtn = () => import('@/components/organisms/buttons/dropdown/DropdownMenuBtn');
const PSearch = () => import('@/components/molecules/search/Search');
const PServerDetail = () => import('@/views/inventory/server/modules/ServerDetail');
const PServerRawData = () => import('@/views/inventory/server/modules/ServerRawData');
const PServerData = () => import('@/views/inventory/server/modules/ServerData');
const PServerAdmin = () => import('@/views/inventory/server/modules/ServerAdmin');
const PTableCheckModal = () => import('@/components/organisms/modals/table-modal/TableCheckModal');

export const serverTableReactive = parent => reactive({
    fields: makeTrItems([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['primary_ip_address', 'COMMON.IP', { sortable: false }],
        ['core', 'COMMON.CORE'],
        ['memory', 'COMMON.MEMORY'],
        ['os_type', 'COMMON.O_TYPE'],
        ['os_distro', 'COMMON.O_DIS'],
        ['server_type', 'COMMON.SE_TYPE'],
        ['platform_type', 'COMMON.PLATFORM'],
        ['project', 'COMMON.PROJ'],
        ['pool', 'COMMON.POOL'],
        ['updated_at', 'COMMON.UPDATE'],
    ],
    parent),
    multiSelectFields: makeTrItems([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['primary_ip_address', 'COMMON.IP'],
        ['os_type', 'COMMON.O_TYPE'],
    ],
    parent),
    selectIndex: [],
    items: [],
    searchText: '',
    loading: false,
    toolbox: null, // template refs
});

/**
 * @typedef {Object} serverState
 * @property {string} sortBy
 * @property {boolean} sortDesc
 * @property {number} thisPage
 * @property {number} allPage
 * @property {number} pageSize
 * @property {Array} fields
 * @property {Array} selectIndex
 *
 */

/**
 * server default setup reactive object
 * @function
 * @return {serverState} reactive object
 */
export const eventNames = {
    tagResetEvent: '',
    tagConfirmEvent: '',
    getServerList: '',
    getServerSubData: '',
    getServerAdmin: '',
    inServiceServer: '',
    maintenanceServer: '',
    closedServer: '',
    deleteServer: '',
};

export const serverSetup = (props, context, eventName) => {
    const eventBus = serverEventBus;
    const tableState = serverTableReactive(context.parent);
    const tabData = reactive({
        tabs: makeTrItems([
            ['detail', 'COMMON.DETAILS', { keepAlive: true }],
            ['data', 'COMMON.DATA'],
            ['rawData', 'COMMON.RAWDATA', { keepAlive: true }],
            ['admin', 'COMMON.ADMIN'],
        ],
        context.parent),
        activeTab: 'detail',
        multiSelectTabs: makeTrItems([
            ['data', 'COMMON.DATA', { keepAlive: true }],
            ['admin', 'COMMON.ADMIN'],
        ], context.parent),
        multiSelectActiveTab: 'data',
        serverDetail: null, // template refs
    });
    const tags = ref({});
    const tabAction = reactive({
        isSelectedOne: computed(() => tableState.selectIndex.length === 1),
        isSelectedMulti: computed(() => tableState.selectIndex.length > 1),
    });
    const state = requestToolboxTableMetaReactive();
    state.sortBy = 'name';
    const getServers = () => {
        eventBus.$emit(eventName.getServerList);
    };
    const subData = reactive({
        items: [],
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        searchText: '',
        loading: false,
    });

    const admin = reactive({
        items: [],
        sortBy: '',
        sortDesc: true,
        pageSize: 15,
        allPage: 1,
        thisPage: 1,
        searchText: '',
        loading: false,
    });
    const sortSelectIndex = computed(() => {
        const idxs = [...tableState.selectIndex];
        idxs.sort((a, b) => a - b);
        return idxs;
    });
    const isNotSelected = computed(() => tableState.selectIndex.length === 0);
    const getSelectServerItems = computed(() => {
        const items = [];
        sortSelectIndex.value.forEach((idx) => {
            items.push(tableState.items[idx]);
        });
        return items;
    });
    const getSelectServerIds = computed(() => {
        const ids = [];
        getSelectServerItems.value.forEach((item) => {
            ids.push(item.server_id);
        });
        return ids;
    });
    const getFirstSelectServerId = computed(() => (getSelectServerIds.value.length >= 1 ? getSelectServerIds[0] : ''));

    const checkTableModalState = reactive({
        visible: false,
        mode: '',
        item: null,
        confirmEventName: '',
        title: '',
        subTitle: '',
        themeColor: '',
    });

    const resetCheckTableModalState = () => {
        checkTableModalState.visible = false;
        checkTableModalState.mode = '';
        checkTableModalState.confirmEventName = '';
        checkTableModalState.title = '';
        checkTableModalState.subTitle = '';
        checkTableModalState.themeColor = '';
    };

    const clickDelete = () => {
        checkTableModalState.mode = 'delete';
        checkTableModalState.confirmEventName = eventNames.deleteServer;
        checkTableModalState.title = 'Server Delete';
        checkTableModalState.subTitle = 'Are you Sure?';
        checkTableModalState.themeColor = 'alert';
        checkTableModalState.visible = true;
    };
    const clickMaintenance = () => {
        checkTableModalState.mode = 'maintenance';
        checkTableModalState.confirmEventName = eventNames.maintenanceServer;
        checkTableModalState.title = 'Set Maintenance';
        checkTableModalState.subTitle = 'change Server State';
        checkTableModalState.themeColor = 'primary';
        checkTableModalState.visible = true;
    };
    const clickInService = () => {
        checkTableModalState.mode = 'in-service';
        checkTableModalState.confirmEventName = eventNames.inServiceServer;
        checkTableModalState.title = 'Set In-Service';
        checkTableModalState.subTitle = 'change Server State';
        checkTableModalState.themeColor = 'primary';
        checkTableModalState.visible = true;
    };
    const clickClosed = () => {
        checkTableModalState.mode = 'closed';
        checkTableModalState.confirmEventName = eventNames.closedServer;
        checkTableModalState.title = 'Set Closed';
        checkTableModalState.subTitle = 'change Server State';
        checkTableModalState.themeColor = 'primary';
        checkTableModalState.visible = true;
    };


    const checkModalConfirm = (event) => {
        console.log(checkTableModalState.confirmEventName, event);
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };
    const dropdown = reactive({
        ...makeTrItems([
            ['delete', 'COMMON.BTN_DELETE'],
            [null, null, { type: 'divider' }],
            ['maintenance', 'COMMON.BTN_S_MANT'],
            ['in-service', 'COMMON.BTN_S_SERV'],
            ['closed', 'COMMON.BTN_S_CLOSE'],
            [null, null, { type: 'divider' }],
            ['project', 'COMMON.CHG_PRO'],
            ['pool', 'COMMON.CHG_POOL'],
        ],
        context.parent,
        { type: 'item', disabled: isNotSelected }),
    });

    return reactive({
        ...toRefs(state),
        ...toRefs(tableState),
        ...toRefs(tabData),
        ...toRefs(tabAction),
        tags,
        dropdown,
        serverStateFormatter,
        timestampFormatter,
        platformBadgeFormatter,
        clickCollectData() {
            console.log('add');
        },
        getServers,
        clickMenuEvent(menuName) {
            console.log(menuName);
        },
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
        subData,
        admin,
        getSelectServerItems,
        getSelectServerIds,
        getFirstSelectServerId,
        checkTableModalState,
        clickDelete,
        clickClosed,
        clickInService,
        clickMaintenance,
        checkModalConfirm,
    });
};

export default {
    name: 'ServerTemplate',
    filters: {
        getValue,
    },
    components: {
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PBadge,
        PDropdownMenuBtn,
        PServerDetail,
        PTab,
        PServerData,
        PServerRawData,
        PServerAdmin,
        PDataTable,
        PSearch,
        PTableCheckModal,
    },
    setup(props, context) {
        const dataBind = reactive({
            items: computed(() => []),
        });
        const state = serverSetup(props, context, dataBind.items);

        return {
            ...toRefs(state),
            ...toRefs(dataBind),
        };
    },
};

</script>

<style lang="scss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        color: $primary2;
        font: 24px/32px Arial;
    }
    .server{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
