<template>
    <general-page-layout>
        <p-horizontal-layout>
            <template #container="{ height }">
                <div class="cloud-service-page-nav">
                    <div class="left">
                        <p-i name="ic_back" width="2rem" height="2rem"
                             @click="$router.push({name:'cloudServiceMain'})"
                        />

                        <div class="title">
                            <span class="group">{{ $route.params.group }}/</span><span class="name">{{ $route.params.name }}</span>
                        </div>
                    </div>
                    <div class="right" />
                </div>
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="apiHandler"
                                :data_source="dataSource"
                                :vbind="{
                                    responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}
                                }"
                                :data="null"
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
                            class="left-toolbox-item mr-4"
                            :menu="csDropdownMenu"
                            @click-project="clickProject"
                            @click-link="apiHandler.tableTS.linkState.openLink()"
                            @click-exportExcel="exportToolSet.getData()"
                        >
                            Action
                        </PDropdownMenuBtn>
                    </template>
                </p-dynamic-view>
            </template>
        </p-horizontal-layout>
        <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
            <template #detail>
                <PDynamicDetails
                    :details="apiHandler.tableTS.selectState.firstSelectItem.metadata.details"
                    :data="apiHandler.tableTS.selectState.firstSelectItem"
                />
            </template>
            <template #data>
                <PDynamicSubData
                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id"
                    :sub-data="apiHandler.tableTS.selectState.firstSelectItem.metadata.sub_data"
                    :action="csGetDataAction"
                />
            </template>
            <template #tag>
                <s-tags-panel
                    :is-show="singleItemTab.syncState.activeTab==='tag'"
                    :resource-id="apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id"
                    tag-page-name="cloudServicePageTags"
                />
            </template>
            <template #rawData>
                <p-raw-data class="my-8 mx-4" :item="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #admin>
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                    {{ $t('TAB.ADMIN') }}
                </PPanelTop>
                <p-dynamic-view
                    view_type="table"
                    :api-handler="adminApiHandler"
                    :data_source="adminApiHandler.dataSource"
                />
            </template>
            <template #history>
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="historyAPIHandler.totalCount.value">
                    {{ $t('TAB.HISTORY') }}
                </PPanelTop>
                <p-dynamic-view
                    view_type="table"
                    :api-handler="historyAPIHandler"
                    :data_source="historyAPIHandler.dataSource"
                />
            </template>
        </PTab>
        <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
              :tabs="multiItemTab.state.tabs"
              :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <p-dynamic-view
                    view_type="simple-table"
                    :data_source="dataSource"
                    :data="apiHandler.tableTS.selectState.selectItems"
                />
            </template>
            <template #admin>
                <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                    {{ $t('TAB.ADMIN') }}
                </PPanelTop>
                <p-dynamic-view
                    view_type="table"
                    :api-handler="adminApiHandler"
                    :data_source="adminApiHandler.dataSource"
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
import PButton from '@/components/atoms/buttons/Button.vue';
import { getValue } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import {
    AdminFluentAPI,
    HistoryFluentAPI, QuerySearchTableFluentAPI,
} from '@/lib/api/table';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { fluentApi } from '@/lib/fluent-api';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { CloudServiceListResp } from '@/lib/fluent-api/inventory/cloud-service';
import SCollectModal from '@/components/organisms/modals/collect-modal/CollectModal.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import PI from '@/components/atoms/icons/PI.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';

export default {
    name: 'CloudServicePage',
    filters: {
        getValue,
    },
    components: {
        GeneralPageLayout,
        PHorizontalLayout,
        PDynamicView,
        PI,
        PIconTextButton,
        PTab,
        PDynamicSubData,
        STagsPanel,
        PRawData,
        PDropdownMenuBtn,
        // PTableCheckModal,
        PDynamicDetails,
        PEmpty,
        SProjectTreeModal,
        SCollectModal,
        PPanelTop,
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
        const vm = getCurrentInstance();

        const state = reactive({
            originDataSource: [],
            dataSource: computed(() => [
                ...state.originDataSource,
                {
                    name: 'project', key: 'console_force_data.project', view_type: 'text', view_option: {},
                },
            ]),
            exportDataSource: computed(() => [
                ...state.originDataSource,
                {
                    name: 'project', key: 'project_id', view_type: 'text', view_option: {},
                },
            ]),
        });
        const singleItemTab = new TabBarState({
            tabs: makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['data', 'TAB.DATA'],
                ['tag', 'TAB.TAG'],
                ['rawData', 'TAB.RAW_DATA'],
                ['admin', 'TAB.ADMIN'],
                ['history', 'TAB.HISTORY'],
            ]),
        });
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new TabBarState({
            tabs: makeTrItems([
                ['data', 'TAB.DATA'],
                ['admin', 'TAB.ADMIN'],
            ]),
        });
        multiItemTab.syncState.activeTab = 'data';

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

        const getDataSource = async (provider, group, name) => {
            const resp = await fluentApi.inventory().cloudServiceType().list().setFilter(
                { key: 'provider', operator: '=', value: provider },
                { key: 'group', operator: '=', value: group },
                { key: 'name', operator: '=', value: name },
            )
                .execute();
            if (resp.data.total_count !== 1) {
                context.$router.push({ name: 'error' });
            }
            state.originDataSource = resp.data.results[0].data_source;
        };
        const apiHandler = new QuerySearchTableFluentAPI(csListAction, {
            shadow: true,
            border: true,
            padding: true,
            selectable: true,
            dragable: true,
            excelVisible: true,
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        onMounted(async () => {
            await getDataSource(props.provider, props.group, props.name);
            exportToolSet.action = exportAction.setDataSource(state.exportDataSource);
        });
        watch(() => [props.provider, props.group, props.name], async (after, before) => {
            if (after && (before && (after[0] !== before[0] || after[1] !== before[1] || after[2] !== before[2]))) {
                apiHandler.resetAll();
                await getDataSource(after[0], after[1], after[2]);
                apiHandler.action = csListAction.setFixFilter(
                    { key: 'provider', operator: '', value: after[0] },
                    { key: 'cloud_service_group', operator: '=', value: after[1] },
                    { key: 'cloud_service_type', operator: '=', value: after[2] },
                );
                await apiHandler.getData();
                console.debug(state.exportDataSource);
                exportToolSet.action = exportAction.setDataSource(state.exportDataSource);
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
        const changeProjectAction = fluentApi.inventory().cloudService().changeProject();
        const changeProject = async (node?: ProjectNode|null) => {
            const action = changeProjectAction.setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.cloud_service_id));
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
                result = singleItemTab.syncState.activeTab === 'admin';
            }

            if (apiHandler.tableTS.selectState.isSelectMulti) {
                result = multiItemTab.syncState.activeTab === 'admin';
            }
            return result;
        });

        const adminApiHandler = new AdminFluentAPI(
            fluentApi.inventory().cloudService().memberList(),
            adminIsShow,
            'cloud_service_id',
            apiHandler,
        );

        // @ts-ignore

        const historyIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = singleItemTab.syncState.activeTab === 'history';
            }
            return result;
        });
        const selectId = computed(() => apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id);
        const getDataAction = fluentApi.inventory().cloudService().getData();

        // @ts-ignore
        const historyAPIHandler = new HistoryFluentAPI(getDataAction, historyIsShow, selectId);


        return {
            ...toRefs(state),
            apiHandler,
            csDropdownMenu,
            projectModalVisible,
            clickProject,
            changeProject,
            exportToolSet,
            csGetDataAction,
            ...toRefs(collectModalState),
            clickCollectData,
            singleItemTab,
            multiItemTab,
            adminApiHandler,
            historyAPIHandler,
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
