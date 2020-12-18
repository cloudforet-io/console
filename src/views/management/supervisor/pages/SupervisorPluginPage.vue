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
                    :this-page.sync="thisPage"
                    :page-size.sync="pageSize"
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
                    />
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
                />
            </template>
        </p-tab>
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, ComponentRenderProxy,
} from '@vue/composition-api';

import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { TabItem } from '@/components/organisms/tabs/tab/type';
import { KeyItemSet } from '@/components/organisms/search/query-search/type';

import { SupervisorPluginModel } from '@/views/management/supervisor/type';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@/lib/component-utils/query-search';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { QueryHelper } from '@/lib/query';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getPageStart } from '@/lib/component-utils/pagination';

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
                title: 'Filters',
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
            fields: [
                { label: 'Plugin ID', name: 'plugin_id' },
                { label: 'Version', name: 'version' },
                { label: 'Supervisor Name', name: 'supervisor_name' },
                { label: 'Supervisor ID', name: 'supervisor_id' },
                { label: 'State', name: 'state' },
                { label: 'Recovery', name: 'managed' },
            ],
            items: [] as SupervisorPluginModel[],
            sortBy: '',
            sortDesc: true,
            pageSize: 15,
            thisPage: 1,
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
                .setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize)
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
        const onChange = async (item) => {
            try {
                state.tags = item.queryTags;
                await queryHelper.setFiltersAsQueryTag(item.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);

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
        };
    },
};
</script>
