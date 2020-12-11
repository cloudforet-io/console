<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.route" />
        </div>
        <p-page-title :title="$t('INVENTORY.SERVER.MAIN.TITLE')"
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
                                            :disabled="true"
                                            @click="clickCollectData"
                        >
                            {{ $t('INVENTORY.SERVER.MAIN.COLLECT_DATA') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn
                            id="server-dropdown-btn"
                            class="left-toolbox-item mr-4"
                            :menu="tableState.dropdown"
                            @click-delete="clickDelete"
                            @click-project="clickProject"
                        >
                            {{ $t('INVENTORY.SERVER.MAIN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                </p-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #details>
                <server-details :server-id="tableState.selectedServerIds[0]" />
            </template>
            <template #tag>
                <tags-panel :resource-id="tableState.selectedServerIds[0]"
                            resource-type="inventory.Server"
                            resource-key="server_id"
                />
            </template>
            <template #member>
                <server-member :server-ids="tableState.selectedServerIds" />
            </template>
            <template #history>
                <server-history :server-id="tableState.selectedServerIds[0]" />
            </template>
            <template #monitoring>
                <monitoring :resource-type="monitoringState.resourceType"
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
                              col-copy
                >
                    <template #col-updated_at-format="{value}">
                        {{ timeFormatter(value) }}
                    </template>
                </p-data-table>
            </template>
            <template #member>
                <server-member :server-ids="tableState.selectedServerIds" />
            </template>
            <template #monitoring>
                <monitoring :resource-type="monitoringState.resourceType"
                            :resources="monitoringState.resources"
                />
            </template>
        </p-tab>

        <div v-else class="empty-space">
            <p-empty>{{ $t('INVENTORY.SERVER.MAIN.NO_SELECTED_SERVER') }}</p-empty>
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
        <project-tree-modal :visible.sync="changeProjectState.visible"
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
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

/* Page Modules */
import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import ServerDetails from '@/views/inventory/server/modules/ServerDetails.vue';
import ServerMember from '@/views/inventory/server/modules/ServerMember.vue';
import ServerHistory from '@/views/inventory/server/modules/ServerHistory.vue';
import ProjectTreeModal from '@/views/common/components/tree-modal/ProjectTreeModal.vue';
import SCollectModal from '@/views/common/components/collect-modal/CollectModal.vue';
import Monitoring from '@/views/common/components/monitoring/Monitoring.vue';
import TagsPanel from '@/views/common/components/tags/TagsPanel.vue';

/* types */
import { QuerySearchTableTypeOptions, QuerySearchTableFetchOptions, QuerySearchTableListeners } from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';
import { MonitoringProps, MonitoringResourceType } from '@/views/common/components/monitoring/type';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';
import { ServerModel } from '@/models/inventory/server';


import { get } from 'lodash';
import {
    showErrorMessage, showSuccessMessage,
} from '@/lib/util';
import {
    replaceUrlQuery,
} from '@/lib/router-query-string';
import {
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-utils/dynamic-layout';
import config from '@/lib/config';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { store } from '@/store';
import { makeDistinctValueHandler } from '@/lib/component-utils/query-search';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { TranslateResult } from 'vue-i18n';
import dayjs from 'dayjs';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import { QueryHelper } from '@/lib/query';


const DEFAULT_PAGE_SIZE = 15;

interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

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
        PEmpty,
        ServerHistory,
        ServerMember,
        PDynamicLayout,
        GeneralPageLayout,
        PHorizontalLayout,
        PDropdownMenuBtn,
        ServerDetails,
        PTab,
        PDataTable,
        PTableCheckModal,
        PIconTextButton,
        ProjectTreeModal,
        SCollectModal,
        Monitoring,
        TagsPanel,
        PPageTitle,
        PPageNavigation,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const apiQuery = new ApiQueryHelper();

        /** Breadcrumb */
        const routeState = reactive({
            route: computed(() => [{ name: vm.$t('MENU.INVENTORY.INVENTORY'), path: '/inventory' }, { name: vm.$t('MENU.INVENTORY.SERVER'), path: '/inventory/server' }]),
        });


        /** Server Table */
        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: serverStore.getItem<number>('pageLimit', 'number') || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const typeOptionState: Omit<QuerySearchTableTypeOptions, 'searchable'|'excelVisible'> = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItemSets: [],
            valueHandlerMap: {},
            colCopy: false,
        });

        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'delete', label: vm.$t('INVENTORY.SERVER.MAIN.DELETE') as string, type: 'item', disabled: tableState.selectedItems.length === 0,
                }, {
                    name: 'null', type: 'divider',
                }, {
                    name: 'project', label: vm.$t('INVENTORY.SERVER.MAIN.CHANGE_PROJECT') as string, type: 'item', disabled: tableState.selectedItems.length === 0,
                }, {
                    name: 'null', type: 'divider',
                }, {
                    name: 'link', label: vm.$t('INVENTORY.SERVER.MAIN.CONSOLE') as string, type: 'item', disabled: !tableState.consoleLink, link: tableState.consoleLink, target: 'blank',
                },
            ]),
            collectModalVisible: false,
            multiFields: computed<MenuItem[]>(() => [
                { name: 'server_id', label: 'Server ID', type: 'item' },
                { name: 'name', label: 'Name', type: 'item' },
                { name: ' primary_ip_address', label: 'Primary IP', type: 'item' },
                { name: 'server_type', label: 'Server Type', type: 'item' },
                { name: 'os_type', label: 'OS Type', type: 'item' },
                { name: 'provider', label: 'Provider', type: 'item' },
                { name: 'updated_at', label: 'Updated', type: 'item' },
            ]),
            selectedServerIds: computed(() => tableState.selectedItems.map(d => d.server_id)),
        });

        const timeFormatter = (value) => {
            let time = dayjs(dayjs.unix(value.seconds));
            if (typeOptionState.timezone !== 'UTC') {
                time = dayjs(dayjs.unix(value.seconds)).tz(typeOptionState.timezone);
            }
            return time.format('YYYY-MM-DD HH:mm:ss');
        };

        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };

        const getQuery = () => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters(queryHelper.filters);
            return apiQuery.data;
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
                /* api query setting */
                queryHelper.setFiltersAsQueryTag(changed.queryTags);
                /* sync updated query tags to url query string */
                replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }

            await listServerData();
        };

        const getTableSchema = async () => {
            try {
                const res = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.Server',
                    schema: 'table',
                });

                // declare keyItemSets and valueHandlerMap with search schema
                if (res?.options?.search) {
                    const searchProps = makeQuerySearchPropsWithSearchSchema(res.options.search, 'inventory.Server');
                    typeOptionState.keyItemSets = searchProps.keyItemSets;
                    typeOptionState.valueHandlerMap = searchProps.valueHandlerMap;
                }


                // set api query to get only a few specified data
                if (tableState.schema?.options?.fields) {
                    apiQuery.setOnly(...tableState.schema.options.fields.map((d) => {
                        if ((d.key as string).endsWith('.seconds')) return (d.key as string).replace('.seconds', '');
                        return d.key;
                    }), 'server_id', 'reference', 'primary_ip_address', 'collection_info.collectors');
                }


                // TODO: remove after test
                typeOptionState.keyItemSets.push({
                    title: 'Advanced',
                    items: [{
                        label: 'Tags',
                        name: 'tags',
                        dataType: 'object',
                        operators: ['!=', '!', '='],
                    }, {
                        label: 'Data',
                        name: 'data',
                        dataType: 'object',
                        operators: ['!=', '!', '='],
                    }, {
                        label: 'Nics',
                        name: 'nics',
                        dataType: 'object',
                        operators: ['!=', '!', '='],
                    }, {
                        label: 'Disks',
                        name: 'disks',
                        dataType: 'object',
                        operators: ['!=', '!', '='],
                    }],
                });
                typeOptionState.valueHandlerMap.tags = makeDistinctValueHandler('inventory.Server', 'tags.key');
                typeOptionState.valueHandlerMap.data = makeDistinctValueHandler('inventory.Server', 'data');


                // initiate queryTags with keyItemSets
                fetchOptionState.queryTags = queryHelper.setKeyItemSets(typeOptionState.keyItemSets).queryTags;

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
                    showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_CHANGE_PROJECT_TITLE'), '', context.root);
                } catch (e) {
                    showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_CHANGE_PROJECT_TITLE'), e, context.root);
                } finally {
                    await store.dispatch('resource/project/load');
                    await listServerData();
                }
            } else {
                try {
                    params.release_project = true;
                    await api(params);
                    showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_RELEASE_PROJECT_TITLE'), '', context.root);
                } catch (e) {
                    showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_RELEASE_PROJECT_TITLE'), e, context.root);
                } finally {
                    await listServerData();
                }
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => [
                {
                    name: 'details', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_DETAILS') as string, type: 'item',
                }, {
                    name: 'tag', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_TAG') as string, type: 'item',
                }, {
                    name: 'member', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MEMBER') as string, type: 'item',
                }, {
                    name: 'history', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_HISTORY') as string, type: 'item',
                }, {
                    name: 'monitoring', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MONITORING') as string, type: 'item',
                },
            ]),
            activeTab: 'details',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => [
                {
                    name: 'data', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_DATA') as string, type: 'item',
                }, {
                    name: 'member', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MEMBER') as string, type: 'item',
                }, {
                    name: 'monitoring', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MONITORING') as string, type: 'item',
                },
            ]),
            activeTab: 'data',
        });


        /** Actions & Checking */
        const checkTableModalState = reactive({
            visible: false,
            item: null,
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            api: null as any,
            params: null as any,
        });

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
            checkTableModalState.title = vm.$tc('INVENTORY.SERVER.MAIN.CHECK_MODAL_DELETE_TITLE', tableState.selectedItems.length);
            checkTableModalState.subTitle = vm.$tc('INVENTORY.SERVER.MAIN.CHECK_MODAL_DELETE_DESC', tableState.selectedItems.length);
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
            checkTableModalState.api = deleteApi;
            checkTableModalState.params = {};
        };

        const checkModalConfirm = async (items: ServerModel[]) => {
            try {
                await checkTableModalState.api({
                    ...checkTableModalState.params,
                    servers: items.map(item => item.server_id),
                });
                showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_CHECK_MODAL', { action: checkTableModalState.title }), '', context.root);
            } catch (e) {
                showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_CHECK_MODAL'), e, context.root);
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
            await store.dispatch('resource/loadAll');
            await getTableSchema();
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
            checkModalConfirm,
            clickCollectData,

            /* Monitoring Tab */
            monitoringState,

            timeFormatter,
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
