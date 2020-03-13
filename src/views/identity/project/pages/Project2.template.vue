<template>
    <div class="project">
        <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{width}">
                <div>
                    <p-tree
                        ref="treeApi"
                        v-bind="ts.state"
                        @node:selected="update"
                        @node:unselected="update"
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
<!--                                        <p-dict-panel :dict.sync="tags"-->
<!--                                                      :edit-mode.sync="tagEdit"-->
<!--                                                      :fetch-api="tagsFetchApi"-->
<!--                                        />-->
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
                <div v-else class="empty-msg">
                    <p-i :width="'14rem'" :height="'14rem'" :name="'ic_no_selected_proj'" /><br>
                    <p-empty class="header">
                        No Selected Project
                    <br>
                        Please, Click an item from left table.
                    </p-empty>
                </div>
            </template>
        </p-vertical-page-layout2>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PTree from '@/components/molecules/tree-new/Tree.vue';
import {ProjectNode, ProjectTreeAPI} from '@/lib/api/tree';
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

export const projectSetup = (
    context,
    apiHandler:QuerySearchTableAPI,
    dvApiHandler:QuerySearchTableAPI,
) => {
    const state = reactive({
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
        ts: new ProjectTreeAPI<any, any,ProjectNode, any, TreeToolSet<any>>(
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

    return {
        ...toRefs(state),
        apiHandler,
        dvApiHandler,
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
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        tagsFetchApi: {
            type: Function,
            required: true,
        },
    },
    setup(props, context) {
        const state: any = new TreeState().state;
        const tagStates = setTagStates(props);
        const treeTs = new TreeToolSet();
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
            ...projectSetup(context, mockAPI, mockAPI),
            ...toRefs(state),
            ...tagStates,
            treeTs,
            baseDataSource,
            treeApi: treeTs.treeRef,
            update: (event) => {
                console.log('test', treeTs.getSelectedNode(event))
                treeTs.getSelectedNode(event);
            },
        };
    },
});

</script>

<style lang="postcss" scoped>
    .empty-msg {
        text-align: center;
        margin-top: 5%;
    }
</style>
