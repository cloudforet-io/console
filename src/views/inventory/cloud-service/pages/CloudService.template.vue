<template>
    <div class="cloud-service">
        <p-vertical-layout :min-left-width="400">
            <template #leftContainer="{width,widthRaw}">
                <transition name="panel-trans">
                    <div v-show="widthRaw>16" :style="{width:`${widthRaw-16}px`,height:'95%'}" style="padding-left: .5rem;padding-right: .5rem">
                        <p-toolbox-table
                            :items="state.items"
                            :fields="state.fields"
                            :selectable="true"
                            :shadow="false"
                            :border="false"
                            :padding="true"
                            :draggable="false"
                            :multi-select="false"
                            :setting-visible="false"
                            :sortable="sortable"
                            :sort-by.sync="sortBy"
                            :sort-desc.sync="sortDesc"
                            :all-page="allPage"
                            :this-page.sync="thisPage"
                            :select-index.sync="[]"
                            :page-size.sync="pageSize"
                        />
                    </div>
                </transition>
            </template>
            <template #rightContainer>
                <transition name="panel-trans">
                    <div>
                        <p-horizontal-layout>
                            <template #container="{ height }">
                                <p-dynamic-view view_type="main-table" :data_source="data_source" :api-handler="dmApiHandler"
                                                :data="null"
                                >
                                    <template #toolbox-left>
                                        <div class="left-toolbox-item">
                                            button
                                        </div>
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
                            Select a Server above for details.
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

import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
// import { MainTableAPI } from '@/lib/api';

import PTag from '@/components/molecules/tags/Tag.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';

import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { makeTrItems } from '@/lib/view-helper';

export const cloudServiceSetup = (context, apiHandler, dmApiHandler) => ({
    apiHandler,
    fields: makeTrItems([
        ['provider', 'COMMON.NAME'],
        ['group', 'COMMON.GROUP'],
        ['name', 'COMMON.NAME', { sortable: false }],
        ['count', 'COMMON.COUNT'],
    ],
    context.parent, {}),
    dmApiHandler,
});


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
        // PDropdownMenuBtn,
        // PTableCheckModal,
        // PIconButton,
        // PTag,
    },
    setup(props, context) {
        // const mockAPI = new MainTableAPI(context.parent, '');
        return {
            ...cloudServiceSetup(context, {}, {}),
            data_source: [
                {
                    name: 'Index Name',
                    key: 'IndexName',
                },
                {
                    name: 'Projection Type',
                    key: 'Projection.ProjectionType',
                },
                {
                    name: 'Item Count',
                    key: 'ItemCount',
                },
                {
                    name: 'status',
                    key: 'IndexStatus',
                    view_type: 'enum',
                    view_option: {
                        DEACTIVE: {
                            view_option: {
                                text_color: '#FF7750',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#FF7750',
                                },
                            },
                            view_type: 'state',
                        },
                        ACTIVE: {
                            view_option: {
                                text_color: '#60B731',
                                icon: {
                                    image: 'aws-ec2',
                                    color: '#60B731',
                                },
                            },
                            view_type: 'state',
                        },

                    },
                },
                {
                    name: 'Write capacity units',
                    key: 'ProvisionedThroughput.WriteCapacityUnits',
                },
                {
                    name: 'Read capacity units',
                    key: 'ProvisionedThroughput.ReadCapacityUnits',
                },
            ],

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
