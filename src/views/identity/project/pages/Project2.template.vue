<template>
    <div class="project">
        <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{width}">
                <div>
                    <p-tree
                        ref="treeApi"
                        v-bind="ts.state"
                        @node:selected="selected"
                    />
                    <br>
                </div>
            </template>
            <template #default>
                <div v-if="treeTs.metaState.firstSelectedNode">
                    <p-horizontal-layout>
                        <template #container="{ height }">
                            <p-tab :tabs="tabs" :active-tab.sync="activeTab" :style="{height:`${height}px`}">
                                <template #summary>
                                    <div style="height: 100%;">
                                        <p-dynamic-view name="Base Information" view_type="item" :data="item||{}"
                                                        :data_source="baseDataSource" :root-mode="true"
                                        />
                                        <p-dict-panel :dict.sync="tags"
                                                      :edit-mode.sync="tagEdit"
                                                      :fetch-api="tagsFetchApi"
                                        />
                                    </div>
                                </template>
                                <template #member>
                                    <p-dynamic-view view_type="query-search-table"
                                                    :api-handler="dvApiHandler"
                                                    :data_source="selectTypeDataSource"
                                                    :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                                    :data="null"
                                    >
                                        <template #toolbox-left>
                                            <p-button style-type="primary-dark" :disabled="true" @click="clickCollectData">
                                                {{ $t('BTN.COLLECT_DATA') }}
                                            </p-button>
                                        </template>
                                    </p-dynamic-view>
                                </template>
                            </p-tab>
                        </template>
                    </p-horizontal-layout>
                    <!--                    <div v-if="activeTab === 'summary'">-->
                    <!--                        <div class="item flex flex-wrap">-->
                    <!--                            <Summary class="item" :data="summaryData" />-->
                    <!--                            <ServersByType class="item"-->
                    <!--                                           :server-data="serverTypeData"-->
                    <!--                                           :vm-data="vmTypeData"-->
                    <!--                                           :os-data="osTypeData"-->
                    <!--                                           :hypervisor-data="hypervisorTypeData"-->
                    <!--                            />-->
                    <!--                            <ResourcesByRegion class="region"-->
                    <!--                                               :data="resourcesByRegionData"-->
                    <!--                                               :loading="resourcesByRegionLoading"-->
                    <!--                            />-->
                    <!--                        </div>-->
                    <!--                    </div>-->
                    <!--                    <div v-else-if="activeTab === 'member'">-->
                    <!--                        <PTab v-if="dvApiHandler.tableTS.selectState.isSelectOne" :tabs="tabs" :active-tab.sync="activeTab">-->
                    <!--                            <template #detail>-->
                    <!--                                <PDynamicDetails-->
                    <!--                                    :details="dvApiHandler.tableTS.selectState.firstSelectItem.metadata.details"-->
                    <!--                                    :data="dvApiHandler.tableTS.selectState.firstSelectItem"-->
                    <!--                                />-->
                    <!--                            </template>-->
                    <!--                        </PTab>-->
                    <!--                        <PTab v-if="dvApiHandler.tableTS.selectState.isSelectMulti" :tabs="multiTabs" :active-tab.sync="activeMultiTab">-->
                    <!--                            <template #data>-->
                    <!--                                <p-dynamic-view-->
                    <!--                                    view_type="simple-table"-->
                    <!--                                    :data_source="selectTypeDataSource"-->
                    <!--                                    :data="dvApiHandler.tableTS.selectState.selectItems"-->
                    <!--                                />-->
                    <!--                            </template>-->
                    <!--                        </PTab>-->
                    <!--                    </div>-->
                </div>
                <p-empty v-else class="empty">
                    <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" />
                    <div class="empty-msg">
                        No Selected Project<br>
                        Please, Click an item from left table.
                    </div>
                </p-empty>
            </template>
        </p-vertical-page-layout2>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import { AxiosInstance } from 'axios';
import { nodeModules } from 'ts-loader/dist/constants';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import { ProjectNode, ProjectTreeAPI } from '@/lib/api/tree';
import PI from '@/components/atoms/icons/PI.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import TreeItem, { TreeState, TreeToolSet } from '@/components/molecules/tree-new/ToolSet';
import Summary from '@/views/dashboard/modules/Summary.vue';
import ServerState from '@/views/dashboard/modules/ServerState.vue';
import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion.vue';
import ServersByType from '@/views/dashboard/modules/ServersByType.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import { QuerySearchTableAPI } from '@/lib/api/table';
import { makeTrItems } from '@/lib/view-helper/index';
import { api } from '@/lib/api/axios';
import { getDataAPI } from '@/lib/api/toolset';
import { datatable } from '@/components/organisms/tables/data-table/DataTable.stories';

export class APIHandler {
    static $http: AxiosInstance;

    public url: string;

    public callback: any;

    public paramsFormatter: any;

    constructor(url: string, paramsFormatter?: any, callback?: any) {
        APIHandler.$http = api.instance;
        this.url = url;
        this.paramsFormatter = paramsFormatter || (() => ({}));
        // eslint-disable-next-line no-empty-function
        this.callback = callback || (() => {});
    }

    async fetch(data?: any) { // .vue에서 정의하고 template.vue에서 원하는 시점에서 api를 실행하기 위한 함수
        try {
            const res = await APIHandler.$http.post(this.url, this.paramsFormatter(data));
            this.callback(res, data);
        } catch (e) {
            console.error(e);
        }
    }
}

export const projectSetup = (
    vm,
    context,
    apiHandler:QuerySearchTableAPI,
    dvApiHandler:QuerySearchTableAPI,
) => {
    const state = reactive({
        item: {},
        tagsFetchApi: () => {},
        selectTypeFields: makeTrItems([
            ['ID', 'COMMON.ID'],
            ['Name', 'COMMON.NAME'],
            ['Email', 'COMMON.EMAIL'],
            ['Status', 'COMMON.STATUS'],
            ['Phone', 'COMMON.PHONE'],
            ['group', 'COMMON.GROUP'],
            ['Language', 'COMMON.LANGUAGE'],
        ], context.parent, {}),
        tabs: makeTrItems([
            ['summary', 'Summary'],
            ['member', 'Member'],
        ], context.parent),
        activeTab: 'summary',
        multiTabs: makeTrItems([
            ['detail', 'TAB.DETAILS'],
            ['data', 'TAB.DATA'],
        ], context.parent),
        activeMultiTab: '',
        summaryData: {},
        resourcesByRegionData: {},
        serverStateData: {},
        serverTypeData: {},
        vmTypeData: {},
        osTypeData: {},
        hypervisorTypeData: {},
        resourcesByRegionLoading: true,
        ts: new ProjectTreeAPI<any, any, ProjectNode, any, TreeToolSet<any>>(
            TreeToolSet,
        ).ts,
    });
    const selectTypeDataSource = computed(() => (_.get(apiHandler.tableTS.selectState.firstSelectItem, ['data_source'], [])));
    watch(() => apiHandler.tableTS.selectState.firstSelectItem, (type, preType) => {
        if (preType && type !== preType) {
            const selectType = apiHandler.tableTS.selectState.firstSelectItem;
            if (selectType) {
                dvApiHandler.resetAll();
                dvApiHandler.apiState.fixSearchQuery = [
                    { key: 'id', operator: '=', value: selectType.id },
                    { key: 'name', operator: '=', value: selectType.name },
                ];
                const keys = selectTypeDataSource.value.map(v => v.key);
                dvApiHandler.tableTS.querySearch.acHandlerArgs.keys = keys;
                dvApiHandler.tableTS.querySearch.acHandlerArgs.suggestKeys = keys;
                dvApiHandler.getData();
            }
        }
    });
    const treeTs = new TreeToolSet();
    return {
        ...toRefs(state),
        apiHandler,
        dvApiHandler,
        treeTs,
        treeApi: treeTs.treeRef,
        selected: async (event) => {
            await vm.getApi.fetch(event);
            treeTs.getSelectedNode(event);
        },
    };
};

const setTagStates = (props) => {
    const state = reactive({
        tags: _.get(props.item, 'tags', {}),
        tagEdit: false,
    });

    watch(() => props.item, (val) => {
        state.tags = _.get(val, 'tags', {});
        state.tagEdit = false;
    });

    return {
        ...toRefs(state),
    };
};

export default defineComponent({
    name: 'ProjectTemplate',
    components: {
        PVerticalPageLayout2,
        PHorizontalLayout,
        PToolboxTable,
        PDictPanel,
        PDynamicView,
        PTab,
        PDynamicDetails,
        PTree,
        PI,
        PEmpty,
        Summary,
        ServerState,
        ResourcesByRegion,
        ServersByType,
    },
    setup(props, context) {
        const vm: any = getCurrentInstance();
        const state: any = new TreeState().state;
        const tagStates = setTagStates(props);
        const mockAPI = new QuerySearchTableAPI('', undefined, undefined, undefined, undefined, undefined, undefined);

        const baseDataSource = [
            { name: 'ID', key: 'project_id' },
            { name: 'Name', key: 'name' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];

        return {
            ...projectSetup(vm, context, mockAPI, mockAPI),
            ...toRefs(state),
            ...tagStates,
            baseDataSource,
        };
    },
});

</script>

<style lang="postcss" scoped>
    .empty {
        flex-direction: column;
        text-align: center;
        justify-content: flex-start;
    }
</style>
