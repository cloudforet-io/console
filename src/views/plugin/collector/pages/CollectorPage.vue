<template>
    <general-page-layout class="collector-page">
        <div class="page-navigation">
            <p-page-navigation :routes="routes" />
        </div>
        <p-page-title :title="$t('PLUGIN.COLLECTOR.MAIN.TITLE')"
                      use-total-count
                      :total-count="totalCount"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table :fields="fields"
                                      :items="items"
                                      :key-item-sets="querySearchHandlers.keyItemSets"
                                      :value-handler-map="querySearchHandlers.valueHandlerMap"
                                      :loading="loading"
                                      :total-count="totalCount"
                                      :query-tags="searchTags"
                                      :sort-by.sync="sortBy"
                                      :sort-desc.sync="sortDesc"
                                      :this-page.sync="thisPage"
                                      :page-size.sync="pageSize"
                                      :style="{height: `${height}px`}"
                                      @select="onSelect"
                                      @change="onChange"
                                      @export="exportCollectorDataToExcel"
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="$router.push({path: '/plugin/collector/create/plugins'})"
                        >
                            {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn class="left-toolbox-item"
                                             :menu="dropdown"
                                             @click-update="onClickUpdate"
                                             @click-enable="onClickEnable"
                                             @click-disable="onClickDisable"
                                             @click-delete="onClickDelete"
                                             @click-collectData="onClickCollectData"
                        >
                            {{ $t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                    <template #col-plugin_info.plugin_id-format="{index, field, item}">
                        <p-lazy-img :src="item.plugin_icon"
                                    width="1.5rem" height="1.5rem" class="mr-2"
                        />
                        {{ item.plugin_name }}
                    </template>
                    <template #col-state-format="data">
                        <p-status :text="data.value" :theme="data.value === 'DISABLED' ? 'red' : 'green'" />
                    </template>
                    <template #col-collector_history-format="{index, field, item}">
                        <router-link :to="item.detailLink">
                            <span class="view-detail">{{ $t('PLUGIN.COLLECTOR.MAIN.VIEW_DETAIL') }}
                                <p-i name="ic_arrow_right" width="1rem" color="inherit transparent" />
                            </span>
                        </router-link>
                    </template>
                    <template #col-last_collected_at-format="{ value }">
                        {{ value ? timestampFormatter(value,timezone) : '' }}
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="selectedItems.length === 1"
               :tabs="singleTabState.tabs"
               :active-tab.sync="singleTabState.activeTab"
        >
            <template #details>
                <collector-details :collector-id="selectedItems[0].collector_id" />
            </template>
            <template #tag>
                <tags-panel :resource-id="selectedItems[0].collector_id"
                            resource-type="inventory.Collector"
                            resource-key="collector_id"
                            tag-page-name="collectorTags"
                />
            </template>
            <template #credentials>
                <collector-credentials :collector-id="selectedItems[0].collector_id" :provider="selectedItems[0].plugin_info.provider" />
            </template>
            <template #schedules>
                <collector-schedules :collector-id="selectedItems[0].collector_id" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedItems.length > 1"
               :tabs="multiTabState.tabs" :active-tab.sync="multiTabState.activeTab"
        >
            <template #data>
                <div>
                    <p-panel-top use-total-count :total-count="selectedItems.length">
                        {{ $t('PLUGIN.COLLECTOR.MAIN.TAB_DATA') }}
                    </p-panel-top>
                    <p-data-table
                        :fields="selectedDataFields"
                        :items="selectedItems"
                        :sortable="false"
                        :selectable="false"
                        :col-copy="true"
                    >
                        <template #col-state-format="data">
                            <p-status :text="data.value" :theme="data.value" />
                        </template>
                    </p-data-table>
                </div>
            </template>
        </p-tab>

        <collector-update-modal :visible.sync="updateModalVisible"
                                :collector-id="selectedItems[0] ? selectedItems[0].collector_id : undefined"
        />

        <collect-data-modal v-if="collectDataModalVisible"
                            :visible.sync="collectDataModalVisible"
                            :collector-id="selectedItems[0].collector_id"
        />

        <p-table-check-modal v-if="checkModalState.visible"
                             :visible.sync="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="checkModalState.tableCheckFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="selectedItems"
                             @confirm="checkModalConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { Component } from 'vue/types/umd';
import { TranslateResult } from 'vue-i18n';
import { Location } from 'vue-router';

import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PStatus from '@/components/molecules/status/PStatus.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PI from '@/components/atoms/icons/PI.vue';
import { CollectorModel } from '@/views/plugin/collector/type';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { TabItem } from '@/components/organisms/tabs/tab/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import {
    showErrorMessage, showSuccessMessage, timestampFormatter,
} from '@/lib/util';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { getPageStart } from '@/lib/component-utils/pagination';
import { replaceUrlQuery } from '@/lib/router-query-string';
import config from '@/lib/config';
import { store } from '@/store';
import { QueryHelper } from '@/lib/query';

const GeneralPageLayout = (): Component => import('@/views/common/components/page-layout/GeneralPageLayout.vue') as Component;
const TagsPanel = (): Component => import('@/views/common/components/tags/TagsPanel.vue') as Component;
const CollectorUpdateModal = (): Component => import('@/views/plugin/collector/modules/CollectorUpdateModal.vue') as Component;
const CollectDataModal = (): Component => import('@/views/plugin/collector/modules/CollectDataModal.vue') as Component;
const CollectorDetails = (): Component => import('@/views/plugin/collector/modules/CollectorDetails.vue') as Component;
const CollectorCredentials = (): Component => import('@/views/plugin/collector/modules/CollectorCredentials.vue') as Component;
const CollectorSchedules = (): Component => import('@/views/plugin/collector/modules/CollectorSchedules.vue') as Component;

export default {
    name: 'CollectorPage',
    components: {
        PI,
        PPageTitle,
        PLazyImg,
        PHorizontalLayout,
        PIconTextButton,
        PDropdownMenuBtn,
        PDataTable,
        PPanelTop,
        PQuerySearchTable,
        PStatus,
        PTab,
        PTableCheckModal,
        PPageNavigation,
        GeneralPageLayout,
        CollectorUpdateModal,
        CollectDataModal,
        CollectorDetails,
        CollectorCredentials,
        CollectorSchedules,
        TagsPanel,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            plugins: computed(() => store.state.resource.plugin.items),
            fields: computed(() => [
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'priority', label: 'Priority' },
                { name: 'plugin_info.plugin_id', label: 'Plugin' },
                { name: 'plugin_info.version', label: 'Version' },
                { name: 'collector_history', label: 'Collector History' },
                { name: 'last_collected_at', label: 'Last Collected' },
            ]),
            excelFields: [
                { key: 'name', name: 'Name' },
                { key: 'state', name: 'State' },
                { key: 'priority', name: 'Priority' },
                {
                    key: 'last_collected_at',
                    name: 'Last Collected',
                    type: 'datetime',
                    options: {
                        source_type: 'timestamp',
                        source_format: 'seconds',
                    },
                },
                {
                    key: 'created_at',
                    name: 'Created',
                    type: 'datetime',
                    options: {
                        source_type: 'timestamp',
                        source_format: 'seconds',
                    },
                },
            ],
            items: [] as CollectorModel[],
            totalCount: 0,
            // selected
            selectedIndexes: [],
            selectedItems: computed(() => {
                const items = [] as CollectorModel[];
                state.selectedIndexes.map(d => items.push(state.items[d]));
                return items;
            }),
            selectedDataFields: [
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'priority', label: 'Priority' },
            ],
            // query
            querySearchHandlers: makeQuerySearchPropsWithSearchSchema([{
                title: 'Filters',
                items: [
                    { key: 'collector_id', name: 'Collector Id' },
                    { key: 'name', name: 'Name' },
                    { key: 'state', name: 'State' },
                    { key: 'plugin_info.plugin_id', name: 'Plugin' },
                    { key: 'plugin_info.version', name: 'Version' },
                    { key: 'provider', name: 'Provider' },
                    { key: 'supported_resource_type', name: 'Resource Type' },
                    { key: 'created_at', name: 'Created' },
                    { key: 'last_collected_at', name: 'Last Collected' },
                ],
            }], 'inventory.Collector'),
            loading: false,
            searchTags: [],
            pageSize: 15,
            thisPage: 1,
            sortBy: null,
            sortDesc: true,
            // dropdown action
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'update', label: vm.$t('PLUGIN.COLLECTOR.MAIN.UPDATE'), type: 'item', disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0,
                }, {
                    type: 'divider',
                }, {
                    name: 'enable', label: vm.$t('PLUGIN.COLLECTOR.MAIN.ENABLE'), type: 'item', disabled: state.selectedIndexes.length === 0,
                }, {
                    name: 'disable', label: vm.$t('PLUGIN.COLLECTOR.MAIN.DISABLE'), type: 'item', disabled: state.selectedIndexes.length === 0,
                }, {
                    name: 'delete', label: vm.$t('PLUGIN.COLLECTOR.MAIN.DELETE'), type: 'item', disabled: state.selectedIndexes.length === 0,
                }, {
                    type: 'divider',
                }, {
                    name: 'collectData', label: vm.$t('PLUGIN.COLLECTOR.MAIN.COLLECT_DATA'), type: 'item', disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0,
                },
            ]),
            updateModalVisible: false,
            collectDataModalVisible: false,
        });
        const routeState = reactive({
            routes: [{ name: vm.$t('MENU.PLUGIN.PLUGIN'), path: '/plugin' }, { name: vm.$t('MENU.PLUGIN.COLLECTOR'), path: '/plugin/collector' }],
        });
        const checkModalState = reactive({
            visible: false,
            mode: '',
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            tableCheckFields: [
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'priority', label: 'Priority' },
            ],
        });

        // Tabs
        const singleTabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_DETAILS'), name: 'details', keepAlive: true },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_TAG'), name: 'tag', keepAlive: true },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_CREDENTIALS'), name: 'credentials', keepAlive: true },
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_SCHEDULE'), name: 'schedules', keepAlive: true },
            ]),
            activeTab: 'details',
        });

        const multiTabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_DATA'), name: 'data', keepAlive: true },
            ]),
            activeTab: 'data',
        });


        // Url query
        const setSearchTags = () => {
            queryHelper.setFiltersAsRawQueryString(vm.$route.query.filters)
                .setKeyItemSets(state.querySearchHandlers.keyItemSets);
            state.searchTags = queryHelper.queryTags;
        };

        // Table
        const apiQuery = new ApiQueryHelper().setOnly(
            'collector_id', 'name', 'priority', 'last_collected_at',
            'provider', 'tags', 'plugin_info', 'state',
        );
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
                .setFilters(queryHelper.filters);
            return apiQuery.data;
        };
        const detailLinkQueryHelper = new QueryHelper();
        const getCollectors = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.list({ query: getQuery() });
                state.items = res.results.map(d => ({
                    plugin_name: computed(() => store.state.resource.plugin.items[d.plugin_info.plugin_id]?.label).value,
                    plugin_icon: store.state.resource.plugin.items[d.plugin_info.plugin_id]?.icon,
                    detailLink: {
                        name: 'collectorHistory',
                        query: { filters: detailLinkQueryHelper.setFilters([{ k: 'collector_id', v: d.collector_id, o: '=' }]).rawQueryStrings },
                    },
                    ...d,
                }));
                state.totalCount = res.total_count || 0;
            } catch (e) {
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        // Action events
        const onSelect = (index) => {
            state.selectedIndexes = index;
        };
        const onChange = async (item) => {
            state.selectedIndexes = [];
            state.searchTags = item.queryTags;

            queryHelper.setFiltersAsQueryTag(item.queryTags);
            await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            try {
                await getCollectors();
            } catch (e) {
                console.error(e);
            }
        };
        const checkModalConfirm = async (): Promise<void> => {
            try {
                if (checkModalState.mode === 'enable') {
                    await SpaceConnector.client.inventory.collector.enable({
                        collectors: state.selectedItems.map(d => d.collector_id),
                    });
                    showSuccessMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_S_ENABLE_TITLE', state.selectedItems.length), '', vm.$root);
                } else if (checkModalState.mode === 'disable') {
                    await SpaceConnector.client.inventory.collector.disable({
                        collectors: state.selectedItems.map(d => d.collector_id),
                    });
                    showSuccessMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_S_DISABLE_TITLE', state.selectedItems.length), '', vm.$root);
                } else if (checkModalState.mode === 'delete') {
                    await SpaceConnector.client.inventory.collector.delete({
                        collectors: state.selectedItems.map(d => d.collector_id),
                    });
                    showSuccessMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_S_DELETE_TITLE', state.selectedItems.length), '', vm.$root);
                }
            } catch (e) {
                console.error(e);
                if (checkModalState.mode === 'enable') showErrorMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_E_ENABLE_TITLE', state.selectedItems.length), e, vm.$root);
                else if (checkModalState.mode === 'disable') showErrorMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_E_DISABLE_TITLE', state.selectedItems.length), e, vm.$root);
                else if (checkModalState.mode === 'delete') showErrorMessage(vm.$tc('PLUGIN.COLLECTOR.MAIN.ALT_E_DELETE_TITLE', state.selectedItems.length), e, vm.$root);
            } finally {
                if (checkModalState.mode === 'delete') state.selectedIndexes = [];
                checkModalState.visible = false;
                await getCollectors();
            }
        };
        const onClickUpdate = (): void => {
            state.updateModalVisible = true;
        };
        const onClickEnable = (): void => {
            checkModalState.mode = 'enable';
            checkModalState.title = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_ENABLE_TITLE', state.selectedItems.length);
            checkModalState.subTitle = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_ENABLE_DESC', state.selectedItems.length);
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDisable = (): void => {
            checkModalState.mode = 'disable';
            checkModalState.title = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_TITLE', state.selectedItems.length);
            checkModalState.subTitle = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_DESC', state.selectedItems.length);
            checkModalState.themeColor = 'primary';
            checkModalState.visible = true;
        };
        const onClickDelete = (): void => {
            checkModalState.mode = 'delete';
            checkModalState.title = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DELETE_TITLE', state.selectedItems.length);
            checkModalState.subTitle = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DELETE_DESC', state.selectedItems.length);
            checkModalState.themeColor = 'alert';
            checkModalState.visible = true;
        };
        const onClickCollectData = (): void => {
            state.collectDataModalVisible = true;
        };

        const exportCollectorDataToExcel = async () => {
            try {
                const res = await SpaceConnector.client.addOns.excel.export({
                    source: {
                        url: '/inventory/collector/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: store.state.user.timezone,
                        },
                        data_source: state.excelFields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
        };

        const init = async () => {
            await store.dispatch('resource/plugin/load');
            await Promise.all([setSearchTags(), getCollectors()]);
        };
        init();

        watch(() => state.updateModalVisible, (val) => {
            if (!val) {
                getCollectors();
            }
        }, {
            immediate: false,
        });

        return {
            ...toRefs(state),
            ...toRefs(routeState),
            multiTabState,
            singleTabState,
            checkModalState,
            onSelect,
            onChange,
            onClickUpdate,
            onClickEnable,
            onClickDisable,
            onClickDelete,
            onClickCollectData,
            checkModalConfirm,
            exportCollectorDataToExcel,
            timestampFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.left-toolbox-item {
    @apply mx-4;
    &:last-child {
        flex-grow: 1;
    }
}

ul {
    list-style-type: disc;
}
li {
    display: list-item;
}

.view-detail {
    @apply text-blue-600;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-right: 0.3825rem;
}
</style>
