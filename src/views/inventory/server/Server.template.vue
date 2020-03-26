<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table
                    ref="toolbox"
                    :items="apiHandler.tableTS.state.items"
                    :fields="fields"
                    :selectable="true"
                    :sortable="true"
                    :dragable="true"
                    :hover="true"
                    :responsive="true"
                    :responsive-style="{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}"
                    :setting-visible="false"
                    :use-spinner-loading="true"
                    :use-cursor-loading="true"
                    :all-page="apiHandler.tableTS.state.allPage"
                    :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                    :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                    :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                    :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                    :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                    :loading.sync="apiHandler.tableTS.syncState.loading"
                    @changePageSize="apiHandler.getData()"
                    @changePageNumber="apiHandler.getData()"
                    @clickRefresh="apiHandler.getData()"
                    @changeSort="apiHandler.getData()"
                >
                    <template #toolbox-left>
                        <p-button style-type="primary-dark" :disabled="true" @click="clickCollectData">
                            {{ $t('BTN.COLLECT_DATA') }}
                        </p-button>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-in-service="clickInService"
                            @click-maintenance="clickMaintenance"
                            @click-closed="clickClosed"
                            @click-delete="clickDelete"
                            @click-project="clickProject"
                            @click-link="openLink"
                            @click-exportExcel="exportToolSet.getData()"
                        >
                            Action
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-query-search-bar
                                    :search-text.sync="apiHandler.tableTS.querySearch.state.searchText"
                                    :autocomplete-handler="apiHandler.tableTS.querySearch.acHandler"
                                    @newQuery="apiHandler.tableTS.querySearch.addTag"
                            />
                        </div>
                    </template>

                    <template v-if="apiHandler.tableTS.querySearch.tags.value.length >= 1"#toolbox-bottom>
                        <p-col :col="12" style="margin-bottom: .5rem;">
                            <p-hr style="width: 100%;" />
                            <p-query-search-tags style="margin-top: .5rem;"
                                                 :tags="apiHandler.tableTS.querySearch.tags.value"
                                                 @deleteTag="apiHandler.tableTS.querySearch.deleteTag"
                                                 @deleteAllTags="apiHandler.tableTS.querySearch.deleteAllTags"
                            />
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
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail>
                <p-server-detail :item="apiHandler.tableTS.selectState.firstSelectItem" :tag-confirm-event="tagConfirmEvent" :tag-reset-event="tagResetEvent" />
            </template>
            <template #data>
                <PDynamicSubData
                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.server_id" :sub-data="apiHandler.tableTS.selectState.firstSelectItem.metadata.sub_data"
                    url="/inventory/server/get-data" id-key="server_id"
                />
            </template>
            <template #rawData>
                <p-raw-data :item="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #admin>
                <p-dynamic-view :api-handler="adminApiHandler" view_type="table" :data_source="adminApiHandler.dataSource" />
            </template>
            <template #history>
                <p-dynamic-view :api-handler="historyAPIHandler" view_type="table" :data_source="historyAPIHandler.dataSource" />
            </template>
        </p-tab>
        <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">
            <template #data>
                <p-data-table
                    :fields="multiSelectFields"
                    :sortable="false"
                    :selectable="false"
                    :items="apiHandler.tableTS.selectState.selectItems"
                    :col-copy="true"
                >
                    <template v-slot:col-state-format="data">
                        <p-status v-bind="serverStateFormatter(data.value)" />
                    </template>
                    <template />
                </p-data-table>
            </template>
            <template #admin>
                <p-dynamic-view :api-handler="adminApiHandler" view_type="table" :data_source="adminApiHandler.dataSource" />
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
            :items="apiHandler.tableTS.selectState.selectItems"

            @confirm="checkModalConfirm"
        />
        <s-project-tree-modal :visible.sync="projectModalVisible" @confirm="changeProject" />
    </general-page-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs, ref, computed,
} from '@vue/composition-api';
import _ from 'lodash';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import {
    timestampFormatter, serverStateFormatter, platformBadgeFormatter, getValue,
} from '@/lib/util';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { makeTrItems } from '@/lib/view-helper';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail.vue';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import {
    MockAdminTableAPI, MockHistoryAPI, QuerySearchTableFluentAPI,
} from '@/lib/api/table';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { ChangeServerProject, MockChangeProject } from '@/lib/api/fetch';
import fluentApi from "@/lib/fluent-api";
import {ExcelExportAPIToolSet} from "@/lib/api/add-on";
import {
    getEnumValues, getFetchValues, makeValuesFetchHandler
} from "@/components/organisms/search/query-search-bar/autocompleteHandler";
import PQuerySearchTags from "@/components/organisms/search/query-search-tags/QuerySearchTags.vue";
import {QSTableACHandlerArgs, QuerySearchTableACHandler} from "@/lib/api/auto-complete";


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


export const serverSetup = (props, context, eventName,apiHandler,  ChangeProjectAPI:ChangeServerProject) => {

    const fields= makeTrItems([
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
        context.parent);
    const multiSelectFields= makeTrItems([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['primary_ip_address', 'COMMON.IP'],
        ['os_type', 'COMMON.O_TYPE'],
    ],
    context.parent);

    const eventBus = serverEventBus;
    const tabData = reactive({
        tabs: makeTrItems([
            ['detail', 'TAB.DETAILS'],
            ['data', 'TAB.DATA'],
            ['rawData', 'TAB.RAW_DATA'],
            ['admin', 'TAB.ADMIN'],
            ['history', 'TAB.HISTORY'],
        ],
        context.parent),
        activeTab: 'detail',
        multiSelectTabs: makeTrItems([
            ['data', 'TAB.DATA', { keepAlive: true }],
            ['admin', 'TAB.ADMIN'],
        ], context.parent),
        multiSelectActiveTab: 'data',
    });
    const tags = ref({});


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

    const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);

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
    const link = computed(():string|undefined => {
        if (apiHandler.tableTS.selectState.isSelectOne) {
            return _.get(apiHandler.tableTS.selectState.firstSelectItem, 'reference.external_link');
        }
        return undefined;
    });
    const openLink = () => {
        if (link.value) {
            window.open((link.value as string));
        }
    };

    const noLink = computed(() => !link.value);
    const dropdown = reactive({
        ...makeTrItems([
            ['delete', 'BTN.DELETE'],
            [null, null, { type: 'divider' }],
            ['in-service', 'INVENTORY.BTN.SET_INSERVICE'],
            ['maintenance', 'INVENTORY.BTN.SET_MAINTENANCE'],
            ['closed', 'INVENTORY.BTN.SET_CLOSE'],
            [null, null, { type: 'divider' }],
            ['project', 'COMMON.CHG_PRO'],
            ['pool', 'BTN.CHG_POOL', { disabled: true }],
            [null, null, { type: 'divider' }],
            ['link', null, { label: 'console', disabled: noLink }],
            ['exportExcel', null, { label: 'Export', disabled: false }],
        ],
        context.parent,
        { type: 'item', disabled: isNotSelected }),
    });

    const projectModalVisible = ref(false);
    const clickProject = () => {
        projectModalVisible.value = true;
    };
    const changeProject = async (node?:ProjectNode|null) => {
        await ChangeProjectAPI.fetchData(apiHandler.tableTS.selectState.firstSelectItem.server_id , node ? node.data.id : undefined);
        await apiHandler.getData();
        projectModalVisible.value = false;
    };
    const exportAction = fluentApi.addons().excel().export();

    const exportToolSet= new ExcelExportAPIToolSet(exportAction,apiHandler);
    return {
        ...toRefs(tabData),
        tags,
        dropdown,
        serverStateFormatter,
        timestampFormatter,
        platformBadgeFormatter,
        clickCollectData() {
            console.debug('add');
        },
        clickMenuEvent(menuName) {
            console.debug(menuName);
        },
        // todo: need confirm that this is good way - sinsky
        // EventBus Names
        ...eventNames,
        admin,
        checkTableModalState,
        clickDelete,
        clickClosed,
        clickInService,
        clickMaintenance,
        checkModalConfirm,
        projectModalVisible,
        clickProject,
        changeProject,
        openLink,
        apiHandler,
        fields,
        multiSelectFields,
        exportToolSet,
    };
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
        PQuerySearchTags,
        PServerDetail,
        PTab,
        PDynamicSubData,
        PRawData,
        PDataTable,
        PQuerySearchBar,
        PTableCheckModal,
        PRow,
        PCol,
        PHr,
        PIconButton,
        PDynamicView,
        SProjectTreeModal,
    },
    setup(props, context) {
        const action =  fluentApi.inventory().server().list();
        const apiHandler = new QuerySearchTableFluentAPI(
            action,
            undefined,
            undefined,
        );

        const state:any = serverSetup(
            props,
            context,
            eventNames,
            apiHandler,
            new MockChangeProject(),
        );
        const mockAdminAPI = MockAdminTableAPI();
        const mockHistoryAPIHandler = MockHistoryAPI();

        return {
            ...toRefs(state),
            apiHandler,
            adminApiHandler: mockAdminAPI,
            historyAPIHandler: mockHistoryAPIHandler,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    #empty-space{
        text-align: center;
        margin-bottom: 0.5rem;
        @apply text-primary2;
        /*color: $primary2;*/
        /*font: 24px/32px Arial;*/
    }
</style>
