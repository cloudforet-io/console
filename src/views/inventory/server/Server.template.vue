<template>
    <general-page-layout>
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
                        <p-button style-type="primary-dark" :disabled="true" @click="clickCollectData">
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
                            <PQuerySearchBar :search-text.sync="searchText" :autocomplete-handler="ACHandler" @newQuery="queryListTools.addTag" />
                        </div>
                    </template>
                    <template v-if="queryListTools.tags.length !== 0" slot="toolbox-bottom">
                        <p-col :col="12" style="margin-bottom: .5rem;">
                            <p-hr style="width: 100%;" />
                            <p-row style="margin-top: .5rem;">
                                <div style="flex-grow: 0">
                                    <p-icon-button name="ic_delete" @click="queryListTools.deleteAllTags" />
                                </div>
                                <div style="flex-grow: 1;margin-left: 1rem;">
                                    <p-tag v-for="(tag, idx) in queryListTools.tags" :key="idx + tag" style="margin-top: 0.375rem;margin-bottom: 0.37rem"
                                           @delete="queryListTools.deleteTag(idx)"
                                    >
                                        {{ tag.key }}:{{ tag.operator }} {{ tag.value }}
                                    </p-tag>
                                </div>
                            </p-row>
                        </p-col>
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
                        <PBadge v-bind="platformBadgeFormatter(data.item.data.platform.type)">
                            {{ data | getValue(['item','data','platform','type']) }}
                        </PBadge>
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <PTab v-if="isSelectedOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail="{tabName}">
                <p-server-detail :item="items[selectIndex[0]]" :tag-confirm-event="tagConfirmEvent" :tag-reset-event="tagResetEvent" />
            </template>
            <template #data="{tabName}">
                <PDynamicSubData
                    :select-id="getFirstSelectServerId" :sub-data="getSubData"
                    url="/inventory/server/get-data" id-key="server_id"
                />
            </template>
            <template #rawData="{tabName}">
                <p-raw-data :item="items[selectIndex[0]]" />
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
    </general-page-layout>
</template>

<script>
import {
    reactive, toRefs, ref, computed, readonly,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import { requestToolboxTableMetaReactive } from '@/components/organisms/tables/toolbox-table/ToolboxTable.util';
import {
    timestampFormatter, serverStateFormatter, platformBadgeFormatter, getValue,
} from '@/lib/util';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { makeTrItems } from '@/lib/view-helper';
import { TagList, SearchQueryUrlHandler } from '@/components/organisms/search/query-search-bar/searchQueryUrlHandler';

import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail.vue';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import PServerAdmin from '@/views/inventory/server/modules/ServerAdmin.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';

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

export const serverSetup = (props, context, eventName, ACHandler) => {
    const eventBus = serverEventBus;
    const tableState = serverTableReactive(context.parent);
    const tabData = reactive({
        tabs: makeTrItems([
            ['detail', 'COMMON.DETAILS'],
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
    const getFirstSelectServerItem = computed(() => (getSelectServerItems.value.length >= 1 ? getSelectServerItems.value[0] : {}));
    const getSubData = computed(() => _.get(getFirstSelectServerItem.value, ['metadata', 'sub_data'], []));
    const getFirstSelectServerId = computed(() => (getSelectServerIds.value.length >= 1 ? getSelectServerIds.value[0] : ''));

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
        console.debug(checkTableModalState.confirmEventName, event);
        eventBus.$emit(checkTableModalState.confirmEventName, event);
        resetCheckTableModalState();
    };
    const dropdown = reactive({
        ...makeTrItems([
            ['delete', 'COMMON.BTN_DELETE'],
            [null, null, { type: 'divider' }],
            ['in-service', 'COMMON.BTN_S_SERV'],
            ['maintenance', 'COMMON.BTN_S_MANT'],
            ['closed', 'COMMON.BTN_S_CLOSE'],
            [null, null, { type: 'divider' }],
            ['project', 'COMMON.CHG_PRO', { disabled: true }],
            ['pool', 'COMMON.CHG_POOL', { disabled: true }],
        ],
        context.parent,
        { type: 'item', disabled: isNotSelected }),
    });
    const queryList = ref([]);
    const queryListTools = tagList(queryList, true, eventBus, eventName.getServerList);
    // const queryListTools = new TagList(queryList, true, eventBus, eventName.getServerList);

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
            console.debug('add');
        },
        getServers,
        clickMenuEvent(menuName) {
            console.debug(menuName);
        },
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
        admin,
        getSelectServerItems,
        getSelectServerIds,
        getFirstSelectServerId,
        getFirstSelectServerItem,
        getSubData,
        checkTableModalState,
        clickDelete,
        clickClosed,
        clickInService,
        clickMaintenance,
        checkModalConfirm,
        ACHandler,
        queryListTools,
    });
};

export default {
    name: 'ServerTemplate',
    filters: {
        getValue,
    },
    components: {
        GeneralPageLayout,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
        PButton,
        PBadge,
        PDropdownMenuBtn,
        PServerDetail,
        PTab,
        PDynamicSubData,
        PRawData,
        PServerAdmin,
        PDataTable,
        PQuerySearchBar,
        PTag,
        PTableCheckModal,
        PRow,
        PCol,
        PHr,
        PIconButton,
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
</style>
