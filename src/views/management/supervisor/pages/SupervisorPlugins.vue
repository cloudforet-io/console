<template>
    <general-page-layout>
        <p-page-title title="Plugins"
                      use-total-count
                      :total-count="apiHandler.totalCount.value"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-toolbox-table v-bind="apiHandler.tableTS.state"
                                 :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
                                 :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
                                 :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
                                 :loading.sync="apiHandler.tableTS.syncState.loading"
                                 :this-page.sync="apiHandler.tableTS.syncState.thisPage"
                                 :page-size.sync="apiHandler.tableTS.syncState.pageSize"
                                 :responsive-style="{overflow: 'auto', height: `${height}px`}"
                                 @changePageSize="apiHandler.getData"
                                 @changePageNumber="apiHandler.getData"
                                 @clickRefresh="apiHandler.getData"
                                 @changeSort="apiHandler.getData"
                >
                    <template #toolbox-left>
                        <p-query-search v-model="apiHandler.tableTS.querySearch.syncState.value"
                                        class="w-full"
                                        v-bind="apiHandler.tableTS.querySearch.state"
                                        :value-handler-map="apiHandler.tableTS.querySearch.valueHandlerMap"
                                        @search="apiHandler.tableTS.querySearch.onSearch"
                        />
                    </template>
                    <template #col-managed-format="data">
                        <p-button style-type="primary" :disabled="!data.item.managed" @click="recovery(data.item)">
                            Recovery
                        </p-button>
                    </template>
                </p-toolbox-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne"
               :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <p-panel-top>{{ pluginDetails.name }}</p-panel-top>
                <p-definition-table :items="pluginDetails.defs" />
                <p-dict-panel :dict.sync="apiHandler.tableTS.selectState.firstSelectItem.tags" />
            </template>
            <template #rawData>
                <p-raw-data class="my-8 mx-4" :item="apiHandler.tableTS.selectState.firstSelectItem" />
            </template>
        </p-tab>
        <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
               :tabs="multiItemTab.state.tabs"
               :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <p-data-table :items="apiHandler.tableTS.selectState.selectItems"
                              :fields="apiHandler.tableTS.state.multiFields"
                              col-copy
                />
            </template>
        </p-tab>
    </general-page-layout>
</template>

<script lang="ts">
import { computed, reactive } from '@vue/composition-api';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';


import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { makeTrItems } from '@/lib/view-helper/index';
import PRawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import { fluentApi } from '@/lib/fluent-api';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDictPanel from '@/views/common/tags/dict-panel/PDictPanel_deprecated.vue';
import { showErrorMessage } from '@/lib/util';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import { makeDefItems } from '@/components/organisms/tables/definition-table/PDefinitionTable.toolset';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds, queryStringToNumberArray,
    queryStringToQueryTags,
    queryTagsToQueryString, selectIndexAutoReplacer,
} from '@/lib/router-query-string';
import { makeKeyItems, makeValueHandlerMapWithReference } from '@/lib/component-utils/query-search';

export default {
    name: 'Supervisor',
    components: {
        PQuerySearch,
        PDataTable,
        PDefinitionTable,
        PPanelTop,
        PToolboxTable,
        PHorizontalLayout,
        PTab,
        PButton,
        PRawData,
        GeneralPageLayout,
        PDictPanel,
        PPageTitle,
    },
    props: {
        queryString: {
            type: String,
            default: '',
        },
    },
    setup(props, context) {
        const singleItemTab = new TabBarState({
            tabs: makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['rawData', 'TAB.RAW_DATA'],
            ]),
        });
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new TabBarState({
            tabs: makeTrItems([
                ['data', 'TAB.SELECTED_DATA'],
            ]),
        });
        multiItemTab.syncState.activeTab = 'data';
        const pluginKeyAutoCompletes = ['plugin_id', 'version', 'endpoint'];

        const pluginList = fluentApi.plugin().supervisorPlugin().list();

        const apiHandler = new QuerySearchTableFluentAPI(
            pluginList,
            {
                selectable: true,
                fields: [
                    { label: 'plugin_id', name: 'plugin_id', type: 'item' },
                    { label: 'version', name: 'version', type: 'item' },
                    { label: 'endpoint', name: 'endpoint', type: 'item' },
                    { label: 'supervisor', name: 'supervisor_name', type: 'item' },
                    { label: 'supervisor_id', name: 'supervisor_id', type: 'item' },
                    { label: 'recovery', name: 'managed', type: 'item' },
                ],
                multiFields: [
                    { label: 'plugin_id', name: 'plugin_id', type: 'item' },
                    { label: 'version', name: 'version', type: 'item' },
                    { label: 'endpoint', name: 'endpoint', type: 'item' },
                    { label: 'supervisor', name: 'supervisor_name', type: 'item' },
                    { label: 'supervisor_id', name: 'supervisor_id', type: 'item' },
                ],
            },

            undefined,
            {
                keyItems: makeKeyItems(pluginKeyAutoCompletes),
                valueHandlerMap: makeValueHandlerMapWithReference(
                    pluginKeyAutoCompletes, 'plugin.Supervisor',
                ),
            },
        );


        const pluginDetails = reactive({
            name: 'Base Information',
            defs: computed(() => makeDefItems([
                { label: 'plugin_id', name: 'plugin_id', type: 'item' },
                { label: 'version', name: 'version', type: 'item' },
                { label: 'endpoint', name: 'endpoint', type: 'item' },
                { label: 'supervisor', name: 'supervisor_name', type: 'item' },
                { label: 'supervisor_id', name: 'supervisor_id', type: 'item' },
                { label: 'recovery', name: 'managed', type: 'item' },
            ], apiHandler.tableTS.selectState.firstSelectItem)),
        });
        const btnDisabled = computed(() => {
            if (!apiHandler.tableTS.selectState.isNotSelected
                && apiHandler.tableTS.selectState.selectItems.every(item => item.managed === true)) {
                return true;
            }
            return false;
        });
        const recovery = (item) => {
            fluentApi.plugin().supervisorPlugin().recovery().setSubIds([
                // eslint-disable-next-line camelcase
                { plugin_id: item.plugin_id, version: item.version },
            ])
                .setId(item.supervisor_id)
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'success',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    showErrorMessage('Fail to recover plugin', e, context.root);
                })
                .finally(() => {
                    apiHandler.getData();
                });
        };


        /** Query String */
        const queryRefs = {
            f: makeQueryStringComputed(apiHandler.tableTS.querySearch.tags,
                {
                    key: 'f',
                    setter: queryStringToQueryTags,
                    getter: queryTagsToQueryString,
                }),
            ...makeQueryStringComputeds(apiHandler.tableTS.syncState, {
                pageSize: { key: 'ps', setter: Number },
                thisPage: { key: 'p', setter: Number },
                sortBy: { key: 'sb' },
                sortDesc: { key: 'sd', setter: Boolean },
                selectIndex: {
                    key: 'sl',
                    setter: queryStringToNumberArray,
                    autoReplacer: selectIndexAutoReplacer,
                },
            }),
            ...makeQueryStringComputeds(multiItemTab.syncState, {
                activeTab: { key: 'mt' },
            }),
            ...makeQueryStringComputeds(singleItemTab.syncState, {
                activeTab: { key: 'st' },
            }),
        };

        apiHandler.getData();
        return {
            apiHandler,
            pluginDetails,
            singleItemTab,
            multiItemTab,
            btnDisabled,
            recovery,
        };
    },
};
</script>
