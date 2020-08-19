<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <div class="page-navigation">
                    <p-page-navigation :routes="route" />
                </div>
                <p-page-title :title="$route.params.name"
                              child
                              use-total-count
                              use-selected-count :total-count="apiHandler.totalCount.value"
                              :selected-count="apiHandler.tableTS.selectState.selectItems.length"
                              @goBack="$router.go(-1)"
                />
                <s-dynamic-layout name="cloudService"
                                  type="query-search-table"
                                  :toolset="apiHandler"
                                  :options="options"
                                  :style="{'height': height+'px'}"
                                  :vbind="{
                                      showTitle: false,
                                      exportFields: mergeFields,
                                      resourceType: 'inventory.CloudService'
                                  }"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            :disabled="apiHandler.tableTS.selectState.selectItems.length === 0"
                                            @click="clickCollectData"
                        >
                            {{ $t('BTN.COLLECT_DATA') }}
                        </p-icon-text-button>

                        <p-dropdown-menu-btn
                            class="left-toolbox-item mr-4"
                            :menu="csDropdownMenu"
                            @click-project="clickProject"
                            @click-link="apiHandler.tableTS.linkState.openLink()"
                        >
                            Action
                        </p-dropdown-menu-btn>
                    </template>
                </s-dynamic-layout>
                <!--                <p-dynamic-layout :options="tableSchema.options" />-->
            </template>
        </p-horizontal-layout>
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
            <template #detail>
                <s-dynamic-sub-data
                    :layouts="mergeLayouts"
                    :resource-api="resourceApi"
                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id||''"
                    :is-show="subDataIsShow"
                />
            </template>

            <template #tag>
                <s-tags-panel
                    :is-show="singleItemTab.syncState.activeTab==='tag'"
                    :resource-id="apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id"
                    tag-page-name="cloudServicePageTags"
                />
            </template>
            <template #member>
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
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
               :tabs="multiItemTab.state.tabs"
               :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <s-dynamic-layout
                    type="simple-table"
                    :options="options"
                    :data="apiHandler.tableTS.selectState.selectItems"
                    :vbind="{
                        showTitle:false,

                    }"
                />
            </template>
            <template #member>
                <s-dynamic-layout :api="adminApi"
                                  :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                  v-bind="defaultAdminLayout"
                />
            </template>
            <template #monitoring>
                <s-monitoring v-bind="monitoringTS.state" />
            </template>
        </p-tab>
        <p-empty v-else style="height: auto; margin-top: 4rem;">
            No Selected Item
        </p-empty>
        <s-project-tree-modal :visible.sync="changeProjectState.visible"
                              :project-id="changeProjectState.projectId"
                              :loading="changeProjectState.loading"
                              @confirm="changeProject"
        />
        <s-collect-modal :visible.sync="collectModalVisible"
                         :resources="apiHandler.tableTS.selectState.selectItems"
                         id-key="cloud_service_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    reactive, toRefs, computed, watch, getCurrentInstance,
} from '@vue/composition-api';
import { getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import {
    defaultAdminLayout, defaultHistoryLayout, QuerySearchTableFluentAPI,
} from '@/lib/api/table';

import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import { fluentApi } from '@/lib/fluent-api';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { CloudServiceListResp } from '@/lib/fluent-api/inventory/cloud-service';
import SCollectModal from '@/views/common/collect-modal/CollectModal.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import SMonitoring from '@/views/common/monitoring/Monitoring.vue';

import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import SDynamicLayout from '@/views/common/dynamic-layout/SDynamicLayout.vue';
import SDynamicSubData from '@/views/common/dynamic-subdata/SDynamicSubData.vue';
import baseTable from '@/data-schema/inventory/cloud_service/table/layout/base_table.json';
import { DynamicLayoutApiProp } from '@/views/common/dynamic-layout/toolset';
import baseInfoSchema from '@/data-schema/inventory/cloud_service/sub_data/layouts/base_info.json';
import { get, debounce } from 'lodash';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds, queryStringToNumberArray,
    queryStringToQueryTags,
    queryTagsToQueryString,
} from '@/lib/router-query-string';
import { MonitoringToolSet } from '@/views/common/monitoring/Monitoring.toolset';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { makeKeyItems, makeValueHandlerMapWithReference } from '@/lib/component-utils/query-search';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';

const rawLayout = {
    name: 'Raw Data',
    type: 'raw',

};
export default {
    name: 'CloudServicePage',
    filters: {
        getValue,
    },
    components: {
        GeneralPageLayout,
        PHorizontalLayout,
        PPageNavigation,
        SDynamicLayout,
        PPageTitle,
        PIconTextButton,
        PTab,
        SDynamicSubData,
        STagsPanel,
        PDropdownMenuBtn,
        PEmpty,
        SProjectTreeModal,
        SCollectModal,
        SMonitoring,
    },
    props: {
        provider: {
            type: String,
            required: true,
        },
        group: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;

        const fieldMap = {
            project_id: {
                key: 'console_force_data.project',
                type: 'text',
                name: 'Project',
            },
        };

        const state = reactive({
            originFields: [],
            mergeFields: computed(() => [
                ...state.originFields,
                ...baseTable.options.fields,
            ]),
            fields: computed(() => state.mergeFields.map(field => fieldMap[field.key] || field)),
            options: computed(() => ({
                fields: state.fields,
            })),
            tableSchema: {},
        });

        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' },
                { name: `${props.name}`, path: `/inventory/cloud-service/${props.provider}/${props.group}/${props.name}` }],
        });

        const { project } = useStore();
        const csListAction = fluentApi.inventory().cloudService().list()
            .setTransformer((resp: AxiosResponse<CloudServiceListResp>) => {
                const result = resp;
                result.data.results = resp.data.results.map((item) => {
                    item.console_force_data = { project: item.project_id ? project.state.projects[item.project_id] || item.project_id : '' };
                    return item;
                });
                return result;
            })
            .setFixFilter(
                { key: 'provider', operator: '=', value: props.provider },
                { key: 'cloud_service_group', operator: '=', value: props.group },
                { key: 'cloud_service_type', operator: '=', value: props.name },
            );

        const apiHandler = new QuerySearchTableFluentAPI(
            csListAction,
            {
                shadow: true,
                border: true,
                selectable: true,
                excelVisible: true,
            },
            undefined,
            undefined,
        );

        const singleItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['tag', 'TAB.TAG'],
                    ['member', 'TAB.MEMBER'],
                    ['history', 'TAB.HISTORY'],
                    ['monitoring', 'TAB.MONITORING'],
                ]),
            },
            {
                activeTab: 'detail',
            },
        );

        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA'],
                    ['member', 'TAB.MEMBER'],
                    ['monitoring', 'TAB.MONITORING'],
                ]),
            },
            {
                activeTab: 'data',
            },
        );


        const getFields = async (provider, group, name) => {
            const resp = await fluentApi.inventory().cloudServiceType().list().setFilter(
                { key: 'provider', operator: '=', value: provider },
                { key: 'group', operator: '=', value: group },
                { key: 'name', operator: '=', value: name },
            )
                .setOnly('metadata.view.table.layout.options.fields')
                .execute();
            if (resp.data.total_count !== 1) {
                context.$router.push({ name: 'error' });
            }
            state.originFields = resp.data.results[0].metadata?.view?.table?.layout?.options?.fields || [];
            const keys = state.originFields.map(i => i.key);
            apiHandler.tableTS.querySearch.state.keyItems = makeKeyItems(keys);
            apiHandler.tableTS.querySearch.valueHandlerMap = makeValueHandlerMapWithReference(keys, 'inventory.CloudService');
        };


        watch(() => [props.provider, props.group, props.name], async (after, before) => {
            if (after && (before && (after[0] !== before[0] || after[1] !== before[1] || after[2] !== before[2]))) {
                apiHandler.resetAll();
                await getFields(after[0], after[1], after[2]);
                apiHandler.action = csListAction.setFixFilter(
                    { key: 'provider', operator: '', value: after[0] },
                    { key: 'cloud_service_group', operator: '=', value: after[1] },
                    { key: 'cloud_service_type', operator: '=', value: after[2] },
                );
                await apiHandler.getData();
                // console.debug(state.exportDataSource);
                await getFields(after[0], after[1], after[2]);
                // exportToolSet.action = exportAction.setDataSource(state.exportDataSource);
            }
        });
        // apiHandler.getData();


        const csIsNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const csDropdownMenu = reactive({
            ...makeTrItems([
                ['add', 'BTN.CREATE'],
                ['update', 'BTN.UPDATE'],
                ['delete', 'BTN.DELETE'],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO', { disabled: csIsNotSelected }],
                ['region', 'BTN.CHG_REGION'],
                [null, null, { type: 'divider' }],
                ['link', null, { label: 'Console', disabled: apiHandler.tableTS.noLink }],
            ],
            context.parent,
            { type: 'item', disabled: true }),
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
            const action = fluentApi.inventory().cloudService().changeProject().clone()
                .setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.cloud_service_id));
            if (data) {
                await action.setId(data.id).execute();
            } else {
                await action.setReleaseProject().execute();
            }

            changeProjectState.loading = false;
            changeProjectState.visible = false;
            await apiHandler.getData();
        };

        // const csGetDataAction = fluentApi.inventory().cloudService().getData();

        const collectModalState = reactive({
            collectModalVisible: false,
        });
        const clickCollectData = () => {
            collectModalState.collectModalVisible = true;
        };


        const adminIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = singleItemTab.syncState.activeTab === 'member';
            }

            if (apiHandler.tableTS.selectState.isSelectMulti) {
                result = multiItemTab.syncState.activeTab === 'member';
            }
            return result;
        });
        const adminApi = computed<DynamicLayoutApiProp>(() => {
            let ids: string[] = [];
            if (apiHandler.tableTS.selectState.isSelectOne) {
                ids = [apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id];
            } else {
                ids = apiHandler.tableTS.selectState.selectItems.map(it => it.cloud_service_id);
            }
            return {
                resource: fluentApi.inventory().cloudService().memberList().setIds(ids),

            };
        });
        const historyIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = singleItemTab.syncState.activeTab === 'history';
            }
            return result;
        });
        const historyApi = computed<DynamicLayoutApiProp>(() => {
            const selectIdForHistory = apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id;
            return {
                resource: fluentApi.inventory().cloudService(),
                getAction: (act: any) => act.setId(selectIdForHistory),

            };
        });

        const cache = {};
        const dynamicLayoutState = reactive({
            layouts: [],
            resourceApi: fluentApi.inventory().cloudService(),
            mergeLayouts: computed(() => (dynamicLayoutState.layouts ? [baseInfoSchema, ...dynamicLayoutState.layouts, rawLayout] : [baseInfoSchema, rawLayout])),
        });


        const getLayoutsFunc = async () => {
            dynamicLayoutState.layouts = null;
            const selectId = apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id;
            let layouts;
            if (cache[selectId]) {
                layouts = cache[selectId];
            } else {
                const resp = await fluentApi.inventory().cloudService().get().setId(selectId)
                    .setOnly('metadata.view.sub_data.layouts')
                    .execute();
                layouts = get(resp.data, 'metadata.view.sub_data.layouts', []);
                cache[selectId] = layouts;
            }
            dynamicLayoutState.layouts = layouts;
        };
        const getLayouts = debounce(getLayoutsFunc, 50);
        const selectId = computed(() => apiHandler.tableTS.selectState.firstSelectItem?.cloud_service_id);
        const subDataIsShow = computed(() => singleItemTab.syncState.activeTab === 'detail');
        let watchStop = null as unknown as any;
        watch(subDataIsShow, (aft, bef) => {
            if (aft !== bef) {
                if (aft) {
                    watchStop = watch(selectId, (af, be) => {
                        if (af && af !== be) {
                            getLayouts();
                        }
                    });
                } else if (watchStop) {
                    watchStop();
                    dynamicLayoutState.layouts = null;
                    watchStop = null;
                }
            }
        });


        const monitoringTS = new MonitoringToolSet(
            'cloud_service_id',
            'inventory.CloudService',
            computed(() => apiHandler.tableTS.selectState.selectItems),
        );


        /** Query String */
        makeQueryStringComputeds(apiHandler.tableTS.syncState, {
            pageSize: { key: 'ps', setter: Number },
            thisPage: { key: 'p', setter: Number },
            sortBy: { key: 'sb' },
            sortDesc: { key: 'sd', setter: Boolean },
        });
        makeQueryStringComputed(apiHandler.tableTS.querySearch.tags,
            {
                key: 'f',
                setter: queryStringToQueryTags,
                getter: queryTagsToQueryString,
            });

        /** Init */
        const init = async () => {
            // await listCloudServiceData();
            await getFields(props.provider, props.group, props.name);
            await project.getProject();
            await apiHandler.getData();
        };

        init();

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            ...toRefs(dynamicLayoutState),
            subDataIsShow,
            apiHandler,
            csDropdownMenu,
            clickProject,
            changeProjectState,
            changeProject,
            // csGetDataAction,
            ...toRefs(collectModalState),
            clickCollectData,
            singleItemTab,
            multiItemTab,
            monitoringTS,
            defaultAdminLayout,
            defaultHistoryLayout,
            adminApi,
            adminIsShow,
            historyApi,
            historyIsShow,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .cloud-service-page-nav {
        @apply flex items-center justify-between mb-6;
        .left {
            @apply flex;
            .title {
                line-height: 1.8125rem;
                .group {
                    @apply text-2xl text-gray-500 ;
                }
                .name {
                    @apply text-2xl font-bold;
                }
            }
        }
    }

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
