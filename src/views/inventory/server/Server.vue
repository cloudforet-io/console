<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.route" />
        </div>
        <p-page-title title="Server"
                      use-total-count use-selected-count
                      :total-count="typeOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-layout v-if="tableState.schema"
                                  type="query-search-table"
                                  :options="tableState.schema.options"
                                  :data="tableState.items"
                                  :fetch-options="fetchOptionState"
                                  :type-options="typeOptionState"
                                  :style="{height: `${height}px`}"
                                  :field-handler="fieldHandler"
                                  @init="listServerData"
                                  @fetch="fetchTableData"
                                  @select="onSelect"
                                  @export="exportServerData"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            :disabled="tableState.selectedItems.length === 0"
                                            @click="clickCollectData"
                        >
                            {{ $t('BTN.COLLECT_DATA') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn
                            id="server-dropdown-btn"
                            class="left-toolbox-item mr-4"
                            :menu="tableState.dropdown"
                            @click-in-service="clickInService"
                            @click-maintenance="clickMaintenance"
                            @click-closed="clickClosed"
                            @click-delete="clickDelete"
                            @click-project="clickProject"
                        >
                            {{ $t('BTN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                </p-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <p-server-detail :server-id="tableState.selectedServerIds[0]" />
            </template>
            <template #tag>
                <s-tags-panel :resource-id="tableState.selectedServerIds[0]"
                              resource-type="inventory.Server"
                              resource-key="server_id"
                />
            </template>
            <template #admin>
                <server-admin :server-ids="tableState.selectedServerIds" />
            </template>
            <template #history>
                <server-history :server-id="tableState.selectedServerIds[0]" />
            </template>
            <template #monitoring>
                <s-monitoring :resource-type="monitoringState.resourceType"
                              :resources="monitoringState.resources"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="typeOptionState.selectIndex.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table class="selected-data-tab"
                              :fields="tableState.multiFields"
                              :sortable="false"
                              :selectable="false"
                              :items="tableState.selectedItems"
                              :col-copy="true"
                >
                    <template v-slot:col-state-format="data">
                        <p-status v-bind="serverStateFormatter(data.value)" />
                    </template>
                    <template />
                </p-data-table>
            </template>
            <template #admin>
                <server-admin :server-ids="tableState.selectedServerIds" />
            </template>
            <template #monitoring>
                <s-monitoring :resource-type="monitoringState.resourceType"
                              :resources="monitoringState.resources"
                />
            </template>
        </p-tab>

        <div v-else class="empty-space">
            Select a Server above for details.
        </div>
        <p-table-check-modal v-if="!!checkTableModalState.visible"
                             :visible.sync="checkTableModalState.visible"
                             :header-title="checkTableModalState.title"
                             :sub-title="checkTableModalState.subTitle"
                             :theme-color="checkTableModalState.themeColor"
                             :fields="tableState.multiFields"
                             size="lg"
                             :centered="true"
                             :selectable="false"
                             :items="tableState.selectedItems"
                             @confirm="checkModalConfirm"
        />
        <s-project-tree-modal :visible.sync="changeProjectState.visible"
                              :project-id="changeProjectState.projectId"
                              :loading="changeProjectState.loading"
                              @confirm="changeProject"
        />
        <s-collect-modal :visible.sync="tableState.collectModalVisible"
                         :resources="tableState.selectedItems"
                         id-key="server_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive,
} from '@vue/composition-api';

/* Components */
import PStatus from '@/components/molecules/status/PStatus.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

/* Page Modules */
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import SCollectModal from '@/views/common/collect-modal/CollectModal.vue';
import SMonitoring from '@/views/common/monitoring/Monitoring.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import ServerAdmin from '@/views/inventory/server/modules/ServerAdmin.vue';
import ServerHistory from '@/views/inventory/server/modules/ServerHistory.vue';

/* types */
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { QuerySearchTableTypeOptions, QuerySearchTableFetchOptions, QuerySearchTableListeners } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { MonitoringProps, MonitoringResourceType } from '@/views/common/monitoring/type';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';
import { ServerModel } from '@/models/inventory/server';


import { get } from 'lodash';
import {
    serverStateFormatter, showErrorMessage, showSuccessMessage,
} from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import {
    queryStringToQueryTags, queryTagsToQueryString, replaceQuery,
} from '@/lib/router-query-string';
import {
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-utils/dynamic-layout';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import config from '@/lib/config';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { store } from '@/store';
import { makeDistinctValueHandlerMap } from '@/lib/component-utils/query-search';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';


const DEFAULT_PAGE_SIZE = 15;

// TODO: move this code to store
const STORAGE_PREFIX = 'inventory/server';
const serverStore = {
    getItem<T>(name: string, type = 'string'): T {
        const res = localStorage.getItem(`${STORAGE_PREFIX}/${name}`);
        switch (type) {
        case 'number': {
            if (res) return Number(res) as unknown as T;
            return undefined as unknown as T;
        }
        case 'object': {
            try {
                if (res) return JSON.parse(res) as unknown as T;
            } catch (e) {}
            return undefined as unknown as T;
        }
        default: return (res || undefined) as unknown as T;
        }
    },

    setItem(name: string, data: any, type = 'string') {
        let res;
        switch (type) {
        case 'number': {
            res = Number(data);
            break;
        }
        case 'object': {
            try {
                res = JSON.stringify(data);
            } catch (e) {}
            break;
        }
        default: {
            res = data;
            break;
        }
        }
        localStorage.setItem(`${STORAGE_PREFIX}/${name}`, res);
    },
};

export default {
    name: 'Server',
    components: {
        ServerHistory,
        ServerAdmin,
        PDynamicLayout,
        GeneralPageLayout,
        PStatus,
        PHorizontalLayout,
        PDropdownMenuBtn,
        PServerDetail,
        PTab,
        PDataTable,
        PTableCheckModal,
        PIconTextButton,
        SProjectTreeModal,
        SCollectModal,
        SMonitoring,
        STagsPanel,
        PPageTitle,
        PPageNavigation,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        /** Breadcrumb */
        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Server', path: '/inventory/server' }],
        });


        /** Server Table */
        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: serverStore.getItem<number>('pageLimit', 'number') || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const typeOptionState: QuerySearchTableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItems: [],
            valueHandlerMap: {},
            colCopy: false,
        });

        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
            dropdown: computed(() => makeTrItems([
                ['delete', 'BTN.DELETE'],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO'],
                [null, null, { type: 'divider' }],
                ['link', null, {
                    label: 'Console',
                    disabled: !tableState.consoleLink,
                    link: tableState.consoleLink,
                    target: 'blank',
                }],
            ],
            context.parent,
            { type: 'item', disabled: tableState.selectedItems.length === 0 })),
            collectModalVisible: false,
            multiFields: computed(() => makeTrItems([
                ['name', 'COMMON.NAME'],
                ['state', 'COMMON.STATE'],
                ['primary_ip_address', 'COMMON.IP'],
                ['os_type', 'COMMON.O_TYPE'],
            ],
            context.parent)),
            selectedServerIds: computed(() => tableState.selectedItems.map(d => d.server_id)),
        });

        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };

        const getQuery = () => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(fetchOptionState.queryTags);

            const query = new QueryHelper();
            query.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilter(...andFilters)
                .setFilterOr(...orFilters)
                .setKeyword(...keywords);

            query.setOnly(...typeOptionState.keyItems.map(d => d.name), 'server_id', 'collection_info.collectors');
            if (tableState.schema?.options?.fields) {
                query.setOnly(...tableState.schema.options.fields.map((d) => {
                    if ((d.key as string).endsWith('.seconds')) return (d.key as string).replace('.seconds', '');
                    return d.key;
                }), 'reference', 'server_id', 'primary_ip_address', 'collection_info.collectors');
            }

            return query.data;
        };

        const serverListApi = SpaceConnector.client.inventory.server.list;
        const listServerData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await serverListApi({ query: getQuery() });
                tableState.items = res.results;
                typeOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                tableState.items = [];
                typeOptionState.totalCount = 0;
            } finally {
                typeOptionState.loading = false;
            }
        };

        const fetchTableData: QuerySearchTableListeners['fetch'] = async (options, changed) => {
            if (changed.sortBy !== undefined) {
                fetchOptionState.sortBy = changed.sortBy;
                fetchOptionState.sortDesc = !!changed.sortDesc;
            }
            if (changed.pageLimit !== undefined) {
                fetchOptionState.pageLimit = changed.pageLimit;
                serverStore.setItem('pageLimit', changed.pageLimit);
            }
            if (changed.pageStart !== undefined) {
                fetchOptionState.pageStart = changed.pageStart;
            }
            if (changed.queryTags !== undefined) {
                fetchOptionState.queryTags = changed.queryTags;
                // sync updated query tags to url query string
                replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
            }

            await listServerData();
        };

        const getTableSchema = async () => {
            try {
                const res = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.Server',
                    schema: 'table',
                });

                // declare keyItems and valueHandlerMap with search schema
                if (res?.options?.search) {
                    const searchProps = makeQuerySearchPropsWithSearchSchema(res.options.search, 'inventory.Server');
                    typeOptionState.keyItems = searchProps.keyItems;
                    typeOptionState.valueHandlerMap = searchProps.valueHandlerMap;

                    // declare keyItems and valueHandlerMap with table fields
                } else if (res?.options?.fields) {
                    typeOptionState.keyItems = res.options.fields.map(d => ({ label: d.name, name: d.key }));
                    typeOptionState.valueHandlerMap = makeDistinctValueHandlerMap(typeOptionState.keyItems, 'inventory.Server');
                }

                // initiate queryTags with keyItems
                fetchOptionState.queryTags = queryStringToQueryTags(vm.$route.query.filters, typeOptionState.keyItems);

                // set schema to tableState -> create dynamic layout
                tableState.schema = res;
            } catch (e) {
                console.error(e);
            }
        };

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const exportServerData = async () => {
            try {
                const res = await exportApi({
                    source: {
                        url: '/inventory/server/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: typeOptionState.timezone,
                        },
                        data_source: tableState.schema.options.fields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
        };

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };


        /** Change Project */
        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (tableState.selectedItems.length > 1) return '';
                return get(tableState.selectedItems[0], 'project_id', '');
            }),
        });
        const clickProject = () => { changeProjectState.visible = true; };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;

            const api = SpaceConnector.client.inventory.server.changeProject;
            const params: any = {
                servers: tableState.selectedServerIds,
            };
            if (data) {
                try {
                    params.project_id = data.id;
                    await api(params);
                    showSuccessMessage('Success', 'Project has been successfully changed.', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
                } finally {
                    await store.dispatch('resource/project/load');
                    await listServerData();
                }
            } else {
                try {
                    params.release_project = true;
                    await api(params);
                    showSuccessMessage('Success', 'Release Project Success', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Release Project', e, context.root);
                } finally {
                    await listServerData();
                }
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['tag', 'TAB.TAG'],
                ['admin', 'TAB.MEMBER'],
                ['history', 'TAB.HISTORY'],
                ['monitoring', 'TAB.MONITORING'],
            ],
            context.parent)),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: makeTrItems([
                ['data', 'TAB.DATA'],
                ['admin', 'TAB.MEMBER'],
                ['monitoring', 'TAB.MONITORING'],
            ], context.parent),
            activeTab: 'data',
        });


        /** Actions & Checking */
        const checkTableModalState = reactive({
            visible: false,
            item: null,
            title: '',
            subTitle: '',
            themeColor: '',
            api: null as any,
            params: null as any,
        });

        const stateChangeApi = SpaceConnector.client.inventory.server.changeState;
        const deleteApi = SpaceConnector.client.inventory.server.delete;

        const resetCheckTableModalState = () => {
            checkTableModalState.visible = false;
            checkTableModalState.title = '';
            checkTableModalState.subTitle = '';
            checkTableModalState.themeColor = '';
            checkTableModalState.api = null;
            checkTableModalState.params = null;
        };

        const clickDelete = () => {
            checkTableModalState.title = 'Server Delete';
            checkTableModalState.subTitle = 'Are you Sure?';
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
            checkTableModalState.api = deleteApi;
            checkTableModalState.params = {};
        };
        const clickMaintenance = () => {
            checkTableModalState.title = 'Set Maintenance';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
            checkTableModalState.api = stateChangeApi;
            checkTableModalState.params = { state: 'MAINTENANCE' };
        };

        const clickInService = () => {
            checkTableModalState.title = 'Set In-Service';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
            checkTableModalState.api = stateChangeApi;
            checkTableModalState.params = { state: 'INSERVICE' };
        };
        const clickClosed = () => {
            checkTableModalState.title = 'Set Closed';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
            checkTableModalState.api = stateChangeApi;
            checkTableModalState.params = { state: 'CLOSED' };
        };

        const checkModalConfirm = async (items: ServerModel[]) => {
            try {
                await checkTableModalState.api({
                    ...checkTableModalState.params,
                    servers: items.map(item => item.server_id),
                });
                showSuccessMessage('Success', '', context.root);
            } catch (e) {
                showErrorMessage('Request Fail', e, context.root);
            } finally {
                typeOptionState.selectIndex = [];
                resetCheckTableModalState();
                await listServerData();
            }
        };

        const clickCollectData = () => {
            tableState.collectModalVisible = true;
        };


        /** Monitoring Tab */
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.Server',
            resources: computed(() => tableState.selectedItems.map(d => ({
                id: get(d, 'server_id'),
                name: d.name,
            }))) as unknown as MonitoringResourceType[],
        });


        /** ******* Page Init ******* */
        const init = async () => {
            await getTableSchema();
            await store.dispatch('resource/loadAll');
            await listServerData();
        };

        init();
        /** ************************* */

        return {
            /* Breadcrumb */
            routeState,

            /* Server Table */
            tableState,
            fetchOptionState,
            typeOptionState,
            onSelect,
            exportServerData,
            listServerData,
            fetchTableData,
            fieldHandler,

            /* Change Project */
            changeProjectState,
            clickProject,
            changeProject,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,

            /* Actions & Checking */
            checkTableModalState,
            clickDelete,
            clickClosed,
            clickInService,
            clickMaintenance,
            checkModalConfirm,
            clickCollectData,

            /* Monitoring Tab */
            monitoringState,

            serverStateFormatter,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item {
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

    .empty-space {
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }

    .selected-data-tab {
        @apply mt-8;
    }

    >>> .p-dynamic-layout-query-search-table .p-query-search-table {
        border-width: 1px;
    }
</style>
