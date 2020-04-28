<template>
    <general-page-layout class="collector-page">
        <p-horizontal-layout :line="false">
            <template #container="{ height }">
                <p-toolbox-table v-bind="apiHandler.tableTS.state"
                                 :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                                 :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                                 :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                                 :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                                 :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                                 :loading.sync="apiHandler.tableTS.syncState.loading"
                                 @changePageSize="apiHandler.action"
                                 @changePageNumber="apiHandler.action"
                                 @clickRefresh="apiHandler.action"
                                 @changeSort="apiHandler.action"
                >
                    <!--                    @clickExcel="exportExcel"-->
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="$router.push({path: '/plugin/collector/create/plugins'})"
                        >
                            {{ $t('BTN.CREATE') }}
                        </p-icon-text-button>
                        <PDropdownMenuBtn class="left-toolbox-item"
                                          :menu="dropdown"
                                          @click-update="onClickUpdate"
                                          @click-enable="onClickEnable"
                                          @click-disable="onClickDisable"
                                          @click-delete="onClickDelete"
                                          @click-collectData="apiHandler.action"
                        >
                            {{ $t('BTN.ACTION') }}
                        </PDropdownMenuBtn>
                        <div class="left-toolbox-item">
                            <p-query-search-bar :search-text.sync="apiHandler.tableTS.querySearch.state.searchText"
                                                :autocomplete-handler="apiHandler.tableTS.querySearch.acHandler"
                                                @newQuery="apiHandler.tableTS.querySearch.addTag"
                            />
                        </div>
                    </template>
                    <template v-if="apiHandler.tableTS.querySearch.tags.value.length !== 0" slot="toolbox-bottom">
                        <p-col :col="12" class="mb-2">
                            <p-hr class="w-full" />
                            <p-row class="mt-2">
                                <div class="flex-grow-0">
                                    <p-icon-button name="ic_delete" @click="apiHandler.tableTS.querySearch.deleteAllTags" />
                                </div>
                                <div class="flex-grow ml-4">
                                    <p-tag v-for="(tag, idx) in apiHandler.tableTS.querySearch.tags.value" :key="idx + tag"
                                           style="margin-top: 0.375rem; margin-bottom: 0.37rem;"
                                           @delete="apiHandler.tableTS.querySearch.deleteTag(idx)"
                                    >
                                        {{ tag.key }}:{{ tag.operator }} {{ tag.value }}
                                    </p-tag>
                                </div>
                            </p-row>
                        </p-col>
                    </template>
                    <template #col-name-format="data">
                        <span class="name">
                            <p-lazy-img :img-url="getIcon(data)"
                                        width="1.5rem" height="1.5rem"
                            />
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                    <template #col-last_collected_at-format="{value}">
                        {{ value ? timestampFormatter(value) : '' }}
                    </template>
                    <template #col-created_at-format="{value}">
                        {{ timestampFormatter(value) }}
                    </template>
                    <template #col-plugin_info-format="{value}">
                        <template v-if="value.options && value.options.supported_resource_type">
                            <div v-for="(d, i) in value.options.supported_resource_type" :key="i">
                                {{ d }}
                            </div>
                        </template>
                        <span v-else />
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne"
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
        >
            <template #detail>
                <collector-detail :item="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #tag>
                <s-tags-panel :is-show="tabState.activeTab==='tag'"
                              :resource-id="apiHandler.tableTS.selectState.firstSelectItem.collector_id"
                              tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
            <template #schedules>
                <collector-schedules :collector="apiHandler.tableTS.selectState.firstSelectItem"
                                     :items="scheduleState.items"
                                     :total-count="scheduleState.totalCount"
                                     :loading="scheduleState.loading"
                                     :edit-visible.sync="scheduleState.editVisible"
                                     :delete-visible.sync="scheduleState.deleteVisible"
                                     :select-index.sync="scheduleState.selectIndex"
                />
            </template>
        </p-tab>
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
               :tabs="tabState.multiTabs" :active-tab.sync="tabState.multiActiveTab"
        >
            <template #data>
                <p-data-table
                    :fields="multiFields"
                    :sortable="false"
                    :selectable="false"
                    :items="apiHandler.tableTS.selectState.selectItems"
                    col-copy
                >
                    <template #col-name-format="data">
                        <span class="name">
                            <p-lazy-img :img-url="getIcon(data)"
                                        width="1.5rem" height="1.5rem"
                            />
                            {{ data.value }}
                        </span>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="collectorStateFormatter(value)" />
                    </template>
                </p-data-table>
            </template>
        </p-tab>

        <collector-update-modal v-if="updateModalState.visible"
                                :visible.sync="updateModalState.visible"
                                :loading="updateModalState.loading"
                                :collector="apiHandler.tableTS.selectState.firstSelectItem"
                                :plugin="updateModalState.plugin"
                                :versions="updateModalState.versions"
        />

        <collect-data-modal v-if="collectDataModalVisible"
                            :visible.sync="collectDataModalVisible"
                            :collector="apiHandler.tableTS.selectState.firstSelectItem"
        />

        <p-table-check-modal v-if="checkModalState.mode"
                             :visible.sync="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="multiFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="apiHandler.tableTS.selectState.selectItems"
                             @confirm="checkModalState.checkModalConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable class-methods-use-this */

import {
    reactive, toRefs, computed, ref,
} from '@vue/composition-api';
import { timestampFormatter, collectorStateFormatter } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';
import collectorEventBus from '@/views/plugin/collector/CollectorEventBus';
import { fluentApi } from '@/lib/fluent-api';
import _ from 'lodash';

import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PStatus from '@/components/molecules/status/Status.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTag, { tagList } from '@/components/molecules/tags/Tag.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PLazyImg from '@/components/organisms/lazy-img/LazyImg.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import {
    getEnumValues, makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete';


const PTab = () => import('@/components/organisms/tabs/tab/Tab.vue');
const PHorizontalLayout = () => import('@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue');
const PToolboxTable = () => import('@/components/organisms/tables/toolbox-table/ToolboxTable.vue');
const PDataTable = () => import('@/components/organisms/tables/data-table/DataTable.vue');
const PDropdownMenuBtn = () => import('@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue');
const PQuerySearchBar = () => import('@/components/organisms/search/query-search-bar/QuerySearchBar.vue');
const PTableCheckModal = () => import('@/components/organisms/modals/table-modal/TableCheckModal.vue');

const CollectorUpdateModal = () => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue');
const CollectDataModal = () => import('@/views/plugin/collector/modules/CollectDataModal.vue');
const CollectorDetail = () => import('@/views/plugin/collector/modules/CollectorDetail.vue');
const CollectorCredentials = () => import('@/views/plugin/collector/modules/CollectorCredentials.vue');
const CollectorSchedules = () => import('@/views/plugin/collector/modules/CollectorSchedules.vue');


const setTabData = (props, context) => (reactive({
    activeTab: 'detail',
    tabs: makeTrItems([
        ['detail', 'PANEL.DETAILS', { keepAlive: true }],
        ['tag', 'TAB.TAG'],
        ['credentials', 'PANEL.CREDENTIAL', { keepAlive: true }],
        ['schedules', 'PANEL.SCHEDULE', { keepAlive: true }],
    ], context.parent),
    multiActiveTab: 'data',
    multiTabs: makeTrItems([
        ['data', 'TAB.DATA', { keepAlive: true }],
    ], context.parent),
}));

const checkModalState = reactive({
    visible: false,
    mode: '',
    item: null,
    confirmEventName: '',
    title: '',
    subTitle: '',
    themeColor: '',
    checkModalConfirm: () => {
        collectorEventBus.$emit(checkModalState.confirmEventName);
    },
});

const updateModalState = reactive({
    visible: false,
    loading: false,
    versions: [],
    plugin: {},
});

const scheduleState = reactive({
    items: [],
    selectIndex: [],
    totalCount: 0,
    collector: null,
    loading: true,
    editLoading: true,
    editVisible: false,
    deleteVisible: false,
});

export const collectorSetup = (props, context) => {
    class ACHandler extends QuerySearchTableACHandler {
        get valuesFetchUrl(): string { return '/inventory/collector/list'; }

        get valuesFetchKeys(): string[] { return ['collector_id', 'name']; }

        constructor(args: QSTableACHandlerArgs) {
            super(args);
            this.handlerMap.value = [
                ...makeValuesFetchHandler(
                    context.parent,
                    '/inventory/collector/list',
                    ['collector_id', 'name'],
                ),
                getEnumValues('state', ['ENABLED', 'DISABLED']),
                getEnumValues('plugin_info.options.supported_resource_type', ['SERVER', 'NETWORK', 'SUBNET', 'IP_ADDRESS']),
            ];
        }
    }
    const apiHandler = new QuerySearchTableFluentAPI(
        fluentApi.inventory().collector().list(),
        {
            selectable: true,
            sortable: true,
            dragable: true,
            hover: true,
            responsive: true,
            'setting-visible': false,
            'use-cursor-loading': true,
            'excel-visible': true,
            fields: computed(() => makeTrItems([
                ['name', 'COMMON.NAME'],
                ['state', 'COMMON.STATE'],
                ['priority', 'COMMON.PRIORITY'],
                ['plugin_info', 'COMMON.RESOURCE'],
                ['last_collected_at', 'COMMON.LAST_COL'],
                ['created_at', 'COMMON.CREATED'],
            ],
            context.parent)),
        },
        undefined,
        {
            handlerClass: ACHandler,
            args: {
                keys: ['collector_id', 'name', 'state', 'priority', 'plugin_info.options.supported_resource_type'],
                suggestKeys: ['collector_id', 'name'],
            },
        },
    );
    const dropdown = computed(() => (
        makeTrItems([
            ['update', 'BTN.UPDATE', { disabled: apiHandler.tableTS.selectState.isSelectOne }],
            [null, null, { type: 'divider' }],
            ['enable', 'BTN.ENABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
            ['disable', 'BTN.DISABLE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
            ['delete', 'BTN.DELETE', { disabled: apiHandler.tableTS.selectState.isNotSelected }],
            [null, null, { type: 'divider' }],
            ['collectData', 'BTN.COLLECT_DATA', { disabled: apiHandler.tableTS.selectState.isSelectOne }],
        ],
        context.parent,
        { type: 'item' })));

    const multiFields = computed(() => makeTrItems([
        ['name', 'COMMON.NAME'],
        ['state', 'COMMON.STATE'],
        ['priority', 'COMMON.PRIORITY'],
    ], context.parent));


    const state = reactive({
        tabState: setTabData(props, context),
        checkModalState,
        updateModalState,
        scheduleState,
        dropdown,
        multiFields,
        collectDataModalVisible: false,
    });

    const onClickUpdate = () => {
        state.updateModalState.visible = true;
    };
    const onClickEnable = () => {
        state.checkModalState.mode = 'enable';
        state.checkModalState.confirmEventName = 'enableCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Enable Collector';
        state.checkModalState.subTitle = 'Are you sure you want to ENABLE Selected Collector(s)?';
        state.checkModalState.themeColor = 'primary';
        state.checkModalState.visible = true;
    };
    const onClickDisable = () => {
        state.checkModalState.mode = 'disable';
        state.checkModalState.confirmEventName = 'disableCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Disable Collector';
        state.checkModalState.subTitle = 'Are you sure you want to DISABLE Selected Collector(s)?';
        state.checkModalState.themeColor = 'primary';
        state.checkModalState.visible = true;
    };
    const onClickDelete = () => {
        state.checkModalState.mode = 'delete';
        state.checkModalState.confirmEventName = 'deleteCollectors';
        /**
             * TODO: translation
             */
        state.checkModalState.title = 'Delete Collector';
        state.checkModalState.subTitle = 'Are you sure you want to DELETE Selected Collector(s)?';
        state.checkModalState.themeColor = 'alert';
        state.checkModalState.visible = true;
    };


    return {
        ...toRefs(state),
        ACHandler,
        apiHandler,
        timestampFormatter,
        collectorStateFormatter,
        getIcon: data => _.get(data, 'item.tags.icon', ''),
        onClickUpdate,
        onClickEnable,
        onClickDisable,
        onClickDelete,
    };
};

export default {
    name: 'Collector',
    components: {
        GeneralPageLayout,
        PStatus,
        PLazyImg,
        PHorizontalLayout,
        PToolboxTable,
        PDataTable,
        PIconTextButton,
        PTag,
        PRow,
        PCol,
        PHr,
        PIconButton,
        PDropdownMenuBtn,
        PTab,
        PQuerySearchBar,
        CollectorUpdateModal,
        PTableCheckModal,
        CollectDataModal,
        CollectorDetail,
        CollectorCredentials,
        CollectorSchedules,
        STagsPanel,
    },
    setup(props, context) {
        return collectorSetup(props, context);
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

    .name {
        .icon {
            margin-right: 0.5rem;
        }
    }

    ul {
        list-style-type: disc;
    }
    li {
        display: list-item;
    }
</style>
