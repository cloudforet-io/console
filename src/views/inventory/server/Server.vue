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
                    :use-cursor-loading="true"
                    :excel-visible="true"
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
                    @clickExcel="exportToolSet.getData()"
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
                            class="left-toolbox-item"
                            :menu="dropdown"
                            @click-in-service="clickInService"
                            @click-maintenance="clickMaintenance"
                            @click-closed="clickClosed"
                            @click-delete="clickDelete"
                            @click-project="clickProject"
                            @click-link="apiHandler.tableTS.linkState.openLink()"
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

                    <template v-if="apiHandler.tableTS.querySearch.tags.value.length >= 1" #toolbox-bottom>
                        <p-col :col="12">
                            <p-hr style="width: 100%;" />
                            <p-query-search-tags style="margin-top: 0.5rem;"
                                                 :tags="apiHandler.tableTS.querySearch.tags.value"
                                                 @deleteTag="apiHandler.tableTS.querySearch.deleteTag"
                                                 @deleteAllTags="apiHandler.tableTS.querySearch.deleteAllTags"
                            />
                        </p-col>
                    </template>
                    <template v-slot:col-state-format="data">
                        <p-status v-bind="serverStateFormatter(data.value)" />
                    </template>
                    <template v-slot:col-project-format="data">
                        {{ data.item.console_force_data.project }}
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
                        <PBadge v-if="data.item.data.platform && data.item.data.platform.type" v-bind="platformBadgeFormatter(data.item.data.platform.type)">
                            {{ data | getValue(['item','data','platform','type']) }}
                        </PBadge>
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="tabs" :active-tab.sync="activeTab">
            <template #detail>
                <p-server-detail :item="apiHandler.tableTS.selectState.firstSelectItem" :data-source="baseInfoDetails" />
            </template>
            <template #data>
                <PDynamicSubData
                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.server_id"
                    :sub-data="apiHandler.tableTS.selectState.firstSelectItem.metadata.sub_data"
                    :action="getDataAction"
                />
            </template>
            <template #tag>
                <s-tags-panel
                    :is-show="activeTab==='tag'"
                    :resource-id="apiHandler.tableTS.selectState.firstSelectItem.server_id"
                    tag-page-name="serverTags"
                />
            </template>
            <template #rawData>
                <p-raw-data class="my-8 mx-4" :item="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #admin>
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                    {{ $t('TAB.ADMIN') }}
                </PPanelTop>
                <p-dynamic-view :api-handler="adminApiHandler" view_type="table" :data_source="adminApiHandler.dataSource" />
            </template>
            <template #history>
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="historyAPIHandler.totalCount.value">
                    {{ $t('TAB.HISTORY') }}
                </PPanelTop>
                <p-dynamic-view :api-handler="historyAPIHandler" view_type="table" :data_source="historyAPIHandler.dataSource" />
            </template>
            <template #monitoring>
                <s-monitoring :resource-type="metricAPIHandler.ts.state.resourceType"
                              :data-tools="metricAPIHandler.ts.state.dataTools"
                              :statistics-types="metricAPIHandler.ts.state.statisticsTypes"
                              :resources="metricAPIHandler.ts.state.resources"
                />
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
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                    {{ $t('TAB.ADMIN') }}
                </PPanelTop>
                <p-dynamic-view :api-handler="adminApiHandler" view_type="table" :data_source="adminApiHandler.dataSource" />
            </template>
            <template #monitoring>
                <s-monitoring resource-type="'inventory.Server'" :resources="apiHandler.tableTS.selectState.selectItems" />
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
        <s-collect-modal :visible.sync="collectModalState.visible"
                         :resources="apiHandler.tableTS.selectState.selectItems"
                         id-key="server_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, reactive, ref, toRefs,
} from '@vue/composition-api';
import PStatus from '@/components/molecules/status/Status.vue';
import PBadge from '@/components/atoms/badges/Badge.vue';
import {
    getValue, platformBadgeFormatter, serverStateFormatter, timestampFormatter,
} from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
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
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import { AdminFluentAPI, HistoryFluentAPI, QuerySearchTableFluentAPI } from '@/lib/api/table';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { fluentApi, MultiItemAction } from '@/lib/fluent-api';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import {
    getEnumValues,
    getFetchValues,
    makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ServerListResp, ServerModel } from '@/lib/fluent-api/inventory/server';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import SCollectModal from '@/components/organisms/modals/collect-modal/CollectModal.vue';
import { createAtVF, deleteAtVF, updateAtVF } from '@/lib/data-source';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import SMonitoring from '@/components/organisms/monitoring/Monitoring.vue';
import { MetricAPI } from '@/lib/api/monitoring';
import { MONITORING_TYPE } from '@/lib/fluent-api/monitoring/type';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';

const serverStateVF = {
    name: 'State',
    key: 'state',
    view_type: 'enum',
    view_option: {
        INSERVICE: {
            view_type: 'state',
            view_option: {
                text_color: '#222532',
                icon: {
                    color: '#60B731',
                },
            },
        },
        PENDING: {
            view_type: 'state',
            view_option: {
                text_color: '#222532',
                icon: {
                    color: '#FF7750',
                },
            },
        },
        MAINTENANCE: {
            view_type: 'state',
            view_option: {
                text_color: '#222532',
                icon: {
                    color: '#FFCE02',
                },
            },
        },
        CLOSED: {
            view_type: 'state',
            view_option: {
                text_color: '#EF3817',
                icon: {
                    color: '#EF3817',
                },
            },
        },
        DELETED: {
            view_type: 'state',
            view_option: {
                text_color: '#858895',
                icon: {
                    color: '#858895',
                },
            },
        },
    },
};

const serverListDataSource = [
    { name: 'Project', key: 'console_force_data.project' },
    { name: 'Name', key: 'name' },
    serverStateVF,
    { name: 'Primary IP', key: 'primary_ip_address' },
    { name: 'Server Type', key: 'server_type' },
    { name: 'OS Type', key: 'os_type' },
    { name: 'Pool', key: 'pool_info.pool_id' },
    updateAtVF,
];


const baseInfoDetails = [
    { name: 'ID', key: 'server_id' },
    { name: 'Name', key: 'name' },
    serverStateVF,
    { name: 'Primary IP', key: 'primary_ip_address' },
    { name: 'Server Type', key: 'server_type' },
    { name: 'OS Type', key: 'os_type' },
    { name: 'Project', key: 'console_force_data.project' },
    { name: 'Region', key: 'region_info.region_id' },
    { name: 'Zone', key: 'zone_info.zone_id' },
    { name: 'Pool', key: 'pool_info.pool_id' },
    createAtVF,
    updateAtVF,
    deleteAtVF,
];

const exportDataSource = [
    { name: 'ID', key: 'server_id' },
    { name: 'Name', key: 'name' },
    serverStateVF,
    { name: 'Primary IP', key: 'primary_ip_address' },
    { name: 'Server Type', key: 'server_type' },
    { name: 'OS Type', key: 'os_type' },
    { name: 'Project', key: 'project_id' },
    { name: 'Region', key: 'region_info.region_id' },
    { name: 'Zone', key: 'zone_info.zone_id' },
    { name: 'Pool', key: 'pool_info.pool_id' },
    createAtVF,
    updateAtVF,
    deleteAtVF,
];

export default {
    name: 'Server',
    filters: {
        getValue,
    },
    components: {
        PPanelTop,
        GeneralPageLayout,
        PStatus,
        PHorizontalLayout,
        PToolboxTable,
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
        PCol,
        PHr,
        PIconTextButton,
        PDynamicView,
        SProjectTreeModal,
        SCollectModal,
        SMonitoring,
        STagsPanel,
    },
    setup(props, context) {
        class ACHandler extends QuerySearchTableACHandler {
            // eslint-disable-next-line class-methods-use-this
            get valuesFetchUrl() {
                return '/inventory/server/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return [
                    'server_id', 'name', 'primary_ip_address',
                    'data.compute.instance_name', 'data.compute.instance_id',
                    'data.vm.vm_name', 'data.vm.vm_id',
                ];
            }

            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.handlerMap.value = [
                    ...makeValuesFetchHandler(
                        context.parent,
                        '/inventory/server/list',
                        [
                            'server_id', 'name', 'primary_ip_address',
                            'data.compute.instance_name', 'data.compute.instance_id',
                            'data.vm.vm_name', 'data.vm.vm_id',
                        ],
                    ),
                    getEnumValues('state', ['PENDING', 'INSERVICE', 'MAINTENANCE', 'CLOSED', 'DELETED']),
                    getEnumValues('os_type', ['LINUX', 'WINDOWS']),
                    getEnumValues('collection_info.state', ['MANUAL', 'ACTIVE', 'DISCONNECTED']),
                    getEnumValues('server_type', ['BAREMETAL', 'VM', 'HYPERVISOR', 'UNKNOWN']),
                    getFetchValues('project_id', '/identity/project/list', context.parent),
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
        const apiHandler = new QuerySearchTableFluentAPI(
            action,
            undefined,
            undefined,
            { handlerClass: ACHandler, args },
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

        const tabData = reactive({
            tabs: computed(() => makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['data', 'TAB.DATA'],
                ['tag', 'TAB.TAG'],
                ['rawData', 'TAB.RAW_DATA'],
                ['admin', 'TAB.ADMIN'],
                ['history', 'TAB.HISTORY'],
                ['monitoring', 'TAB.MONITORING'],
            ],
            context.parent)),
            activeTab: 'detail',
            multiSelectTabs: makeTrItems([
                ['data', 'TAB.DATA', { keepAlive: true }],
                ['admin', 'TAB.ADMIN'],
            ], context.parent),
            multiSelectActiveTab: 'data',
        });


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
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch(() => {
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
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
                ['pool', 'BTN.CHG_POOL', { disabled: true }],
                [null, null, { type: 'divider' }],
                ['link', null, { label: 'Console', disabled: apiHandler.tableTS.noLink }],
            ],
            context.parent,
            { type: 'item', disabled: isNotSelected }),
        });

        const projectModalVisible = ref(false);
        const clickProject = () => {
            projectModalVisible.value = true;
        };
        const changeProjectAction = fluentApi.inventory().server().changeProject();
        const changeProject = async (node?: ProjectNode|null) => {
            const changeAction = changeProjectAction.setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.server_id));

            if (node) {
                await changeAction.setId(node.data.id).execute();
            } else {
                await changeAction.setReleaseProject().execute();
            }

            await apiHandler.getData();
            projectModalVisible.value = false;
        };
        const exportAction = fluentApi.addons().excel().export().setDataSource(exportDataSource);

        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);


        const adminIsShow = computed(() => {
            let result = false;

            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = tabData.activeTab === 'admin';
            }

            if (apiHandler.tableTS.selectState.isSelectMulti) {
                result = tabData.multiSelectActiveTab === 'admin';
            }

            return result;
        });
        const adminApiHandler = new AdminFluentAPI(
            fluentApi.inventory().server().memberList(),
            adminIsShow,
            'server_id',
            apiHandler,
        );

        const historyIsShow = computed(() => {
            let result = false;

            if (apiHandler.tableTS.selectState.isSelectOne && tabData.activeTab === 'history') {
                result = true;
            }

            return result;
        });
        const selectId = computed(() => apiHandler.tableTS.selectState.firstSelectItem.server_id);
        const getDataAction = fluentApi.inventory().server().getData();

        // @ts-ignore
        const historyAPIHandler = new HistoryFluentAPI(getDataAction, historyIsShow, selectId);

        const collectModalState = reactive({
            visible: false,
        });

        const metricAPIHandler = new MetricAPI(
            'inventory.Server',
            'server_id',
            apiHandler,
        );

        return {
            ...toRefs(tabData),
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
            projectModalVisible,
            clickProject,
            changeProject,
            apiHandler,
            fields,
            multiSelectFields,
            exportToolSet,
            adminApiHandler,
            getDataAction,
            historyAPIHandler,
            baseInfoDetails,
            collectModalState,
            metricAPIHandler,
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
        @apply text-primary2;
        text-align: center;
        margin-bottom: 0.5rem;
    }
</style>
