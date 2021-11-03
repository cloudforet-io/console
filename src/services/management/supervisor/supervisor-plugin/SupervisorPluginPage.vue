<template>
    <general-page-layout>
        <p-page-title
            :title="$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.TITLE')"
            use-total-count use-selected-count
            :total-count="totalCount"
            :selected-count="selectIndex.length"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table
                    :fields="fields"
                    :items="items"
                    :sort-by.sync="sortBy"
                    :sort-desc.sync="sortDesc"
                    :page-size.sync="pageLimit"
                    :total-count="totalCount"
                    :key-item-sets="keyItemSets"
                    :value-handler-map="valueHandlerMap"
                    :style="{height: `${height}px`}"
                    :query-tags="tags"
                    @select="onSelect"
                    @change="onChange"
                >
                    <template #col-managed-format="data">
                        <p-button style-type="primary" :disabled="true" @click="onClickRecovery(data.item)">
                            {{ $t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.RECOVERY') }}
                        </p-button>
                    </template>
                    <template #col-state-format="{value}">
                        <p-status v-bind="pluginStateFormatter(value)" />
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="selectIndex.length === 1" :tabs="singleItemTab.tabs"
               :active-tab.sync="singleItemTab.activeTab"
        >
            <template #detail>
                <div>
                    <p-panel-top>{{ pluginDetailState.name }}</p-panel-top>
                    <p-definition-table :fields="pluginDetailState.fields" :data="pluginDetailState.data"
                                        :skeleton-rows="7" v-on="$listeners"
                    >
                        <template #data-state="{data}">
                            <p-status v-bind="pluginStateFormatter(data)" />
                        </template>
                        <template #data-endpoints="{data}">
                            <ul>
                                <li v-for="i in data" :key="i">
                                    {{ i }}
                                </li>
                            </ul>
                        </template>
                    </p-definition-table>
                </div>
            </template>
        </p-tab>
        <p-tab v-else-if="selectIndex.length > 1"
               :tabs="multiItemTab.tabs"
               :active-tab.sync="multiItemTab.activeTab"
        >
            <template #data>
                <p-data-table :fields="fields"
                              :items="selectedItems"
                              :sortable="false"
                              :selectable="false"
                              :col-copy="true"
                              class="mt-8"
                >
                    <template #col-state-format="{value}">
                        <p-status v-bind="pluginStateFormatter(value)" />
                    </template>
                    <template #col-endpoints-format="{data}">
                        <ul>
                            <li v-for="i in data" :key="i">
                                {{ i }}
                            </li>
                        </ul>
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else id="empty-space">
            <p-empty>{{ $t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PTab, PDataTable, PPageTitle, PStatus,
    PQuerySearchTable, PDefinitionTable, PPanelTop, PButton, PEmpty,
} from '@spaceone/design-system';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import { SupervisorPluginModel } from '@/services/management/supervisor/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { pluginStateFormatter } from '@/services/identity/user/lib/helper';

enum STATE {
    active = 'ACTIVE',
    inactive = 'INACTIVE',
}

export default {
    name: 'SupervisorPluginPage',
    components: {
        PButton,
        PDataTable,
        GeneralPageLayout,
        PHorizontalLayout,
        PPageTitle,
        PQuerySearchTable,
        PTab,
        PPanelTop,
        PDefinitionTable,
        PStatus,
        PEmpty,
    },
    props: {
        queryString: {
            type: String,
            default: '',
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'plugin_id', label: 'Plugin ID' },
                    // { name: 'name', label: 'Name' },
                    { name: 'state', label: 'State' },
                    { name: 'version', label: 'Version' },
                ],
            }],
            valueHandlerMap: {
                plugin_id: makeDistinctValueHandler('inventory.Collector', 'plugin_info.plugin_id'),
                // name: makeDistinctValueHandler('repository.Plugin'),
                state: makeEnumValueHandler(STATE),
                version: makeDistinctValueHandler('inventory.Collector', 'plugin_info.version'),
            },
        };
        const state = reactive({
            fields: computed(() => [
                { name: 'plugin_id', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_PLUGIN_ID') },
                { name: 'version', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_VERSION') },
                { name: 'supervisor_name', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_SUPERVISOR') },
                { name: 'supervisor_id', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_SUPERVISOR_ID') },
                { name: 'state', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_STATE') },
                { name: 'managed', label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_MANAGED') },
            ]),
            items: [] as SupervisorPluginModel[],
            sortBy: 'plugin_id',
            sortDesc: true,
            pageLimit: 15,
            pageStart: 1,
            totalCount: 0,
            selectIndex: [],
            selectedItems: computed(() => {
                const items = [] as SupervisorPluginModel[];
                state.selectIndex.forEach((idx) => {
                    items.push(state.items[idx]);
                });
                return items;
            }),
            keyItemSets: handlers.keyItemSets as KeyItemSet[],
            valueHandlerMap: handlers.valueHandlerMap,
            tags: queryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
        });
        const pluginDetailState = reactive({
            name: computed(() => vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_TITLE')),
            isLoading: true,
            fields: computed(() => [
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_PLUGIN_ID'), name: 'plugin_id' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_VERSION'), name: 'version' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_STATE'), name: 'state' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_ENDPOINT'), name: 'endpoints' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_SUPERVISOR'), name: 'supervisor_name' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_SUPERVISOR_ID'), name: 'supervisor_id' },
                { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.DETAILS_BASE_LABEL_MANAGED'), name: 'managed' },
            ]),
            data: {},
        });
        const tabState = reactive({
            singleItemTab: {
                tabs: computed<TabItem[]>(() => [
                    { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.TAB_DETAILS'), name: 'detail', keepAlive: true },
                ]),
                activeTab: 'detail',
            },
            multiItemTab: {
                tabs: computed<TabItem[]>(() => [
                    { label: vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.TAB_SELECTED_DATA'), name: 'data', keepAlive: true },
                ]),
                activeTab: 'data',
            },
        });

        /* apis */
        const getQuery = () => {
            const apiQuery = new ApiQueryHelper();
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart, state.pageLimit)
                .setFilters(queryHelper.filters);
            return apiQuery.data;
        };
        const listPlugins = async () => {
            try {
                const res = await SpaceConnector.client.plugin.supervisor.plugin.list({
                    query: getQuery(),
                });
                state.totalCount = res.total_count || 0;
                state.items = res.results;
            } catch (e) {
                state.items = [];
                console.error(e);
            }
        };
        const getPluginDetailData = async (index) => {
            pluginDetailState.data = state.items[index];
        };

        /* events */
        const onSelect = (index) => {
            state.selectIndex = index;
            getPluginDetailData(index);
        };
        const onChange = async (options) => {
            try {
                if (options.sortBy !== undefined) {
                    state.sortBy = options.sortBy;
                    state.sortDesc = options.sortDesc;
                }
                if (options.pageStart !== undefined) state.pageStart = options.pageStart;
                if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
                if (options.queryTags !== undefined) {
                    state.tags = options.queryTags;
                    await queryHelper.setFiltersAsQueryTag(options.queryTags);
                    await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
                }

                await listPlugins();
                state.selectIndex = [];
            } catch (e) {
                console.error(e);
            }
        };
        const onClickRecovery = async (item) => {
            try {
                await SpaceConnector.client.plugin.supervisor.plugin.recover({
                    // eslint-disable-next-line camelcase
                    supervisor_id: item.supervisor_id,
                    plugin_id: item.plugin_id,
                    version: item.version,
                });
                showSuccessMessage(vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.ALT_S_RECOVERY_TITLE'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('MANAGEMENT.SUPERVISOR_PLUGIN.MAIN.ALT_E_RECOVERY_TITLE'), e, vm.$root);
            }
        };

        const init = () => {
            listPlugins();
        };
        init();

        return {
            ...toRefs(state),
            ...toRefs(tabState),
            pluginDetailState,
            listPlugins,
            onSelect,
            onChange,
            onClickRecovery,
            pluginStateFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
#empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}
</style>
