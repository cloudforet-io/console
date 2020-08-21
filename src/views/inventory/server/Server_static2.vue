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
                <p-query-search-table :fields="serverFields"
                                      :items="serverItems"
                                      :loading="serverLoading"
                                      :page-size="serverPageSize"
                                      :sort-desc="serverSortDesc"
                                      :sort-by="serverSortBy"
                                      :total-count="serverTotalCount"
                                      :select-index="serverSelectIndex"
                                      :key-items="serverKeyItems"
                                      :value-handler-map="serverValueHandlerMap"
                                      :query-tags="serverQueryTags"
                                      :style="{height: `${height}px`}"
                                      @change="onChange"
                                      @export="exportServerData"
                                      @select="onServerSelect"
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
                    <template #col-updated_at-format="{value}">
                        {{ timestampFormatter(value) }}
                    </template>
                    <template #col-provider-format="{value}">
                        <p-badge :background-color="providers[value] ? providers[value].color : undefined">
                            {{ providers[value] ? providers[value].name : value }}
                        </p-badge>
                    </template>
                    <template #col-collection_info.state-format="{value}">
                        <p-status :text="COLLECTION_STATES[value] ? COLLECTION_STATES[value].label : value"
                                  :icon="COLLECTION_STATES[value] ? COLLECTION_STATES[value].icon.image : undefined"
                        />
                    </template>
                    <template #col-data.compute.instance_state-format="{value}">
                        <p-status :text="INSTANCE_STATES[value] ? INSTANCE_STATES[value].label : value"
                                  :theme="INSTANCE_STATES[value] ? INSTANCE_STATES[value].icon.color : undefined"
                        />
                    </template>
                    <template #col-nics-format="{value}">
                        <p-text-list :items="getIPAddresses(value)">
                            <template #delimiter>
                                <br>
                            </template>
                        </p-text-list>
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
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
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/PStatus.vue';
import {
    platformBadgeFormatter, serverStateFormatter, showErrorMessage, timestampFormatter,
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
    makeValueHandlerMapWithReference,
    makeValueHandlerWithReference,
    makeValueHandlerWithSearchEnums,
} from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { Options } from '@/components/organisms/tables/query-search-table/type';
import { getQueryItemsToFilterItems } from '@/lib/api/query-search';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PBadge from '@/components/atoms/badges/PBadge.vue';
import PTextList from '@/components/molecules/lists/text-list/PTextList.vue';
import { KeyItem } from '@/components/organisms/search/query-search/type';

export default {
    name: 'Server',
    components: {
        PTextList,
        PBadge,
        PQuerySearchTable,
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


        const serverKeyItems: KeyItem[] = [
            { name: 'server_id', label: 'Server ID' },
            { name: 'name', label: 'Name' },
            { name: 'ip_addresses', label: 'IP Address' },
            { name: 'state', label: 'Life Cycle' },
            { name: 'collection_info.state', label: 'Collection State' },
            { name: 'project_id', label: 'Project' },
            { name: 'collection_info.service_accounts', label: 'Service Account' },
            { name: 'collection_info.secrets', label: 'Secret' },
            { name: 'provider', label: 'Provider' },
            { name: 'reference.resource_id', label: 'Resource ID' },
            { name: 'os_type', label: 'OS Type' },
            { name: 'data.os.os_distro', label: 'OS Distro' },
            { name: 'data.os.os_arch', label: 'OS Architecture' },
            { name: 'sever_type', label: 'Server Type' },
            { name: 'data.compute.instance_id', label: 'Instance ID', dataType: 'float' },
            { name: 'data.compute.instance_state', label: 'Instance State' },
            { name: 'data.compute.instance_type', label: 'Instance Type' },
            { name: 'data.compute.keypair', label: 'Key Pair' },
            { name: 'data.compute.image', label: 'Image' },
            { name: 'data.compute.az', label: 'Availability Zone' },
            { name: 'data.compute.account_id', label: 'Account ID' },
            { name: 'nics.mac_address', label: 'MAC Address' },
            { name: 'nics.public_ip_address', label: 'Public IP Address' },
            { name: 'nics.tags.public_dns', label: 'Public DNS' },
            { name: 'data.vpc.vpc_id', label: 'VPC ID' },
            { name: 'data.vpc.vpc_name', label: 'VPC Name' },
            { name: 'data.subnet.subnet_id', label: 'Subnet ID' },
            { name: 'data.subnet.subnet_name', label: 'Subnet Name' },
            { name: 'data.load_balancers.name', label: 'ELB Name' },
            { name: 'data.load_balancers.dns', label: 'ELB DNS' },
            { name: 'data.auto_scaling_group.name', label: 'Auto Scaling Group' },
            // { key: 'data.hardware.core', name: 'Core', data_type: 'integer' },
            // { key: 'data.hardware.memory', name: 'Memory', data_type: 'float' },
            // { key: 'created_at', name: 'Created', data_type: 'datetime' },
            // { key: 'updated_at', name: 'Updated', data_type: 'datetime' },
            // { key: 'deleted_at', name: 'Deleted', data_type: 'datetime' },
        ];

        const serverValueHandlerMap = {
            ...makeValueHandlerMapWithReference(serverKeyItems, 'inventory.Server'),
            project_id: makeValueHandlerWithReference('identity.Project'),
            'collection_info.service_accounts': makeValueHandlerWithReference('identity.ServiceAccount'),
            'collection_info.secrets': makeValueHandlerWithReference('secret.Secret'),
            // state: makeValueHandlerWithSearchEnums(LIFE_CYCLES),
            // 'collection_info.state': makeValueHandlerWithSearchEnums(COLLECTION_STATES),
            // provider: makeValueHandlerWithSearchEnums(PROVIDERS),
            // os_type: makeValueHandlerWithSearchEnums(OS_TYPES),
            // sever_type: makeValueHandlerWithSearchEnums(SERVER_TYPES),
        };

        const state = reactive({
            timezone: computed(() => user.state.timezone),
            // serverPageSize: serverStore.getComputedItem('pageSize'),
            // serverSortDesc: serverStore.getComputedItem('sortDesc'),
            // serverSortBy: serverStore.getComputedItem('sortBy'),
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

        const getIPAddresses = (data) => {
            if (Array.isArray(data)) {
                return sortBy(data, d => get(d, 'nics.public_ip_address'))
                    .map(d => d.public_ip_address);
            }
            return '';
        };


        const serverListApi = fluentApi.inventory().server().list();
        const listServerData = async (tableOptions?: Options) => {
            const options = tableOptions || state.serverTableOptions;
            let api = serverListApi
                .setSortBy(options.sortBy)
                .setSortDesc(options.sortDesc)
                .setPageSize(options.pageSize)
                .setThisPage(options.thisPage);

            const { and, or } = getQueryItemsToFilterItems(options.queryTags, serverKeyItems);
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
                // serverStore.setItem('sortBy', changed.sortBy);
                // serverStore.setItem('sortDesc', changed.sortDesc);
            }
            if (changed.pageSize) {
                // serverStore.setItem('pageSize', changed.pageSize);
            }
            if (changed.queryTags) {
                state.serverQueryTags = changed.queryTags;
                replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
            }

            listServerData(options);
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
            serverKeyItems,
            serverValueHandlerMap,
            singleItemTab,
            multiItemTab,
            dropdown,
            serverStateFormatter,
            timestampFormatter,
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
            // COLLECTION_STATES,
            // INSTANCE_STATES,
            getIPAddresses,
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
