<template>
    <general-page-layout class="collector-page">
        <div class="page-navigation">
            <p-breadcrumbs :routes="routes" />
        </div>
        <p-page-title :title="$t('PLUGIN.COLLECTOR.MAIN.TITLE')"
                      use-total-count use-selected-count
                      :selected-count="selectedItems.length"
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
                                      :page-size.sync="pageLimit"
                                      :style="{height: `${height}px`}"
                                      @select="onSelect"
                                      @change="onChange"
                                      @export="exportCollectorDataToExcel"
                >
                    <template #toolbox-left>
                        <router-link :to="{ name: PLUGIN_ROUTE.COLLECTOR.CREATE.PLUGINS._NAME }">
                            <p-icon-text-button style-type="primary-dark"
                                                name="ic_plus_bold"
                            >
                                {{ $t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                            </p-icon-text-button>
                        </router-link>
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
                                    width="1rem" height="1rem" class="mr-2"
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
                        {{ value ? iso8601Formatter(value,timezone) : '' }}
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
                />
            </template>
            <template #credentials>
                <collector-credentials :collector-id="selectedItems[0].collector_id" :provider="selectedItems[0].plugin_info.provider" />
            </template>
            <template #schedules>
                <collector-schedules :collector="selectedItems[0]" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedItems.length > 1"
               :tabs="multiTabState.tabs" :active-tab.sync="multiTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="selectedDataFields"
                              :items="selectedItems"
                              :sortable="false"
                              :selectable="false"
                              col-copy
                              class="selected-data-tab"
                >
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
                        {{ value ? iso8601Formatter(value,timezone) : '' }}
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else class="empty-space">
            <p-empty>{{ $t('PLUGIN.COLLECTOR.MAIN.NO_SELECTED_COLLECTOR') }}</p-empty>
        </div>

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
                             :fields="selectedDataFields"
                             size="lg"
                             centered
                             :selectable="false"
                             :items="selectedItems"
                             @confirm="checkModalConfirm"
        >
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
                {{ value ? iso8601Formatter(value,timezone) : '' }}
            </template>
        </p-table-check-modal>
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { Component } from 'vue/types/umd';
import { TranslateResult } from 'vue-i18n';
import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PDropdownMenuBtn, PLazyImg, PPageTitle, PDataTable, PQuerySearchTable,
    PTab, PTableCheckModal, PIconTextButton, PStatus, PBreadcrumbs, PI, PEmpty,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { CollectorModel } from '@/views/plugin/collector/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import {
    iso8601Formatter,
    showErrorMessage, showLoadingMessage, showSuccessMessage,
} from '@/lib/util';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { store } from '@/store';
import { QueryHelper } from '@/lib/query';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { PLUGIN_ROUTE } from '@/routes/plugin/plugin-route';
import { MANAGEMENT_ROUTE } from '@/routes/management/management-route';

const GeneralPageLayout = (): Component => import('@/common/components/layouts/GeneralPageLayout.vue') as Component;
const TagsPanel = (): Component => import('@/common/modules/tags-panel/TagsPanel.vue') as Component;
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
        PQuerySearchTable,
        PStatus,
        PTab,
        PTableCheckModal,
        PBreadcrumbs,
        PEmpty,
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
                { key: 'plugin_info.plugin_id', name: 'Plugin' },
                { key: 'plugin_info.version', name: 'Version' },
                { key: 'last_collected_at', name: 'Last Collected', type: 'datetime' },
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
            selectedDataFields: computed(() => [{ name: 'collector_id', label: 'Collector Id' }, ...state.fields]),
            // query
            querySearchHandlers: makeQuerySearchPropsWithSearchSchema([{
                title: 'Properties',
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
            loading: true,
            searchTags: [],
            pageLimit: 15,
            pageStart: 1,
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
            routes: computed(() => ([
                { name: vm.$t('MENU.PLUGIN.PLUGIN'), path: '/plugin' },
                { name: vm.$t('MENU.PLUGIN.COLLECTOR') },
            ])),
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
                { label: vm.$t('PLUGIN.COLLECTOR.MAIN.TAB_SELECTED_DATA'), name: 'data', keepAlive: true },
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
                .setPage(state.pageStart, state.pageLimit)
                .setFilters(queryHelper.filters);
            return apiQuery.data;
        };
        const detailLinkQueryHelper = new QueryHelper();
        const getCollectors = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.collector.list({ query: getQuery() });
                state.items = res.results.map(d => ({
                    plugin_name: state.plugins[d.plugin_info.plugin_id]?.label,
                    plugin_icon: state.plugins[d.plugin_info.plugin_id]?.icon,
                    detailLink: {
                        name: MANAGEMENT_ROUTE.HISTORY.COLLECTOR._NAME,
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
        const onChange = async (options) => {
            if (options.sortBy !== undefined) {
                state.sortBy = options.sortBy;
                state.sortDesc = options.sortDesc;
            }
            if (options.pageStart !== undefined) state.pageStart = options.pageStart;
            if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
            if (options.queryTags !== undefined) {
                state.searchTags = options.queryTags;
                queryHelper.setFiltersAsQueryTag(options.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }

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
            checkModalState.themeColor = 'safe';
            checkModalState.visible = true;
        };
        const onClickDisable = (): void => {
            checkModalState.mode = 'disable';
            checkModalState.title = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_TITLE', state.selectedItems.length);
            checkModalState.subTitle = vm.$tc('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_DESC', state.selectedItems.length);
            checkModalState.themeColor = 'alert';
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
                showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
                await store.dispatch('file/downloadExcel', {
                    url: '/inventory/collector/list',
                    param: { query: getQuery() },
                    fields: state.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.collector,
                });
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
            PLUGIN_ROUTE,
            onSelect,
            onChange,
            onClickUpdate,
            onClickEnable,
            onClickDisable,
            onClickDelete,
            onClickCollectData,
            checkModalConfirm,
            exportCollectorDataToExcel,
            iso8601Formatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
>>> .p-horizontal-layout .horizontal-contents {
    overflow: unset;
}
.left-toolbox-item {
    @apply ml-4;
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
.selected-data-tab {
    @apply mt-8;
}

.view-detail {
    @apply text-blue-600;
    font-size: 0.875rem;
    line-height: 1.5;
    margin-right: 0.3825rem;
}
.empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}
</style>
