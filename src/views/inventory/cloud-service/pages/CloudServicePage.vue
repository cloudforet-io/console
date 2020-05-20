<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <PPageTitle :title="$route.params.name"
                            child
                            use-total-count
                            use-selected-count :total-count="apiHandler.totalCount.value"
                            :selected-count="apiHandler.tableTS.selectState.selectItems.length"
                            @goBack="$router.push({name:'cloudServiceMain'})"
                />
                <s-dynamic-layout type="query-search-table"
                                  :toolset="apiHandler"
                                  name="cloudService"
                                  :options="options"
                                  :vbind="{
                                      responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'},
                                      showTitle:false,
                                      exportFields:mergeFields,

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
                            class="left-toolbox-item mr-4"
                            :menu="csDropdownMenu"
                            @click-project="clickProject"
                            @click-link="apiHandler.tableTS.linkState.openLink()"
                        >
                            Action
                        </PDropdownMenuBtn>
                    </template>
                </s-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
            <template #detail>
                <SDynamicSubData
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
                />
            </template>
            <template #history>
                <s-dynamic-layout :api="historyApi"
                                  :is-show="historyIsShow" :name="$t('TAB.HISTORY')"
                                  v-bind="defaultHistoryLayout"
                />
            </template>
            <template #monitoring>
                <s-monitoring :resource-type="metricAPIHandler.ts.state.resourceType"
                              :data-tools="metricAPIHandler.ts.state.dataTools"
                              :statistics-types="metricAPIHandler.ts.state.statisticsTypes"
                              :resources="metricAPIHandler.ts.state.resources"
                />
            </template>
        </PTab>
        <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
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
                <s-monitoring :resource-type="metricAPIHandler.ts.state.resourceType"
                              :data-tools="metricAPIHandler.ts.state.dataTools"
                              :statistics-types="metricAPIHandler.ts.state.statisticsTypes"
                              :resources="metricAPIHandler.ts.state.resources"
                />
            </template>
        </PTab>
        <p-empty v-else style="height: auto;margin-top:4rem ">
            No Selected Item
        </p-empty>
        <s-project-tree-modal :visible.sync="projectModalVisible" @confirm="changeProject" />
        <s-collect-modal :visible.sync="collectModalVisible"
                         :resources="apiHandler.tableTS.selectState.selectItems"
                         id-key="cloud_service_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    reactive, toRefs, ref, computed, watch, getCurrentInstance, onMounted,
} from '@vue/composition-api';
import { getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import {
    defaultAdminLayout, defaultHistoryLayout, DefaultQSTableQSProps,
    QuerySearchTableFluentAPI, RouteQuerySearchTableFluentAPI,
} from '@/lib/api/table';

import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { fluentApi } from '@/lib/fluent-api';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { CloudServiceListResp } from '@/lib/fluent-api/inventory/cloud-service';
import SCollectModal from '@/components/organisms/modals/collect-modal/CollectModal.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import {
    DefaultMultiItemTabBarQSProps, DefaultMultiItemTabBarQSPropsName,
    DefaultSingleItemTabBarQSProps, RouterTabBarToolSet,
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/toolset';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';
import SMonitoring from '@/components/organisms/monitoring/Monitoring.vue';
import { MetricAPI } from '@/lib/api/monitoring';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import SDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/SDynamicSubData.vue';
import baseTable from '@/metadata-schema/view/inventory/cloud_service/table/layout/base_table.json';
import { DynamicLayoutApiProp } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import baseInfoSchema from '@/metadata-schema/view/inventory/cloud_service/sub_data/layouts/base_info.json';
import _ from 'lodash';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { propsCopy } from '@/lib/router-query-string';

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
        SDynamicLayout,
        PPageTitle,
        PIconTextButton,
        PTab,
        SDynamicSubData,
        STagsPanel,
        PDropdownMenuBtn,
        // PTableCheckModal,
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
        ...DefaultQSTableQSProps,
        ...DefaultSingleItemTabBarQSProps,
        ...DefaultMultiItemTabBarQSProps,
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

        const state = reactive({
            originFields: [],
            mergeFields: computed(() => [
                ...state.originFields,
                ...baseTable.options.fields,
            ]),
            fields: computed(() => state.mergeFields.map(field => filedMap[field.key] || field)),
            options: computed(() => ({
                fields: state.fields,
            })),
            // exportDataSource: computed(() => [
            //     ...state.originDataSource,
            //     {
            //         name: 'project', key: 'project_id', view_type: 'text', view_option: {},
            //     },
            // ]),
        });

        const { project } = useStore();
        project.getProject();
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

        const apiHandler = new RouteQuerySearchTableFluentAPI(
            csListAction,
            {
                shadow: true,
                border: true,
                padding: true,
                selectable: true,
                dragable: true,
                excelVisible: true,
            },
            undefined,
            undefined,
            vm,
        );

        const singleItemTab = new RouterTabBarToolSet(
            vm,
            undefined,
            computed(() => apiHandler.tableTS.selectState.isSelectOne),
            {
                tabs: makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['tag', 'TAB.TAG'],
                    ['member', 'TAB.MEMBER'],
                    ['history', 'TAB.HISTORY'],
                    ['monitoring', 'TAB.MONITORING'],
                ]),
            },
        );
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new RouterTabBarToolSet(
            vm,
            DefaultMultiItemTabBarQSPropsName,
            computed(() => apiHandler.tableTS.selectState.isSelectMulti),
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA'],
                    ['member', 'TAB.MEMBER'],
                    ['monitoring', 'TAB.MONITORING'],
                ]),
            },
        );
        multiItemTab.syncState.activeTab = 'data';


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
            apiHandler.tableTS.querySearch.acHandlerArgs.keys = keys;
            apiHandler.tableTS.querySearch.acHandlerArgs.suggestKeys = keys;
        };
        getFields(props.provider, props.group, props.name);
        // const exportAction = fluentApi.addons().excel().export();
        // const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        // onMounted(async () => {
        //     await getDataSource(props.provider, props.group, props.name);
        //     exportToolSet.action = exportAction.setDataSource(state.exportDataSource);
        // });
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
                console.debug(state.exportDataSource);
                await getFields(after[0], after[1], after[2]);
                // exportToolSet.action = exportAction.setDataSource(state.exportDataSource);
            }
        });
        apiHandler.getData();


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


        const projectModalVisible = ref(false);
        const clickProject = () => {
            projectModalVisible.value = true;
        };
        const changeProject = async (node?: ProjectNode|null) => {
            const action = fluentApi.inventory().cloudService().changeProject().clone()
                .setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.cloud_service_id));
            if (node) {
                await action.setId(node.data.id).execute();
            } else {
                await action.setReleaseProject().execute();
            }

            await apiHandler.getData();
            projectModalVisible.value = false;
        };

        const csGetDataAction = fluentApi.inventory().cloudService().getData();

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
                console.debug(selectId, ' hit cache layout');
                layouts = cache[selectId];
            } else {
                const resp = await fluentApi.inventory().cloudService().get().setId(selectId)
                    .setOnly('metadata.view.sub_data.layouts')
                    .execute();
                layouts = _.get(resp.data, 'metadata.view.sub_data.layouts', []);
                cache[selectId] = layouts;
            }
            dynamicLayoutState.layouts = layouts;
        };
        const getLayouts = _.debounce(getLayoutsFunc, 50);
        const selectId = computed(() => apiHandler.tableTS.selectState.firstSelectItem?.cloud_service_id);
        const subDataIsShow = computed(() => singleItemTab.syncState.activeTab === 'detail');
        let watchStop = null as unknown as any;
        watch(subDataIsShow, (aft, bef) => {
            if (aft !== bef) {
                if (aft) {
                    getLayouts();
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


        const metricAPIHandler = new MetricAPI(
            'inventory.CloudService',
            'cloud_service_id',
            apiHandler,
        );

        return {
            ...toRefs(state),
            ...toRefs(dynamicLayoutState),
            subDataIsShow,
            apiHandler,
            csDropdownMenu,
            projectModalVisible,
            clickProject,
            changeProject,
            csGetDataAction,
            ...toRefs(collectModalState),
            clickCollectData,
            singleItemTab,
            multiItemTab,
            metricAPIHandler,
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
    .cloud-service-page-nav{
        @apply flex items-center justify-between mb-6;
        .left{
            @apply flex;
            .title{
                line-height: 1.8125rem;
                .group{
                    @apply text-2xl text-gray-500 ;
                }
                .name{
                    @apply text-2xl font-bold;
                }

            }
        }

    }
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
