<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import type { KeyItemSet, ValueHandlerMap } from '@cloudforet/core-lib/component-util/query-search/type';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHorizontalLayout, PSelectDropdown, PLazyImg, PHeading, PDataTable,
    PTab, PTableCheckModal, PButton, PStatus, PI, PEmpty, PToolboxTable,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import {
    reactive, computed, watch,
} from 'vue';
import type { Component } from 'vue/types/umd';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import type { CollectorModel } from '@/services/asset-inventory/collector/model';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';


const TagsPanel = (): Component => import('@/common/modules/tags/tags-panel/TagsPanel.vue') as Component;
const CollectorUpdateModal = (): Component => import('@/services/asset-inventory/collector/modules-old/CollectorUpdateModal.vue') as Component;
const CollectDataModal = (): Component => import('@/services/asset-inventory/collector/modules-old/CollectDataModal.vue') as Component;
const CollectorDetails = (): Component => import('@/services/asset-inventory/collector/modules-old/CollectorDetails.vue') as Component;
const CollectorServiceAccounts = (): Component => import('@/services/asset-inventory/collector/modules-old/CollectorServiceAccounts.vue') as Component;
const CollectorSchedules = (): Component => import('@/services/asset-inventory/collector/modules-old/CollectorSchedules.vue') as Component;

const store = useStore();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const queryHelper = new QueryHelper();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

const handlerState = reactive({
    keyItemSets: computed<KeyItemSet[]>(() => [{
        title: 'Properties',
        items: [
            { name: 'collector_id', label: 'Collector Id' },
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
            { name: 'plugin_info.version', label: 'Version' },
            { name: 'provider', label: 'Provider', valueSet: storeState.providers },
            { name: 'supported_resource_type', label: 'Resource Type' },
            { name: 'created_at', label: 'Created' },
            { name: 'last_collected_at', label: 'Last Collected' },
        ],
    }]),
    valueHandlerMap: {
        collector_id: makeDistinctValueHandler('inventory.Collector', 'collector_id'),
        name: makeDistinctValueHandler('inventory.Collector', 'name'),
        state: makeDistinctValueHandler('inventory.Collector', 'state'),
        'plugin_info.plugin_id': makeDistinctValueHandler('inventory.Collector', 'plugin_info.plugin_id'),
        'plugin_info.version': makeDistinctValueHandler('inventory.Collector', 'plugin_info.version'),
        provider: makeDistinctValueHandler('inventory.Collector', 'provider'),
        supported_resource_type: makeDistinctValueHandler('inventory.Collector', 'supported_resource_type'),
        created_at: makeDistinctValueHandler('inventory.Collector', 'created_at'),
        last_collected_at: makeDistinctValueHandler('inventory.Collector', 'last_collected_at'),
    } as ValueHandlerMap,
});

const state = reactive({
    hasManagePermission: useManagePermissionState(),
    timezone: computed(() => store.state.user.timezone),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    fields: computed(() => [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
        { name: 'plugin_info.version', label: 'Version' },
        { name: 'collector_history', label: 'Collector History', sortable: false },
        { name: 'last_collected_at', label: 'Last Collected' },
    ]),
    excelFields: [
        { key: 'name', name: 'Name' },
        { key: 'state', name: 'State' },
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
        state.selectedIndexes.map((d) => items.push(state.items[d]));
        return items;
    }),
    selectedDataFields: computed(() => [{ name: 'collector_id', label: 'Collector Id' }, ...state.fields]),
    loading: true,
    searchTags: [],
    pageLimit: 15,
    pageStart: 1,
    sortBy: null,
    // dropdown action
    dropdown: computed<MenuItem[]>(() => [
        {
            name: 'update', label: t('PLUGIN.COLLECTOR.MAIN.UPDATE'), type: 'item', disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0,
        }, {
            type: 'divider',
        }, {
            name: 'enable', label: t('PLUGIN.COLLECTOR.MAIN.ENABLE'), type: 'item', disabled: state.selectedIndexes.length === 0,
        }, {
            name: 'disable', label: t('PLUGIN.COLLECTOR.MAIN.DISABLE'), type: 'item', disabled: state.selectedIndexes.length === 0,
        }, {
            name: 'delete', label: t('PLUGIN.COLLECTOR.MAIN.DELETE'), type: 'item', disabled: state.selectedIndexes.length === 0,
        }, {
            type: 'divider',
        }, {
            name: 'collectData', label: t('PLUGIN.COLLECTOR.MAIN.COLLECT_DATA'), type: 'item', disabled: state.selectedIndexes.length > 1 || state.selectedIndexes.length === 0,
        },
    ]),
    updateModalVisible: false,
    collectDataModalVisible: false,
});
const checkModalState = reactive({
    visible: false,
    mode: '',
    title: '' as string,
    subTitle: '' as string,
    themeColor: undefined as string | undefined,
    tableCheckFields: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
    ],
});

// Tabs
const singleTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        { label: t('PLUGIN.COLLECTOR.MAIN.TAB_DETAILS'), name: 'details', keepAlive: true },
        { label: t('PLUGIN.COLLECTOR.MAIN.TAB_TAG'), name: 'tag', keepAlive: true },
        { label: t('PLUGIN.COLLECTOR.MAIN.TAB_SERVICE_ACCOUNT'), name: 'serviceAccounts', keepAlive: true },
        { label: t('PLUGIN.COLLECTOR.MAIN.TAB_SCHEDULE'), name: 'schedules', keepAlive: true },
        // { label: i18n.t('PLUGIN.COLLECTOR.MAIN.TAB_COLLECTION_RULE'), name: 'collectionRule', keepAlive: true },
    ]),
    activeTab: 'details',
});

const multiTabState = reactive({
    tabs: computed<TabItem[]>(() => [
        { label: t('PLUGIN.COLLECTOR.MAIN.TAB_SELECTED_DATA'), name: 'data', keepAlive: true },
    ]),
    activeTab: 'data',
});

// Url query
const setSearchTags = async () => {
    // TODO: need to implement type assertion
    queryHelper.setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[])
        .setKeyItemSets(handlerState.keyItemSets);
    state.searchTags = queryHelper.queryTags;
};

// Table
const collectorApiQueryHelper = new ApiQueryHelper()
    .setOnly('collector_id', 'name', 'last_collected_at', 'provider', 'tags', 'plugin_info', 'state')
    .setPage(state.pageStart, state.pageLimit)
    .setSort(state.sortBy, true);
const detailLinkQueryHelper = new QueryHelper();
const listCollectors = async () => {
    state.loading = true;
    try {
        collectorApiQueryHelper.setFilters(queryHelper.filters);
        const res = await SpaceConnector.client.inventory.collector.list({ query: collectorApiQueryHelper.data });
        state.items = res.results.map((d) => ({
            plugin_name: state.plugins[d.plugin_info.plugin_id]?.label,
            plugin_icon: state.plugins[d.plugin_info.plugin_id]?.icon,
            detailLink: {
                name: ASSET_INVENTORY_ROUTE.COLLECTOR.DETAIL._NAME,
                param: { id: d.collector_id },
                query: { filters: detailLinkQueryHelper.setFilters([{ k: 'collector_id', v: d.collector_id, o: '=' }]).rawQueryStrings },
            },
            ...d,
        }));
        state.totalCount = res.total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

// Action events
const handleSelect = (index) => {
    state.selectedIndexes = index;
};
const handleChange = async (options) => {
    setApiQueryWithToolboxOptions(collectorApiQueryHelper, options);
    if (options.queryTags !== undefined) {
        state.searchTags = options.queryTags;
        queryHelper.setFiltersAsQueryTag(options.queryTags);
        await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
    }
    await listCollectors();
};
const checkModalConfirm = async (): Promise<void> => {
    try {
        if (checkModalState.mode === 'enable') {
            await SpaceConnector.client.inventory.collector.enable({
                collectors: state.selectedItems.map((d) => d.collector_id),
            });
            showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_ENABLE_TITLE', state.selectedItems.length), '');
        } else if (checkModalState.mode === 'disable') {
            await SpaceConnector.client.inventory.collector.disable({
                collectors: state.selectedItems.map((d) => d.collector_id),
            });
            showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_DISABLE_TITLE', state.selectedItems.length), '');
        } else if (checkModalState.mode === 'delete') {
            await SpaceConnector.client.inventory.collector.delete({
                collectors: state.selectedItems.map((d) => d.collector_id),
            });
            showSuccessMessage(t('PLUGIN.COLLECTOR.MAIN.ALT_S_DELETE_TITLE', state.selectedItems.length), '');
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        if (checkModalState.mode === 'enable') ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_ENABLE_TITLE', state.selectedItems.length));
        else if (checkModalState.mode === 'disable') ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_DISABLE_TITLE', state.selectedItems.length));
        else if (checkModalState.mode === 'delete') ErrorHandler.handleRequestError(e, t('PLUGIN.COLLECTOR.MAIN.ALT_E_DELETE_TITLE', state.selectedItems.length));
    } finally {
        if (checkModalState.mode === 'delete') state.selectedIndexes = [];
        checkModalState.visible = false;
        await listCollectors();
    }
};
const onClickUpdate = (): void => {
    state.updateModalVisible = true;
};
const onClickEnable = (): void => {
    checkModalState.mode = 'enable';
    checkModalState.title = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_ENABLE_TITLE', state.selectedItems.length);
    checkModalState.subTitle = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_ENABLE_DESC', state.selectedItems.length);
    checkModalState.themeColor = 'safe';
    checkModalState.visible = true;
};
const onClickDisable = (): void => {
    checkModalState.mode = 'disable';
    checkModalState.title = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_TITLE', state.selectedItems.length);
    checkModalState.subTitle = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DISABLE_DESC', state.selectedItems.length);
    checkModalState.themeColor = 'alert';
    checkModalState.visible = true;
};
const onClickDelete = (): void => {
    checkModalState.mode = 'delete';
    checkModalState.title = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DELETE_TITLE', state.selectedItems.length);
    checkModalState.subTitle = t('PLUGIN.COLLECTOR.MAIN.CHECK_MODAL_DELETE_DESC', state.selectedItems.length);
    checkModalState.themeColor = 'alert';
    checkModalState.visible = true;
};
const onClickCollectData = (): void => {
    state.collectDataModalVisible = true;
};

const handleSelectDropdown = (name) => {
    switch (name) {
    case 'update': onClickUpdate(); break;
    case 'enable': onClickEnable(); break;
    case 'disable': onClickDisable(); break;
    case 'delete': onClickDelete(); break;
    case 'collectData': onClickCollectData(); break;
    default: break;
    }
};

const exportCollectorDataToExcel = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/inventory/collector/list',
        param: { query: collectorApiQueryHelper.data },
        fields: state.excelFields,
        file_name_prefix: FILE_NAME_PREFIX.collector,
    });
};

const init = async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/plugin/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await Promise.all([setSearchTags(), listCollectors()]);
};
init();

watch(() => state.updateModalVisible, (val) => {
    if (!val) {
        listCollectors();
    }
}, {
    immediate: false,
});

</script>

<template>
    <div class="collector-page">
        <p-heading :title="t('PLUGIN.COLLECTOR.MAIN.TITLE')"
                   use-total-count
                   use-selected-count
                   :selected-count="state.selectedItems.length"
                   :total-count="state.totalCount"
        >
            <template #extra>
                <router-link :to="{name: ASSET_INVENTORY_ROUTE.COLLECTOR.HISTORY._NAME }">
                    <p-button style-type="tertiary">
                        {{ t('MANAGEMENT.COLLECTOR_HISTORY.MAIN.TITLE') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table v-model:sort-by="state.sortBy"
                                 v-model:page-size="state.pageLimit"
                                 search-type="query"
                                 :fields="state.fields"
                                 :items="state.items"
                                 :key-item-sets="handlerState.keyItemSets"
                                 :value-handler-map="handlerState.valueHandlerMap"
                                 :loading="state.loading"
                                 :total-count="state.totalCount"
                                 :query-tags="state.searchTags"
                                 :sort-desc="true"
                                 :style="{height: `${height}px`}"
                                 selectable
                                 sortable
                                 searchable
                                 exportable
                                 @select="handleSelect"
                                 @change="handleChange"
                                 @export="exportCollectorDataToExcel"
                >
                    <template #toolbox-left>
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  :disabled="!state.hasManagePermission"
                                  @click="router.push({ name: ASSET_INVENTORY_ROUTE.COLLECTOR.CREATE._NAME })"
                        >
                            {{ t('PLUGIN.COLLECTOR.MAIN.CREATE') }}
                        </p-button>
                        <p-select-dropdown class="left-toolbox-item"
                                           :items="state.dropdown"
                                           :disabled="!state.hasManagePermission"
                                           @select="handleSelectDropdown"
                        >
                            {{ t('PLUGIN.COLLECTOR.MAIN.ACTION') }}
                        </p-select-dropdown>
                    </template>
                    <template #col-plugin_info.plugin_id-format="{item}">
                        <div class="plugin-info-col">
                            <p-lazy-img :src="item.plugin_icon"
                                        width="1rem"
                                        height="1rem"
                                        class="mr-2"
                            />
                            {{ item.plugin_name }}
                        </div>
                    </template>
                    <template #col-state-format="data">
                        <p-status :text="data.value"
                                  :theme="data.value === 'DISABLED' ? 'red' : 'green'"
                        />
                    </template>
                    <template #col-collector_history-format="{item}">
                        <router-link :to="item.detailLink">
                            <span class="view-detail">{{ t('PLUGIN.COLLECTOR.MAIN.VIEW_DETAIL') }}
                                <p-i name="ic_chevron-right"
                                     width="1rem"
                                     color="inherit transparent"
                                />
                            </span>
                        </router-link>
                    </template>
                    <template #col-last_collected_at-format="{ value }">
                        {{ value ? iso8601Formatter(value,state.timezone) : '' }}
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>

        <p-tab v-if="state.selectedItems.length === 1"
               v-model:active-tab="singleTabState.activeTab"
               :tabs="singleTabState.tabs"
        >
            <template #details>
                <collector-details :collector-id="state.selectedItems[0].collector_id" />
            </template>
            <template #tag>
                <tags-panel :resource-id="state.selectedItems[0].collector_id"
                            resource-type="inventory.Collector"
                            resource-key="collector_id"
                            :disabled="!state.hasManagePermission"
                />
            </template>
            <template #serviceAccounts>
                <collector-service-accounts :collector-id="state.selectedItems[0].collector_id"
                                            :provider="state.selectedItems[0].plugin_info.provider"
                                            :has-manage-permission="state.hasManagePermission"
                />
            </template>
            <template #schedules>
                <collector-schedules :collector="state.selectedItems[0]"
                                     :manage-disabled="!state.hasManagePermission"
                />
            </template>
            <!--            <template #collectionRule>-->
            <!--                <collection-rule />-->
            <!--            </template>-->
        </p-tab>
        <p-tab v-else-if="state.selectedItems.length > 1"
               v-model:active-tab="multiTabState.activeTab"
               :tabs="multiTabState.tabs"
        >
            <template #data>
                <p-data-table :fields="state.selectedDataFields"
                              :items="state.selectedItems"
                              :selectable="false"
                              col-copy
                              class="selected-data-tab"
                >
                    <template #col-plugin_info.plugin_id-format="{item}">
                        <div class="plugin-info-col">
                            <p-lazy-img :src="item.plugin_icon"
                                        width="1.5rem"
                                        height="1.5rem"
                                        class="mr-2"
                            />
                            {{ item.plugin_name }}
                        </div>
                    </template>
                    <template #col-state-format="data">
                        <p-status :text="data.value"
                                  :theme="data.value === 'DISABLED' ? 'red' : 'green'"
                        />
                    </template>
                    <template #col-collector_history-format="{item}">
                        <router-link :to="item.detailLink">
                            <span class="view-detail">{{ t('PLUGIN.COLLECTOR.MAIN.VIEW_DETAIL') }}
                                <p-i name="ic_chevron-right"
                                     width="1rem"
                                     color="inherit transparent"
                                />
                            </span>
                        </router-link>
                    </template>
                    <template #col-last_collected_at-format="{ value }">
                        {{ value ? iso8601Formatter(value, state.timezone) : '' }}
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else
             class="empty-space"
        >
            <p-empty>{{ t('PLUGIN.COLLECTOR.MAIN.NO_SELECTED_COLLECTOR') }}</p-empty>
        </div>

        <collector-update-modal v-model:visible="state.updateModalVisible"
                                :collector-id="state.selectedItems[0] ? state.selectedItems[0].collector_id : undefined"
        />

        <collect-data-modal v-if="state.collectDataModalVisible"
                            v-model:visible="state.collectDataModalVisible"
                            :collector-id="state.selectedItems[0].collector_id"
        />

        <p-table-check-modal v-if="checkModalState.visible"
                             v-model:visible="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="state.selectedDataFields"
                             :items="state.selectedItems"
                             modal-size="lg"
                             @confirm="checkModalConfirm"
        >
            <template #col-plugin_info.plugin_id-format="{item}">
                <div class="plugin-info-col">
                    <p-lazy-img :src="item.plugin_icon"
                                width="1.5rem"
                                height="1.5rem"
                                class="mr-2"
                    />
                    {{ item.plugin_name }}
                </div>
            </template>
            <template #col-state-format="data">
                <p-status :text="data.value"
                          :theme="data.value === 'DISABLED' ? 'red' : 'green'"
                />
            </template>
            <template #col-collector_history-format="{item}">
                <router-link :to="item.detailLink">
                    <span class="view-detail">{{ t('PLUGIN.COLLECTOR.MAIN.VIEW_DETAIL') }}
                        <p-i name="ic_chevron-right"
                             width="1rem"
                             color="inherit transparent"
                        />
                    </span>
                </router-link>
            </template>
            <template #col-last_collected_at-format="{ value }">
                {{ value ? iso8601Formatter(value, state.timezone) : '' }}
            </template>
        </p-table-check-modal>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-horizontal-layout */
:deep(.p-horizontal-layout) {
    .horizontal-contents {
        overflow: unset;
    }
    .p-toolbox-table {
        @apply rounded-lg;
    }
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
    @apply text-blue-700;
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
.plugin-info-col {
    @apply flex items-center;
}
</style>
