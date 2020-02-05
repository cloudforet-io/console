<template>
    <div class="cloud-service">
        <p-vertical-layout :min-left-width="400">
            <template #leftContainer="{width,widthRaw}">
                <transition name="panel-trans">
                    <div v-show="widthRaw>16" :style="{width:`${widthRaw-16}px`,height:'95%'}" style="padding-left: .5rem;padding-right: .5rem">
                        <p-toolbox-table
                            :items="apiHandler.state.items"
                            :fields="cstFields"
                            :selectable="true"
                            :shadow="false"
                            :border="false"
                            :padding="true"
                            :draggable="false"
                            :multi-select="false"
                            :setting-visible="false"
                            :sortable="true"
                            :sort-by.sync="apiHandler.state.sortBy"
                            :sort-desc.sync="apiHandler.state.sortDesc"
                            :all-page="apiHandler.state.allPage"
                            :this-page.sync="apiHandler.state.thisPage"
                            :select-index.sync="apiHandler.state.selectIndex"
                            :page-size.sync="apiHandler.state.pageSize"
                            :loading.sync="apiHandler.state.loading"
                            @changePageSize="apiHandler.getData"
                            @changePageNumber="apiHandler.getData"
                            @clickRefresh="apiHandler.getData"
                            @changeSort="apiHandler.getData"
                        >
                            <!--                            <template #toolbox-left>-->
                            <!--                                <div />-->
                            <!--                                &lt;!&ndash;                                <PDropdownMenuBtn&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                    id="cloud-service-type-dropdown-btn"&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                    class="left-toolbox-item"&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                    :menu="[]"&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                >&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                    Action&ndash;&gt;-->
                            <!--                                &lt;!&ndash;                                </PDropdownMenuBtn>&ndash;&gt;-->
                            <!--                            </template>-->
                        </p-toolbox-table>
                    </div>
                </transition>
            </template>
            <template #rightContainer>
                <transition name="panel-trans">
                    <div>
                        <p-horizontal-layout>
                            <template #container="{ height }">
                                <p-dynamic-view view_type="main-table" :data_source="[]" :api-handler="dvApiHandler"
                                                :data="null"
                                >
                                    <template #toolbox-left>
                                        <p-button>Collect Data</p-button>
                                        <!--                                        <PDropdownMenuBtn-->
                                        <!--                                            id="server-dropdown-btn"-->
                                        <!--                                            class="left-toolbox-item"-->
                                        <!--                                            :menu="CstDropdownMenu"-->
                                        <!--                                        >-->
                                        <!--                                            Action-->
                                        <!--                                        </PDropdownMenuBtn>-->
                                    </template>
                                </p-dynamic-view>
                            </template>
                        </p-horizontal-layout>
                        <!--                    <PTab v-if="true" :tabs="tabs" :active-tab.sync="activeTab">-->
                        <!--                        <template #detail="{tabName}">-->
                        <!--                            <p-server-detail :item="items[selectIndex[0]]" :tag-confirm-event="tagConfirmEvent" :tag-reset-event="tagResetEvent" />-->
                        <!--                        </template>-->
                        <!--                        <template #data="{tabName}">-->
                        <!--                            <PDynamicSubData-->
                        <!--                                :select-id="getFirstSelectServerId" :sub-data="getSubData"-->
                        <!--                                url="/inventory/cloud-service/get-data" id-key="cloud_service_id"-->
                        <!--                            />-->
                        <!--                        </template>-->
                        <!--                        <template #rawData="{tabName}">-->
                        <!--                            <div>raw data</div>-->
                        <!--                        </template>-->
                        <!--                    </PTab>-->
                        <!--                    <PTab v-else-if="isSelectedMulti" :tabs="multiSelectTabs" :active-tab.sync="multiSelectActiveTab">-->
                        <!--                        <template #data="{tabName}">-->
                        <!--                            <p-data-table-->
                        <!--                                :fields="multiSelectFields"-->
                        <!--                                :sortable="false"-->
                        <!--                                :selectable="false"-->
                        <!--                                :items="getSelectServerItems"-->
                        <!--                                :col-copy="true"-->
                        <!--                            >-->
                        <!--                                <template v-slot:col-state-format="data">-->
                        <!--                                    <p-status v-bind="serverStateFormatter(data.value)" />-->
                        <!--                                </template>-->
                        <!--                                <template />-->
                        <!--                            </p-data-table>-->
                        <!--                        </template>-->
                        <!--                        <template #admin="{tabName}">-->
                        <!--                            <p-server-admin :select-index="selectIndex"-->
                        <!--                                            :items="admin.items"-->
                        <!--                                            :sort-by.sync="admin.sortBy"-->
                        <!--                                            :sort-desc.sync="admin.sortDesc"-->
                        <!--                                            :page-size.sync="admin.pageSize"-->
                        <!--                                            :all-page="admin.allPage"-->
                        <!--                                            :this-page.sync="admin.thisPage"-->
                        <!--                                            :search-text.sync="admin.searchText"-->
                        <!--                                            :loading="admin.loading"-->
                        <!--                                            :get-server-admin="getServerAdmin"-->
                        <!--                            />-->
                        <!--                        </template>-->
                        <!--                    </PTab>-->

                        <div id="empty-space">
                            Select a  above for details.
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
                    </div>
                </transition>
            </template>
        </p-vertical-layout>
    </div>
</template>
<script>
/* eslint-disable camelcase */

import { computed, reactive } from '@vue/composition-api';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
// import { MainTableAPI } from '@/lib/api';

import PTag from '@/components/molecules/tags/Tag.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { makeTrItems } from '@/lib/view-helper';
import { MainTableAPI } from '@/lib/api'

export const cloudServiceSetup = (context, apiHandler, dvApiHandler) => {
    const cstFields = makeTrItems([
        ['provider', 'COMMON.NAME'],
        ['group', 'COMMON.GROUP'],
        ['name', 'COMMON.NAME'],
        ['count', 'COMMON.COUNT', { sortable: false }],
    ], context.parent, {});
    const cstIsNotSelected = computed(() => apiHandler.state.selectIndex.length === 0);
    const selectTypeDataSource = computed(() => (cstIsNotSelected.value !== true ? apiHandler.state.selectIndex[0].templates : {}));
    console.debug(cstIsNotSelected.value, selectTypeDataSource.value);
    // const cstDropdownMenu = reactive({
    //     ...makeTrItems([
    //         ['add', 'COMMON.BTN_ADD'],
    //         ['update', 'COMMON.BTN_UPDATE', { disabled: cstIsNotSelected }],
    //         ['delete', 'COMMON.BTN_DELETE', { disabled: cstIsNotSelected }],
    //     ],
    //     context.parent,
    //     { type: 'item' }),
    // });

    //
    // const CsDropdownMenu = reactive({
    //     ...makeTrItems([
    //         ['add', 'COMMON.BTN_ADD'],
    //         ['update', 'COMMON.BTN_UPDATE', { disabled: cstIsNotSelected }],
    //         ['delete', 'COMMON.BTN_DELETE', { disabled: cstIsNotSelected }],
    //         [null, null, { type: 'divider' }],
    //         ['project', 'COMMON.CHG_PRO', { disabled: cstIsNotSelected }],
    //         ['region', 'COMMON.CHG_REGION', { disabled: cstIsNotSelected }],
    //     ],
    //     context.parent,
    //     { type: 'item' }),
    // });
    return {
        apiHandler,
        dvApiHandler,
        cstFields,
        cstIsNotSelected,
        // cstDropdownMenu,
        // selectTypeDataSource,
    };
};


export default {
    name: 'CloudServiceTemplate',
    components: {
        PHorizontalLayout,
        PVerticalLayout,
        PDynamicView,
        // PTab,
        // PDataTable,
        PToolboxTable,
        // PQuerySearchBar,
        // PDynamicSubData,
        PButton,
        // PDropdownMenuBtn,
        // PTableCheckModal,
        // PIconButton,
        // PTag,
    },
    setup(props, context) {
        const mockAPI = new MainTableAPI(context.parent, '');
        return {
            ...cloudServiceSetup(context, mockAPI, mockAPI),
        };
    },
};
</script>

<style lang="scss" scoped>
    .cloud-service{
        margin-top: 1.5625rem;
        margin-left: 2rem;
        margin-right: 2rem;
    }
</style>
