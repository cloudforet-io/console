<template>
    <div>
        <p-vertical-layout :max-left-width="300">
            <template #leftContainer="{width}">
                <transition name="panel-trans">
                    <div :style="{width}" style="margin-left: 1rem">
                        <button>mini</button>
                    </div>
                </transition>
            </template>
            <template #rightContainer>
                <transition name="panel-trans">
                    <p-horizontal-layout>
                        <template #container="{ height }">
                            <p-dynamic-view view_type="main-table" :data_source="data_source" :api-handler="apiHandler"
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
                    <PTab v-if="true" :tabs="tabs" :active-tab.sync="activeTab">
                        <template #detail="{tabName}">
                            <p-server-detail :item="items[selectIndex[0]]" :tag-confirm-event="tagConfirmEvent" :tag-reset-event="tagResetEvent" />
                        </template>
                        <template #data="{tabName}">
                            <PDynamicSubData
                                :select-id="getFirstSelectServerId" :sub-data="getSubData"
                                url="/inventory/cloud-service/get-data" id-key="cloud_service_id"
                            />
                        </template>
                        <template #rawData="{tabName}">
                            <div>raw data</div>
                        </template>
                    </PTab>
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
                </transition>
            </template>
        </p-vertical-layout>
    </div>
</template>
<script lang="ts">
/* eslint-disable camelcase */

import { createComponent } from '@vue/composition-api';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PVerticalLayout from '@/components/organisms/layouts/vertical-layout/VerticalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import { MockSubDataAPI } from '@/lib/api';

import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';

import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PTableCheckModal from '@/components/organisms/modals/action-modal/ActionConfirmModal.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';

export default {
    name: 'CloudServiceTemplate',
    components: {
        PHorizontalLayout,
        PVerticalLayout,
        PDynamicView,
        PTab,
        PDataTable,
        PToolboxTable,
        PQuerySearchBar,
        PDynamicSubData,
        PDropdownMenuBtn,
        PTableCheckModal,
        PIconButton,
        PTag,
    },
    setup(props) {
        const subData = [
            {
                IndexName: 'add-pk-index-1',
                Projection: { ProjectionType: 'ALL' },
                IndexStatus: 'ACTIVE',
                ProvisionedThroughput: {
                    NumberOfDecreasesToday: 1, ReadCapacityUnits: 5, WriteCapacityUnits: 5,
                },
                ItemCount: 0,
            },
            {
                IndexName: 'add-pk-index-2',
                KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'Half' },
                IndexStatus: 'ACTIVE',
                ProvisionedThroughput: {
                    NumberOfDecreasesToday: 1, ReadCapacityUnits: 9, WriteCapacityUnits: 5,
                },
                ItemCount: 10,
            },
            {
                IndexName: 'add-pk-index-3',
                KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' },
                IndexStatus: 'DEACTIVATE',
                ProvisionedThroughput: {
                    NumberOfDecreasesToday: 1, ReadCapacityUnits: 15, WriteCapacityUnits: 2,
                },
                ItemCount: 300,
            },
            {
                IndexName: 'add-pk-index-4',
                KeySchema: [{ AttributeName: 'add-pk', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'KEY_ONLY' },
                IndexStatus: 'ACTIVE',
                ProvisionedThroughput: {
                    NumberOfDecreasesToday: 1, ReadCapacityUnits: 3, WriteCapacityUnits: 1,
                },
                ItemCount: 1000,
            },
        ];

        return {
            apiHandler: new MockSubDataAPI(subData),
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

<style scoped>

</style>
