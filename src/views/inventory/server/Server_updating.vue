<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.route" />
        </div>
        <p-page-title title="Server"
                      use-total-count use-selected-count
                      :total-count="extraOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-layout type="query-search-table"
                                  :options="tableSchema.options"
                                  :data="tableState.items"
                                  :fetch-options="fetchOptionState"
                                  :type-options="extraOptionState"
                                  :style="{height: `${height}px`}"
                                  @init="fetchTableData"
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
                <p-server-detail :server-id="tableState.selectedItems[0].server_id" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="singleItemTabState.activeTab==='tag'"
                              :resource-id="tableState.selectedItems[0].server_id"
                              tag-page-name="serverTags"
                />
            </template>
            <!--                <template #admin>-->
            <!--                    <s-dynamic-layout :api="adminApi"-->
            <!--                                      :is-show="adminIsShow" :name="$t('TAB.MEMBER')"-->
            <!--                                      v-bind="defaultAdminLayout"-->
            <!--                                      :style="{borderWidth: 0}"-->
            <!--                    />-->
            <!--                </template>-->
            <!--                <template #history>-->
            <!--                    <s-dynamic-layout :api="historyApi"-->
            <!--                                      :is-show="historyIsShow" :name="$t('TAB.HISTORY')"-->
            <!--                                      v-bind="defaultHistoryLayout"-->
            <!--                                      :style="{borderWidth: 0}"-->
            <!--                    />-->
            <!--                </template>-->
            <template #monitoring>
                <s-monitoring :resource-type="monitoringState.resourceType"
                              :resources="monitoringState.resources"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="extraOptionState.selectIndex.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table
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
            <!--                <template #admin>-->
            <!--                    <s-dynamic-layout :api="adminApi"-->
            <!--                                      :is-show="adminIsShow" :name="$t('TAB.MEMBER')"-->
            <!--                                      v-bind="defaultAdminLayout"-->
            <!--                                      :style="{borderWidth: 0}"-->
            <!--                    />-->
            <!--                </template>-->
            <template #monitoring>
                <s-monitoring :resource-type="monitoringState.resourceType"
                              :resources="monitoringState.resources"
                />
            </template>
        </p-tab>

        <div v-else class="empty-space">
            Select a Server above for details.
        </div>
        <p-table-check-modal v-if="!!checkTableModalState.mode"
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
import PTableCheckModal from '@/components/organisms/modals/action-modal/PActionConfirmModal.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import SCollectModal from '@/views/common/collect-modal/CollectModal.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import SMonitoring from '@/views/common/monitoring/Monitoring.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';


import { get } from 'lodash';

import {
    serverStateFormatter, showErrorMessage,
} from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import { fluentApi, MultiItemAction } from '@/lib/fluent-api';
import { ServerModel } from '@/lib/fluent-api/inventory/server';
import { useStore } from '@/store/toolset';
import {
    queryStringToQueryTags, queryTagsToQueryString, replaceQuery,
} from '@/lib/router-query-string';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import {
    makeQuerySearchHandlersWithSearchSchema,
} from '@/lib/component-utils/query-search';
import { getFiltersFromQueryTags } from '@/lib/api/query-search';
import { SearchKeyGroup } from '@/lib/component-utils/query-search/type';
import {
    QuerySearchTableTypeOptions,
    QuerySearchTableFetchOptions, QuerySearchTableListeners,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { MonitoringProps, MonitoringResourceType } from '@/views/common/monitoring/type';

import config from '@/lib/config';
import searchSchema from './default-schema/search.json';
import tableSchema from './default-schema/base-table.json';

const STORAGE_PREFIX = 'inventory/server';
const DEFAULT_PAGE_SIZE = 15;

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
        const {
            project, provider, serviceAccount, secret, collector, user,
        } = useStore();


        /** Breadcrumb */
        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Server', path: '/inventory/server' }],
        });


        /** Server Table */
        const tableAutocompleteProps = makeQuerySearchHandlersWithSearchSchema(
            searchSchema as SearchKeyGroup, 'inventory.Server',
        );

        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: serverStore.getItem<number>('pageLimit', 'number') || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: queryStringToQueryTags(vm.$route.query.filters),
        });

        const extraOptionState: QuerySearchTableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => user.state.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItems: tableAutocompleteProps.keyItems,
            valueHandlerMap: tableAutocompleteProps.valueHandlerMap,
        });

        const tableState = reactive({
            items: [],
            selectedItems: computed(() => extraOptionState.selectIndex.map(d => tableState.items[d])),
            providers: computed(() => provider.state.providers || {}),
            consoleLink: computed(() => {
                const res = get(tableState.selectedItems[0], 'data.reference.link')
                    || get(tableState.selectedItems[0], 'reference.external_link');
                return res;
            }),
            dropdown: computed(() => makeTrItems([
                ['delete', 'BTN.DELETE'],
                [null, null, { type: 'divider' }],
                ['in-service', 'INVENTORY.BTN.SET_INSERVICE'],
                ['maintenance', 'INVENTORY.BTN.SET_MAINTENANCE'],
                ['closed', 'INVENTORY.BTN.SET_CLOSE'],
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
        });

        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            extraOptionState.selectIndex = selectIndex;
        };

        const getQuery = () => {
            const { and, or } = getFiltersFromQueryTags(fetchOptionState.queryTags);

            const query = new QueryHelper();
            query.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilter(...and)
                .setKeyword(...or);

            return query.data;
        };

        const serverListApi = SpaceConnector.client.inventory.server.list;
        const listServerData = async () => {
            extraOptionState.loading = true;
            try {
                const res = await serverListApi({ query: getQuery() });
                tableState.items = res.results;
                extraOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                tableState.items = [];
                extraOptionState.totalCount = 0;
            } finally {
                extraOptionState.loading = false;
            }
        };

        const fetchTableData: QuerySearchTableListeners['fetch'] = (options, changed?) => {
            if (changed) {
                if (changed.sortBy && changed.sortDesc) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = changed.sortDesc;
                }
                if (changed.pageLimit) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                    serverStore.setItem('pageLimit', changed.pageLimit);
                }
                if (changed.queryTags) {
                    fetchOptionState.queryTags = changed.queryTags;
                    // sync updated query tags to url query string
                    replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
                }
            }

            listServerData();
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
                            timezone: extraOptionState.timezone,
                        },
                        data_source: tableSchema.options.fields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
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
            const changeAction = fluentApi.inventory().server().changeProject().clone()
                .setSubIds(tableState.selectedItems.map(item => item.server_id));
            if (data) {
                try {
                    await changeAction.setId(data.id).execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Project has been successfully changed.',
                        duration: 2000,
                        speed: 1000,
                    });
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
                } finally {
                    await project.getProject(true);
                    await listServerData();
                }
            } else {
                try {
                    await changeAction.setReleaseProject().execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Release Project Success',
                        duration: 2000,
                        speed: 1000,
                    });
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
            mode: '',
            item: null,
            action: null as unknown as MultiItemAction<any, any>,
            title: '',
            subTitle: '',
            themeColor: '',
        });

        const stateChangeAction = fluentApi.inventory().server().changeState();
        const deleteAction = fluentApi.inventory().server().delete();

        const resetCheckTableModalState = () => {
            checkTableModalState.visible = false;
            checkTableModalState.mode = '';
            checkTableModalState.action = null as unknown as MultiItemAction<any, any>;
            checkTableModalState.title = '';
            checkTableModalState.subTitle = '';
            checkTableModalState.themeColor = '';
        };

        const clickDelete = () => {
            checkTableModalState.mode = 'delete';
            checkTableModalState.action = deleteAction;
            checkTableModalState.title = 'Server Delete';
            checkTableModalState.subTitle = 'Are you Sure?';
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
        };
        const clickMaintenance = () => {
            checkTableModalState.mode = 'maintenance';
            checkTableModalState.action = stateChangeAction.setMaintenance();
            checkTableModalState.title = 'Set Maintenance';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
        };
        const clickInService = () => {
            checkTableModalState.mode = 'in-service';
            checkTableModalState.action = stateChangeAction.setInService();
            checkTableModalState.title = 'Set In-Service';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
        };
        const clickClosed = () => {
            checkTableModalState.mode = 'closed';
            checkTableModalState.action = stateChangeAction.setClosed();
            checkTableModalState.title = 'Set Closed';
            checkTableModalState.subTitle = 'change Server State';
            checkTableModalState.themeColor = 'primary';
            checkTableModalState.visible = true;
        };

        const checkModalConfirm = (items: ServerModel[]) => {
            checkTableModalState.action.setIds(items.map(item => item.server_id)).execute().then(() => {
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((e) => {
                showErrorMessage('Request Fail', e, context.root);
            })
                .finally(() => {
                    listServerData();
                    resetCheckTableModalState();
                });
        };

        const clickCollectData = () => {
            tableState.collectModalVisible = true;
        };

        // const adminApi = computed<DynamicLayoutApiProp>(() => {
        //     let servers: string[] = [];
        //     if (tableState.selectedItems.length === 1) {
        //         servers = [tableState.selectedItems[0].server_id];
        //     } else {
        //         servers = tableState.selectedItems.map(it => it.server_id);
        //     }
        //     return {
        //         resource: fluentApi.inventory().server().memberList().setIds(servers),
        //     };
        // });

        // const historyApi = computed<DynamicLayoutApiProp>(() => {
        //     if (tableState.selectedItems.length === 0) {
        //         return {
        //             resource: fluentApi.inventory().server(),
        //             getAction: (act: any) => act,
        //         };
        //     }
        //
        //     const selectIdForHistory = tableState.selectedItems[0].server_id;
        //     return {
        //         resource: fluentApi.inventory().server(),
        //         getAction: (act: any) => act.setId(selectIdForHistory),
        //     };
        // });
        // const historyIsShow = computed(() => {
        //     let result = false;
        //
        //     if (tableState.selectedItems.length === 1 && singleItemTabState.activeTab === 'history') {
        //         result = true;
        //     }
        //
        //     return result;
        // });


        /** Monitoring Tab */
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.Server',
            resources: computed(() => tableState.selectedItems.map(d => ({
                id: get(d, 'server_id'),
                name: d.name,
            }))) as unknown as MonitoringResourceType[],
        });


        /** ******* Page Init ******* */
        project.getProject(true);
        provider.getProvider(true);
        serviceAccount.getServiceAccounts(true);
        secret.getSecrets(true);
        collector.getCollectors(true);

        const init = async () => {
            await listServerData();
        };

        init();
        /** ************************* */


        return {
            /* Breadcrumb */
            routeState,

            /* Server Table */
            tableSchema,
            tableState,
            fetchOptionState,
            extraOptionState,
            onSelect,
            exportServerData,
            listServerData,
            fetchTableData,

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

    >>> .p-dynamic-layout-query-search-table .p-query-search-table {
        border-width: 1px;
    }
</style>
