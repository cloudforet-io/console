<template>
    <div class="cloud-service">
        <vertical-page-layout :min-left-width="450" :left-width="450" :max-left-width="800">
            <template #leftContainer="{width,widthRaw,height}">
                <transition name="panel-trans">
                    <div v-show="widthRaw>16" :style="{width:width,height:'95%'}" style="padding-left: .5rem;padding-right: .5rem">
                        <p-toolbox-table
                            :style="{width: widthRaw <=435 ?'fit-content' : 'auto',height:'100%'}"
                            :items="apiHandler.tableTS.state.items"
                            :fields="cstFields"
                            :selectable="true"
                            :shadow="false"
                            :border="false"
                            :padding="true"
                            :dragable="false"
                            :multi-select="false"
                            :setting-visible="false"
                            :sortable="true"
                            :background="true"
                            :toolbox-background="false"
                            :all-page="apiHandler.tableTS.state.allPage"
                            :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                            :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                            :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                            :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                            :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                            :loading.sync="apiHandler.tableTS.syncState.loading"
                            @changePageSize="apiHandler.getData"
                            @changePageNumber="apiHandler.getData"
                            @clickRefresh="apiHandler.getData"
                            @changeSort="apiHandler.getData"
                        >
                            <template #toolbox-left>
                                <PDropdownMenuBtn
                                    id="cloud-service-type-dropdown-btn"
                                    :menu="cstDropdownMenu"
                                >
                                    Action
                                </PDropdownMenuBtn>
                            </template>

                            <template #toolbox-bottom>
                                <p-row direction="column">
                                    <div style="margin-bottom: .5rem;">
                                        <p-query-search-bar :search-text.sync="apiHandler.tableTS.querySearch.state.searchText" :autocomplete-handler="apiHandler.tableTS.querySearch.acHandler"
                                                            @newQuery="apiHandler.tableTS.querySearch.addTag"
                                        />
                                    </div>
                                    <div v-if="apiHandler.tableTS.querySearch.tags.value.length !== 0" style="margin-bottom: .5rem; ">
                                        <p-hr style="width: 100%;" />
                                        <p-query-search-tags style="margin-top: .5rem;"
                                                             :tags="apiHandler.tableTS.querySearch.tags.value"
                                                             @deleteTag="apiHandler.tableTS.querySearch.deleteTag"
                                                             @deleteAllTags="apiHandler.tableTS.querySearch.deleteAllTags"
                                        />
                                    </div>
                                </p-row>
                            </template>
                        </p-toolbox-table>
                    </div>
                </transition>
            </template>
            <template #rightContainer>
                <transition name="panel-trans">
                    <div v-if="apiHandler.tableTS.selectState.isSelectOne">
                        <p-horizontal-layout>
                            <template #container="{ height }">
                                <p-dynamic-view view_type="query-search-table"
                                                :api-handler="dvApiHandler"
                                                :data_source="selectTypeDataSource"
                                                :vbind="{responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}}"
                                                :data="null"
                                >
                                    <template #toolbox-left>
                                        <p-button style-type="primary-dark" :disabled="true">
                                            {{ $t('BTN.COLLECT_DATA') }}
                                        </p-button>
                                        <div class="left-toolbox-item">
                                            <PDropdownMenuBtn :menu="csDropdownMenu"
                                                              @click-link="openLink"
                                                              @click-project="clickProject"
                                            >
                                                Action
                                            </PDropdownMenuBtn>
                                        </div>
                                    </template>
                                </p-dynamic-view>
                            </template>
                        </p-horizontal-layout>
                        <PTab v-if="dvApiHandler.tableTS.selectState.isSelectOne" :tabs="tabs" :active-tab.sync="activeTab">
                            <template #detail>
                                <PDynamicDetails
                                    :details="dvApiHandler.tableTS.selectState.firstSelectItem.metadata.details"
                                    :data="dvApiHandler.tableTS.selectState.firstSelectItem"
                                />
                            </template>
                            <template #data>
                                <PDynamicSubData
                                    :select-id="dvApiHandler.tableTS.selectState.firstSelectItem.cloud_service_id" :sub-data="dvApiHandler.tableTS.selectState.firstSelectItem.metadata.sub_data"
                                    url="/inventory/cloud-service/get-data" id-key="cloud_service_id"
                                />
                            </template>
                            <template #rawData>
                                <p-raw-data :item="dvApiHandler.tableTS.selectState.firstSelectItem" />
                            </template>
                            <template #admin>
                                <p-dynamic-view
                                    view_type="table"
                                    :api-handler="adminApiHandler"
                                    :data_source="adminApiHandler.dataSource"
                                />
                            </template>
                            <template #history>
                                <p-dynamic-view
                                    view_type="table"
                                    :api-handler="historyAPIHandler"
                                    :data_source="historyAPIHandler.dataSource"
                                />
                            </template>
                        </PTab>
                        <PTab v-else-if="dvApiHandler.tableTS.selectState.isSelectMulti" :tabs="multiTabs" :active-tab.sync="activeMultiTab">
                            <template #data>
                                <p-dynamic-view
                                    view_type="simple-table"
                                    :data_source="selectTypeDataSource"
                                    :data="dvApiHandler.tableTS.selectState.selectItems"
                                />
                            </template>
                            <template #admin>
                                <p-dynamic-view
                                    view_type="table"
                                    :api-handler="adminApiHandler"
                                    :data_source="adminApiHandler.dataSource"
                                />
                            </template>
                        </PTab>
                    </div>
                    <div v-else class="empty-msg">
                        <p-empty class="header">
                            No Selected Item
                        </p-empty>
                        <p-empty class="msg">
                            Please, Click an item from left table.
                        </p-empty>
                    </div>


                    <!--                <p-table-check-modal-->
                    <!--                        v-if="!!checkTableModalState.mode"-->
                    <!--                        :visible.sync="checkTableModalState.visible"-->
                    <!--                        :header-title="checkTableModalState.title"-->
                    <!--                        :sub-title="checkTableModalState.subTitle"-->
                    <!--                        :theme-color="checkTableModalState.themeColor"-->
                    <!--                        :fields="multiSelectFields"-->
                    <!--                        size="lg"-->
                    <!--                        :centered="true"-->
                    <!--                        :selectable="false"-->
                    <!--                        :items="getSelectServerItems"-->

                    <!--                        @confirm="checkModalConfirm"-->
                    <!--                />-->
                </transition>
            </template>
        </vertical-page-layout>
        <s-project-tree-modal :visible.sync="projectModalVisible" @confirm="changeProject" />
    </div>
</template>
<script lang="ts">
/* eslint-disable camelcase */

import {
    computed, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';


import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { makeTrItems } from '@/lib/view-helper';
import PRawData from '@/components/organisms/text-editor/raw-data/RawData.vue';
import VerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import { SearchQuery } from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { AdminTableAPI, HistoryAPI, QuerySearchTableAPI } from '@/lib/api/table';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { ChangeCloudServiceProject, MockChangeProject } from '@/lib/api/fetch';


export const cloudServiceSetup = (
    context,
    apiHandler:QuerySearchTableAPI<any, any>,
    dvApiHandler:QuerySearchTableAPI<any, any>,
    ChangeProjectAPI:ChangeCloudServiceProject,
) => {
    const state = reactive({
        cstFields: makeTrItems([
            ['provider', 'COMMON.PROVIDER'],
            ['group', 'COMMON.GROUP'],
            ['name', 'COMMON.NAME'],
            ['cloud_service_count', 'COMMON.COUNT', { sortable: false }],
        ], context.parent, {}),
        tabs: makeTrItems([
            ['detail', 'TAB.DETAILS'],
            ['data', 'TAB.DATA'],
            ['rawData', 'TAB.RAW_DATA'],
            ['admin', 'TAB.ADMIN'],
            ['history', 'TAB.HISTORY'],
        ], context.parent),
        activeTab: 'detail',
        multiTabs: makeTrItems([
            ['data', 'TAB.DATA', { keepAlive: true }],
            ['admin', 'TAB.ADMIN'],
        ], context.parent),
        activeMultiTab: 'data',
    });

    const selectTypeDataSource = computed(() => (_.get(apiHandler.tableTS.selectState.firstSelectItem, ['data_source'], [])));
    watch(() => apiHandler.tableTS.selectState.firstSelectItem, (type, preType) => {
        if (preType && type !== preType) {
            const selectType = apiHandler.tableTS.selectState.firstSelectItem;
            if (selectType) {
                dvApiHandler.resetAll();
                dvApiHandler.apiState.fixSearchQuery = [
                    { key: 'provider', operator: '=', value: selectType.provider },
                    { key: 'cloud_service_type', operator: '=', value: selectType.name },
                    { key: 'cloud_service_group', operator: '=', value: selectType.group },
                ];
                const keys = selectTypeDataSource.value.map(v => v.key);
                dvApiHandler.tableTS.querySearch.acHandlerArgs.keys = keys;
                dvApiHandler.tableTS.querySearch.acHandlerArgs.suggestKeys = keys;
                dvApiHandler.getData();
            }
        }
    });
    // todo: CBT 끝나고 홞성화
    // const cstIsNotSelected = computed(() => apiHandler.selectState.isNotSelected);
    // const cstDropdownMenu = reactive({
    //     ...makeTrItems([
    //         ['add', 'BTN.CREATE'],
    //         ['update', 'BTN.UPDATE', { disabled: cstIsNotSelected }],
    //         ['delete', 'BTN.DELETE', { disabled: cstIsNotSelected }],
    //     ],
    //     context.parent,
    //     { type: 'item' }),
    // });
    const cstDropdownMenu = reactive({
        ...makeTrItems([
            ['add', 'BTN.CREATE'],
            ['update', 'BTN.UPDATE'],
            ['delete', 'BTN.DELETE'],
        ],
        context.parent,
        { type: 'item', disabled: true }),
    });
    // todo: CBT 끝나고 홞성화

    // const csDropdownMenu = reactive({
    //     ...makeTrItems([
    //         ['add', 'BTN.CREATE'],
    //         ['update', 'BTN.UPDATE', { disabled: csIsNotSelectedOnlyOne }],
    //         ['delete', 'BTN.DELETE', { disabled: csIsNotSelected }],
    //         [null, null, { type: 'divider' }],
    //         ['project', 'COMMON.CHG_PRO', { disabled: csIsNotSelected }],
    //         ['region', 'BTN.CHG_REGION', { disabled: csIsNotSelected }],
    //     ],
    //     context.parent,
    //     { type: 'item' }),
    // });
    const link = computed(():string|undefined => {
        if (dvApiHandler.tableTS.selectState.isSelectOne) {
            return _.get(dvApiHandler.tableTS.selectState.firstSelectItem, 'data.reference.link')
                || _.get(dvApiHandler.tableTS.selectState.firstSelectItem, 'reference.external_link');
        }
        return undefined;
    });
    const openLink = () => {
        if (link.value) {
            window.open((link.value as string));
        }
    };

    const noLink = computed(() => !link.value);
    const csIsNotSelected = computed(() => dvApiHandler.tableTS.selectState.isNotSelected);
    const csIsNotSelectedOnlyOne = computed(() => !dvApiHandler.tableTS.selectState.isSelectOne);
    const csDropdownMenu = reactive({
        ...makeTrItems([
            ['add', 'BTN.CREATE'],
            ['update', 'BTN.UPDATE'],
            ['delete', 'BTN.DELETE'],
            [null, null, { type: 'divider' }],
            ['project', 'COMMON.CHG_PRO', { disabled: csIsNotSelected }],
            ['region', 'BTN.CHG_REGION'],
            [null, null, { type: 'divider' }],
            ['link', null, { label: 'console', disabled: noLink }],
        ],
        context.parent,
        { type: 'item', disabled: true }),
    });
    const detailsData = (item, view_type, key_path) => {
        if (view_type === 'simple-table') {
            return _.get(item, key_path.split('.'));
        }
        return item.data;
    };

    const projectModalVisible = ref(false);
    const clickProject = () => {
        projectModalVisible.value = true;
    };
    const changeProject = async (node?:ProjectNode|null) => {
        await ChangeProjectAPI.fetchData(dvApiHandler.tableTS.selectState.selectItems.map(item => item.cloud_service_id), node ? node.data.id : undefined);
        await dvApiHandler.getData();
        projectModalVisible.value = false;
    };
    return {
        ...toRefs(state),
        apiHandler,
        dvApiHandler,
        cstDropdownMenu,
        csDropdownMenu,
        selectTypeDataSource,
        detailsData,
        openLink,
        projectModalVisible,
        clickProject,
        changeProject,
    };
};


export default {
    name: 'CloudServiceTemplate',
    components: {
        VerticalPageLayout,
        PHorizontalLayout,
        PDynamicView,
        PTab,
        PToolboxTable,
        PQuerySearchBar,
        PDynamicSubData,
        PButton,
        PRawData,
        PDropdownMenuBtn,
        // PTableCheckModal,
        PHr,
        PQuerySearchTags,
        PDynamicDetails,
        PRow,
        PEmpty,
        SProjectTreeModal,
    },
    setup(props, context) {
        // @ts-ignore
        const mockAPI = new QuerySearchTableAPI('', undefined, undefined, undefined, undefined, undefined, undefined);
        const mockAdminAPI = new AdminTableAPI('', computed(() => ({})), undefined, undefined, undefined, undefined, computed(() => false));
        const mockHistoryAPIHandler = new HistoryAPI('', '', computed(() => ''), undefined, undefined, undefined, computed(() => false));
        const mockChangeProject = new MockChangeProject();
        return {
            ...cloudServiceSetup(context, mockAPI, mockAPI, mockChangeProject),
            adminApiHandler: mockAdminAPI,
            historyAPIHandler: mockHistoryAPIHandler,
        };
    },
};
</script>

<style lang="postcss" scoped>
    #cloud-service-type-dropdown-btn{
        >>> div > .dropdown-btn.menu-btn{
            min-width: 4.7rem;
            width: 4.7rem;
            max-width: 4.7rem;
        }
    }
    .left-toolbox-item{
        margin-left: 1rem;
    }
    .empty-msg{
        margin-top: 1rem;
        .header{
            font-weight: bold;
        }
        .msg{

        }
    }

</style>
