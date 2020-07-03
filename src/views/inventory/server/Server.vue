<template>
    <general-page-layout>
        <PPageTitle title="Server"
                    use-total-count use-selected-count
                    :total-count="apiHandler.totalCount.value"
                    :selected-count="apiHandler.tableTS.selectState.selectItems.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <SDynamicLayout
                    v-bind="mainTableLayout"
                    :toolset="apiHandler"
                    :vbind="{
                        responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'},
                        showTitle:false,
                        // exportFields:mergeFields,
                    }"
                >
                    <template #toolbox-left>
                        <PIconTextButton style-type="primary-dark"
                                         name="ic_plus_bold"
                                         :disabled="apiHandler.tableTS.selectState.selectItems.length === 0"
                                         @click="clickCollectData"
                        >
                            {{ $t('BTN.COLLECT_DATA') }}
                        </PIconTextButton>
                        <PDropdownMenuBtn
                            id="server-dropdown-btn"
                            class="left-toolbox-item mr-4"
                            :menu="dropdown"
                            @click-in-service="clickInService"
                            @click-maintenance="clickMaintenance"
                            @click-closed="clickClosed"
                            @click-delete="clickDelete"
                            @click-project="clickProject"
                            @click-link="apiHandler.tableTS.linkState.openLink()"
                        >
                            {{ $t('BTN.ACTION') }}
                        </PDropdownMenuBtn>
                    </template>
                </SDynamicLayout>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
            <template #detail>
                <p-server-detail
                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.server_id"
                    :is-show="singleItemTab.syncState.activeTab ==='detail'"
                />
            </template>
            <template #tag>
                <s-tags-panel
                    :is-show="singleItemTab.syncState.activeTab==='tag'"
                    :resource-id="apiHandler.tableTS.selectState.firstSelectItem.server_id"
                    tag-page-name="serverTags"
                />
            </template>
            <template #admin>
                <SDynamicLayout :api="adminApi"
                                :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                v-bind="defaultAdminLayout"
                />
            </template>
            <template #history>
                <SDynamicLayout :api="historyApi"
                                :is-show="historyIsShow" :name="$t('TAB.HISTORY')"
                                v-bind="defaultHistoryLayout"
                />
            </template>
            <template #monitoring>
                <s-monitoring v-bind="monitoringTS.state" />
            </template>
        </p-tab>
        <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti" :tabs="multiItemTab.state.tabs" :active-tab.sync="multiItemTab.syncState.activeTab">
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
                <SDynamicLayout :api="adminApi"
                                :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                v-bind="defaultAdminLayout"
                />
            </template>
            <template #monitoring>
                <s-monitoring v-bind="monitoringTS.state" />
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
        <s-project-tree-modal :visible.sync="changeProjectState.visible"
                              :project-id="changeProjectState.projectId"
                              :loading="changeProjectState.loading"
                              @confirm="changeProject"
        />
        <s-collect-modal :visible.sync="collectModalState.visible"
                         :resources="apiHandler.tableTS.selectState.selectItems"
                         id-key="server_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, getCurrentInstance, onMounted, reactive, ref,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status.vue';
import {
    platformBadgeFormatter, serverStateFormatter, showErrorMessage, timestampFormatter,
} from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PServerDetail from '@/views/inventory/server/modules/ServerDetail.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import {
    defaultAdminLayout,
    defaultHistoryLayout,
    DefaultQSTableQSProps,
    RouteQuerySearchTableFluentAPI,
} from '@/lib/api/table';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { fluentApi, MultiItemAction } from '@/lib/fluent-api';
import {
    getEnumValues,
    getFetchValues, getValueHandler, makeValueHandlers,
    makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ServerListResp, ServerModel } from '@/lib/fluent-api/inventory/server';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import SCollectModal from '@/components/organisms/modals/collect-modal/CollectModal.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import SMonitoring from '@/components/organisms/monitoring/Monitoring.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import baseTable from '@/metadata-schema/view/inventory/server/table/layout/base_table.json';
import { DynamicLayoutApiProp } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import {
    propsCopy,
} from '@/lib/router-query-string';
import {
    DefaultMultiItemTabBarQSProps,
    DefaultMultiItemTabBarQSPropsName, DefaultSingleItemTabBarQSProps,
    RouterTabBarToolSet,
} from '@/components/molecules/tabs/tab-bar/toolset';
import { MonitoringToolSet } from '@/components/organisms/monitoring/Monitoring.toolset';
import { get } from 'lodash';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';


export default {
    name: 'Server',
    components: {
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
        SDynamicLayout,
        STagsPanel,
        PPageTitle,
    },
    props: {
        ...DefaultQSTableQSProps,
        ...DefaultSingleItemTabBarQSProps,
        ...DefaultMultiItemTabBarQSProps,
        // ...BaseRouterProps,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;
        const filedMap = {
            project_id: {
                key: 'console_force_data.project',
                type: 'text',
                name: 'Project',
            },
        };

        const mainTableLayout = computed<any>(() => ({
            name: 'Server',
            type: baseTable.type as any,
            options: {
                fields: baseTable.options.fields.map(field => filedMap[field.key] || field),
            },

        }));

        class ACHandler extends QuerySearchTableACHandler {
            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.HandlerMap.value = [
                    ...makeValueHandlers([
                        'server_id', 'name', 'primary_ip_address',
                        'data.compute.instance_name', 'data.compute.instance_id',
                        'data.vm.vm_name', 'data.vm.vm_id',
                    ], fluentApi
                        .statisticsTest()
                        .resource()
                        .stat()
                        .setResourceType('inventory.Server')),
                    getEnumValues('state', ['PENDING', 'INSERVICE', 'MAINTENANCE', 'CLOSED', 'DELETED']),
                    getEnumValues('os_type', ['LINUX', 'WINDOWS']),
                    getEnumValues('collection_info.state', ['MANUAL', 'ACTIVE', 'DISCONNECTED']),
                    getEnumValues('server_type', ['BAREMETAL', 'VM', 'HYPERVISOR', 'UNKNOWN']),
                    getValueHandler('project_id', fluentApi
                        .statisticsTest()
                        .resource()
                        .stat()
                        .setResourceType('identity.Project')),
                ];
            }
        }

        const args = {
            keys: [
                'server_id',
                'name', 'state', 'primary_ip_address', 'server_type', 'os_type', 'project_id',
                'data.os.os_arch', 'data.os.os_details', 'data.os.os_version',
                'data.base.memory', 'data.base.core', 'data.platform.type',
                'data.compute.instance_name', 'data.compute.keypair', 'data.compute.instance_id',
                'collection_info.state',
            ],
            suggestKeys: ['server_id', 'name', 'primary_ip_address'],
        };
        const { project } = useStore();

        project.getProject();
        const action = fluentApi.inventory().server().list()
            .setTransformer((resp: AxiosResponse<ServerListResp>) => {
                const result = resp;

                result.data.results = resp.data.results.map((item) => {
                    item.console_force_data = { project: item.project_id ? project.state.projects[item.project_id] || item.project_id : '' };

                    return item;
                });

                return result;
            });
        const apiHandler = new RouteQuerySearchTableFluentAPI(
            action,
            {
                selectable: true,
                sortable: true,
                dragable: true,
                hover: true,
                responsive: true,
                settingVisible: false,
                useCursorLoading: true,
                excelVisible: true,
            },
            undefined,
            { handlerClass: ACHandler, args },
            vm,
        );


        const fields = makeTrItems([
            ['name', 'FIELD.NAME'],
            ['state', 'FIELD.STATE'],
            ['primary_ip_address', 'COMMON.IP', { sortable: false }],
            ['core', 'COMMON.CORE'],
            ['memory', 'COMMON.MEMORY'],
            ['os_type', 'COMMON.O_TYPE'],
            ['os_distro', 'COMMON.O_DIS'],
            ['server_type', 'COMMON.SE_TYPE'],
            ['platform_type', 'COMMON.PLATFORM'],
            ['project', 'FIELD.PROJECT'],
            ['pool', 'COMMON.POOL'],
            ['updated_at', 'COMMON.UPDATE'],
        ],
        context.parent);
        const multiSelectFields = makeTrItems([
            ['name', 'COMMON.NAME'],
            ['state', 'COMMON.STATE'],
            ['primary_ip_address', 'COMMON.IP'],
            ['os_type', 'COMMON.O_TYPE'],
        ],
        context.parent);


        const singleItemTab = new RouterTabBarToolSet(
            vm,
            undefined,
            computed(() => apiHandler.tableTS.selectState.isSelectOne),
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
        );
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new RouterTabBarToolSet(vm,
            DefaultMultiItemTabBarQSPropsName,
            computed(() => apiHandler.tableTS.selectState.isSelectMulti),
            {
                tabs: makeTrItems([
                    ['data', 'TAB.DATA'],
                    ['admin', 'TAB.MEMBER'],
                    ['monitoring', 'TAB.MONITORING'],
                ], context.parent),
            });
        multiItemTab.syncState.activeTab = 'data';


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
                    apiHandler.getData();
                    resetCheckTableModalState();
                });
        };
        const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const dropdown = reactive({
            ...makeTrItems([
                ['delete', 'BTN.DELETE'],
                [null, null, { type: 'divider' }],
                ['in-service', 'INVENTORY.BTN.SET_INSERVICE'],
                ['maintenance', 'INVENTORY.BTN.SET_MAINTENANCE'],
                ['closed', 'INVENTORY.BTN.SET_CLOSE'],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO'],
                // ['pool', 'BTN.CHG_POOL', { disabled: true }],
                [null, null, { type: 'divider' }],
                ['link', null, { label: 'Console', disabled: apiHandler.tableTS.noLink }],
            ],
            context.parent,
            { type: 'item', disabled: isNotSelected }),
        });

        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (apiHandler.tableTS.selectState.selectItems.length > 1) return '';
                return get(apiHandler, 'tableTS.selectState.firstSelectItem.project_id', '');
            }),
        });
        const clickProject = () => { changeProjectState.visible = true; };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;
            const changeAction = fluentApi.inventory().server().changeProject().clone()
                .setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.server_id));

            if (data) {
                await changeAction.setId(data.id).execute();
            } else {
                await changeAction.setReleaseProject().execute();
            }

            changeProjectState.loading = false;
            changeProjectState.visible = false;
            await apiHandler.getData();
        };


        const adminIsShow = computed(() => {
            let result = false;

            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = singleItemTab.syncState.activeTab === 'admin';
            }

            if (apiHandler.tableTS.selectState.isSelectMulti) {
                result = multiItemTab.syncState.activeTab === 'admin';
            }

            return result;
        });
        const adminApi = computed<DynamicLayoutApiProp>(() => {
            let servers: string[] = [];
            if (apiHandler.tableTS.selectState.isSelectOne) {
                servers = [apiHandler.tableTS.selectState.firstSelectItem.server_id];
            } else {
                servers = apiHandler.tableTS.selectState.selectItems.map(it => it.server_id);
            }
            return {
                resource: fluentApi.inventory().server().memberList().setIds(servers),
            };
        });

        const historyApi = computed<DynamicLayoutApiProp>(() => {
            const selectIdForHistory = apiHandler.tableTS.selectState.firstSelectItem.server_id;
            return {
                resource: fluentApi.inventory().server(),
                getAction: (act: any) => act.setId(selectIdForHistory),
            };
        });
        const historyIsShow = computed(() => {
            let result = false;

            if (apiHandler.tableTS.selectState.isSelectOne && singleItemTab.syncState.activeTab === 'history') {
                result = true;
            }

            return result;
        });

        const collectModalState = reactive({
            visible: false,
        });

        const monitoringTS = new MonitoringToolSet(
            'server_id',
            'inventory.Server',
            computed(() => apiHandler.tableTS.selectState.selectItems),
        );
        const routerHandler = async () => {
            const prop = propsCopy(props);
            apiHandler.applyAPIRouter(prop);
            await apiHandler.getData();
            apiHandler.applyDisplayRouter(prop);
            singleItemTab.applyDisplayRouter(prop);
            multiItemTab.applyDisplayRouter(prop);
        };
        onMounted(async () => {
            await routerHandler();
        });

        return {
            singleItemTab,
            multiItemTab,
            dropdown,
            serverStateFormatter,
            timestampFormatter,
            platformBadgeFormatter,
            clickCollectData() {
                collectModalState.visible = true;
            },
            clickMenuEvent(menuName) {
                console.debug(menuName);
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
            apiHandler,
            fields,
            multiSelectFields,
            defaultAdminLayout,
            defaultHistoryLayout,
            adminApi,
            adminIsShow,
            historyApi,
            historyIsShow,
            collectModalState,
            monitoringTS,
            mainTableLayout,
            routerHandler,
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
