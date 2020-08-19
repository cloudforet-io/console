<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="route" />
        </div>
        <p-page-title title="Server"
                      use-total-count use-selected-count
                      :total-count="serverTotalCount"
                      :selected-count="serverSelectItems.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <!--                <p-query-search-table :fields="serverFields"-->
                <!--                                      :items="serverItems"-->
                <!--                                      :loading="serverLoading"-->
                <!--                                      :page-size="serverPageSize"-->
                <!--                                      :sort-desc="serverSortDesc"-->
                <!--                                      :sort-by="serverSortBy"-->
                <!--                                      :total-count="serverTotalCount"-->
                <!--                                      :select-index="serverSelectIndex"-->
                <!--                                      :key-items="tableAutocompleteProps.keyItems"-->
                <!--                                      :value-handler-map="tableAutocompleteProps.valueHandlerMap"-->
                <!--                                      :query-tags="serverQueryTags"-->
                <!--                                      :style="{height: `${height}px`}"-->
                <!--                                      @change="onChange"-->
                <!--                                      @export="exportServerData"-->
                <!--                                      @select="onServerSelect"-->
                <!--                >-->
                <!--                    <template #col-provider-format="{value}">-->
                <!--                        <p-badge :background-color="providers[value] ? providers[value].color : undefined">-->
                <!--                            {{ providers[value] ? providers[value].name : value }}-->
                <!--                        </p-badge>-->
                <!--                    </template>-->
                <!--                </p-query-search-table>-->
                <p-dynamic-layout type="query-search-table"
                                  :name="tableSchema.name"
                                  :options="tableSchema.options"
                                  :data="serverItems"
                                  :loading="serverLoading"
                                  :total-count="serverTotalCount"
                                  :init-props="tableInitProps"
                                  @init="fetchTableData"
                                  @fetch="fetchTableData"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            :disabled="serverSelectItems.length === 0"
                                            @click="clickCollectData"
                        >
                            {{ $t('BTN.COLLECT_DATA') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn
                            id="server-dropdown-btn"
                            class="left-toolbox-item mr-4"
                            :menu="dropdown"
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
            <p-tab v-if="serverSelectItems.length === 1"
                   :tabs="singleItemTab.state.tabs"
                   :active-tab.sync="singleItemTab.syncState.activeTab"
            >
                <template #detail>
                    <p-server-detail
                        :select-id="serverSelectItems[0].server_id"
                        :is-show="singleItemTab.syncState.activeTab ==='detail'"
                    />
                </template>
                <template #tag>
                    <s-tags-panel
                        :is-show="singleItemTab.syncState.activeTab==='tag'"
                        :resource-id="serverSelectItems[0].server_id"
                        tag-page-name="serverTags"
                    />
                </template>
                <template #admin>
                    <s-dynamic-layout :api="adminApi"
                                      :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                      v-bind="defaultAdminLayout"
                                      :style="{borderWidth: 0}"
                    />
                </template>
                <template #history>
                    <s-dynamic-layout :api="historyApi"
                                      :is-show="historyIsShow" :name="$t('TAB.HISTORY')"
                                      v-bind="defaultHistoryLayout"
                                      :style="{borderWidth: 0}"
                    />
                </template>
                <template #monitoring>
                    <s-monitoring v-bind="monitoringTS.state" />
                </template>
            </p-tab>
            <p-tab v-else-if="serverSelectIndex.length > 1"
                   :tabs="multiItemTab.state.tabs"
                   :active-tab.sync="multiItemTab.syncState.activeTab"
            >
                <template #data>
                    <p-data-table
                        :fields="multiSelectFields"
                        :sortable="false"
                        :selectable="false"
                        :items="serverSelectItems"
                        :col-copy="true"
                    >
                        <template v-slot:col-state-format="data">
                            <p-status v-bind="serverStateFormatter(data.value)" />
                        </template>
                        <template />
                    </p-data-table>
                </template>
                <template #admin>
                    <s-dynamic-layout :api="adminApi"
                                      :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                      v-bind="defaultAdminLayout"
                                      :style="{borderWidth: 0}"
                    />
                </template>
                <template #monitoring>
                    <s-monitoring v-bind="monitoringTS.state" />
                </template>
            </p-tab>

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
                :items="serverSelectItems"

                @confirm="checkModalConfirm"
            />
            <s-project-tree-modal :visible.sync="changeProjectState.visible"
                                  :project-id="changeProjectState.projectId"
                                  :loading="changeProjectState.loading"
                                  @confirm="changeProject"
            />
            <s-collect-modal :visible.sync="collectModalVisible"
                             :resources="serverSelectItems"
                             id-key="server_id"
            />
        </p-horizontal-layout>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/PStatus.vue';
import {
    platformBadgeFormatter, serverStateFormatter, showErrorMessage,
} from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/PActionConfirmModal.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import {
    defaultAdminLayout,
    defaultHistoryLayout,
} from '@/lib/api/table';
import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import { fluentApi, MultiItemAction } from '@/lib/fluent-api';
import { ServerModel } from '@/lib/fluent-api/inventory/server';
import { useStore } from '@/store/toolset';
import SCollectModal from '@/views/common/collect-modal/CollectModal.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import SMonitoring from '@/views/common/monitoring/Monitoring.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import { DynamicLayoutApiProp } from '@/views/common/dynamic-layout/toolset';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import {
    queryStringToQueryTags, queryTagsToQueryString, replaceQuery,
} from '@/lib/router-query-string';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { MonitoringToolSet } from '@/views/common/monitoring/Monitoring.toolset';
import { get, sortBy } from 'lodash';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import SDynamicLayout from '@/views/common/dynamic-layout/SDynamicLayout.vue';
import {
    makeQuerySearchHandlersWithSearchSchema,
    makeValueHandlerMapWithReference,
    makeValueHandlerWithReference,
    makeValueHandlerWithSearchEnums,
} from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { getQueryItemsToFilterItems } from '@/lib/api/query-search';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import { serverStore } from '@/store';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import { SearchKeyGroup } from '@/lib/component-utils/query-search/type';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { DynamicLayoutFetchOptions } from '@/components/organisms/dynamic-layout/type';
import searchSchema from './default-schema/search.json';
import tableSchema from './default-schema/base-table.json';

const STORAGE_PREFIX = 'inventory/server';

export default {
    name: 'Server',
    components: {
        PDynamicLayout,
        SDynamicLayout,
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
        const vm = getCurrentInstance() as ComponentInstance;
        const { user, provider, project } = useStore();

        const tableAutocompleteProps = makeQuerySearchHandlersWithSearchSchema(
            searchSchema as SearchKeyGroup, 'inventory.Server',
        );

        const tableFetchOptions: DynamicLayoutFetchOptions = {
            pageSize: localStorage.getItem(`${STORAGE_PREFIX}/pageSize`),
            sortDesc: true,
            sortBy: 'created_at',
        };

        const state = reactive({
            timezone: computed(() => user.state.timezone),
            serverPageSize: serverStore.getComputedItem('pageSize'),
            serverSortDesc: serverStore.getComputedItem('sortDesc'),
            serverSortBy: serverStore.getComputedItem('sortBy'),
            serverFields: [
                { name: 'name', label: 'Name' },
                { name: 'data.compute.instance_type', label: 'Instance Type' },
                { name: 'data.hardware.core', label: 'Core' },
                { name: 'data.hardware.memory', label: 'Memory' },
                { name: 'data.compute.az', label: 'Availability Zone' },
                { name: 'data.compute.instance_state', label: 'Instance State' },
                { name: 'collection_info.state', label: 'Collection State' },
                { name: 'data.os.os_distro', label: 'OS' },
                { name: 'nics', label: 'Public IP' },
                { name: 'provider', label: 'Provider' },
                { name: 'data.compute.account_id', label: 'Account ID' },
                { name: 'project_id', label: 'Project' },
                { name: 'updated_at', label: 'Updated' },
            ],
            serverItems: [],
            serverTotalCount: 0,
            serverSelectIndex: [] as number[],
            serverLoading: true,
            serverQueryTags: queryStringToQueryTags(vm.$route.query.filters),
            serverTableOptions: computed<Options>(() => ({
                sortDesc: state.serverSortDesc,
                sortBy: state.serverSortBy,
                pageSize: state.serverPageSize,
                thisPage: 1,
                queryTags: state.serverQueryTags,
            })),
            serverSelectItems: computed(() => state.serverSelectIndex.map(d => state.serverItems[d])),
            providers: computed(() => provider.state.providers || {}),
            /** dropdown */
            consoleLink: computed(() => {
                const res = get(state.serverSelectItems[0], 'data.reference.link')
                    || get(state.serverSelectItems[0], 'reference.external_link');
                return res;
            }),
            /** collect modal */
            collectModalVisible: false,
        });

        const projectState = reactive({
            project: {},
            isReady: false,
        });


        const serverListApi = fluentApi.inventory().server().list();
        const listServerData = async (tableOptions?: Options) => {
            const options = tableOptions || state.serverTableOptions;
            let api = serverListApi
                .setSortBy(options.sortBy)
                .setSortDesc(options.sortDesc)
                .setPageSize(options.pageSize)
                .setThisPage(options.thisPage);

            const { and, or } = getQueryItemsToFilterItems(options.queryTags, tableAutocompleteProps.keyItems);
            api = api.setFilter(...and).setFilterOr(...or);

            state.serverLoading = true;
            try {
                const res = await api.execute();
                state.serverItems = res.data.results;
                state.serverTotalCount = res.data.total_count;
            } catch (e) {
                console.error(e);
                state.serverItems = [];
                state.serverTotalCount = 0;
            } finally {
                state.serverLoading = false;
            }
        };

        const onChange = (options, changed: Partial<Options>) => {
            if (changed.sortBy && changed.sortDesc) {
                serverStore.setItem('sortBy', changed.sortBy);
                serverStore.setItem('sortDesc', changed.sortDesc);
            }
            if (changed.pageSize) {
                serverStore.setItem('pageSize', changed.pageSize);
            }
            if (changed.queryTags) {
                state.serverQueryTags = changed.queryTags;
                replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
            }

            listServerData(options);
        };

        const fetchTableData = (options: DynamicLayoutFetchOptions, changed: Partial<DynamicLayoutFetchOptions>) => {
            if (changed.sortBy && changed.sortDesc) {
                serverStore.setItem('sortBy', changed.sortBy);
                serverStore.setItem('sortDesc', changed.sortDesc);
            }
            if (changed.pageSize) {
                serverStore.setItem('pageSize', changed.pageSize);
            }
            if (changed.queryTags) {
                state.serverQueryTags = changed.queryTags;
                replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
            }
        };

        const exportServerData = () => {

        };

        const onServerSelect = (selectIndex: number[]) => {
            state.serverSelectIndex = selectIndex;
        };

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Server', path: '/inventory/server' }],
        });

        const multiSelectFields = makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['primary_ip_address', 'COMMON.IP'],
            ['os_type', 'COMMON.O_TYPE'],
        ],
        context.parent);


        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['tag', 'TAB.TAG'],
                    ['admin', 'TAB.MEMBER'],
                    ['history', 'TAB.HISTORY'],
                    ['monitoring', 'TAB.MONITORING'],
                ],
                context.parent)),
            },
            {
                activeTab: 'detail',
            },
        );

        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.DATA'],
                    ['admin', 'TAB.MEMBER'],
                    ['monitoring', 'TAB.MONITORING'],
                ], context.parent),
            }, {
                activeTab: 'data',
            },
        );


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

        const dropdown = computed(() => makeTrItems([
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
                disabled: !state.consoleLink,
                link: state.consoleLink,
                target: 'blank',
            }],
        ],
        context.parent,
        { type: 'item', disabled: state.serverSelectItems.length === 0 }));


        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (state.serverSelectItems.length > 1) return '';
                return get(state.serverSelectItems[0], 'project_id', '');
            }),
        });
        const clickProject = () => { changeProjectState.visible = true; };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;
            const changeAction = fluentApi.inventory().server().changeProject().clone()
                .setSubIds(state.serverSelectItems.map(item => item.server_id));
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
                    projectState.project = project.state.projects;
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


        const adminIsShow = computed(() => {
            let result = false;

            if (state.serverSelectItems.length === 1) {
                result = singleItemTab.syncState.activeTab === 'admin';
            }

            if (state.serverSelectItems.length > 1) {
                result = multiItemTab.syncState.activeTab === 'admin';
            }

            return result;
        });
        const adminApi = computed<DynamicLayoutApiProp>(() => {
            let servers: string[] = [];
            if (state.serverSelectItems.length === 1) {
                servers = [state.serverSelectItems[0].server_id];
            } else {
                servers = state.serverSelectItems.map(it => it.server_id);
            }
            return {
                resource: fluentApi.inventory().server().memberList().setIds(servers),
            };
        });

        const historyApi = computed<DynamicLayoutApiProp>(() => {
            const selectIdForHistory = state.serverSelectItems[0].server_id;
            return {
                resource: fluentApi.inventory().server(),
                getAction: (act: any) => act.setId(selectIdForHistory),
            };
        });
        const historyIsShow = computed(() => {
            let result = false;

            if (state.serverSelectItems.length === 1 && singleItemTab.syncState.activeTab === 'history') {
                result = true;
            }

            return result;
        });


        const monitoringTS = new MonitoringToolSet(
            'server_id',
            'inventory.Server',
            // @ts-ignore
            computed(() => state.serverSelectItems),
        );

        const init = async () => {
            /** Data Init */
            await project.getProject(true);
            await listServerData();
            projectState.project = project.state.projects;
            projectState.isReady = true;
        };

        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(projectState),
            tableSchema,
            tableAutocompleteProps,
            tableInitProps,
            singleItemTab,
            multiItemTab,
            dropdown,
            serverStateFormatter,
            platformBadgeFormatter,
            clickCollectData() {
                state.collectModalVisible = true;
            },
            checkTableModalState,
            clickDelete,
            clickClosed,
            clickInService,
            clickMaintenance,
            checkModalConfirm,
            changeProjectState,
            clickProject,
            changeProject,
            multiSelectFields,
            defaultAdminLayout,
            defaultHistoryLayout,
            adminApi,
            adminIsShow,
            historyApi,
            historyIsShow,
            monitoringTS,
            listServerData,
            onChange,
            onServerSelect,
            exportServerData,
            fetchTableData,
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

    #empty-space {
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
</style>
