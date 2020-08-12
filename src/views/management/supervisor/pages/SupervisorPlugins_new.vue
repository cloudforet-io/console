<template>
    <general-page-layout>
        <p-page-title title="Installed Plugins" />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-query-search-table
                    :fields="fields"
                    :items="items"
                    :key-items="keyItems"
                    :total-count="totalCount"
                    @select="onSelect"
                    @change="onChange"
                >
                    <template #col-managed-format="data">
                        <p-button style-type="primary" :disabled="true" @click="recovery(data.item)">
                            Recovery
                        </p-button>
                    </template>
                </p-query-search-table>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="selectIndex.length === 1" :tabs="singleItemTab.state.tabs"
               :active-tab.sync="singleItemTab.syncState.activeTab"
        >
            <template #detail>
                <div>
                    <p-panel-top>{{ pluginDetails.name }}</p-panel-top>
                    <p-definition-table :fields="pluginDetails.fields" :data="pluginDetails.data"
                                        :skeleton-rows="7" v-on="$listeners"
                    />
                </div>
            </template>
        </p-tab>
        <p-tab v-else-if="selectIndex.length > 1"
               :tabs="multiItemTab.state.tabs"
               :active-tab.sync="multiItemTab.syncState.activeTab"
        >
            <template #data>
                <p-data-table
                    :fields="fields"
                    :items="selectedItems"
                    :sortable="false"
                    :selectable="false"
                    :col-copy="true"
                />
            </template>
        </p-tab>
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeTrItems } from '@/lib/view-helper/index';
import { fluentApi } from '@/lib/fluent-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import { showErrorMessage } from '@/lib/util';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PQuerySearchTable from '@/components/organisms/tables/query-search-table/PQuerySearchTable.vue';
import PDefinitionTable from '@/components/organisms/tables/definition-table/PDefinitionTable.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { SupervisorPluginModel } from '@/lib/fluent-api/plugin/supervisorPlugin';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import { Options } from '@/components/organisms/tables/query-search-table/type';

export default {
    name: 'Supervisor',
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
    setup(props, context) {
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;

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
            sortBy: 'plugin_id',
            totalCount: 0,
            selectIndex: [],
            selectedItems: [],
            keyItems: [
                { name: 'plugin_id', label: 'Collector ID' },
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'version', label: 'Version' },
            ],
        });

        const listPlugins = async () => {
            try {
                const resp = await fluentApi.plugin().supervisorPlugin().list().execute();
                state.totalCount = resp.data.total_count || 0;
                state.items = resp.data.results;
            } catch (e) {
                state.items = [];
                console.error(e);
            }
        };

        const onChange = async (options: Options) => {
            try {
                await listPlugins();
                state.selectIndex = [];
            } catch (e) {
                console.error(e);
            }
        };

        // const onChange = async (options: Options, changedOptions: Partial<Options>) => {
        //     if (changedOptions.pageSize !== undefined) fluentApi.plugin().supervisorPlugin().list().setPageSize(changedOptions.pageSize);
        //     if (changedOptions.thisPage !== undefined) fluentApi.plugin().supervisorPlugin().list().setThisPage(changedOptions.thisPage);
        //     //TODO: pageSize, thisPage, refresh와 같은 액션이 필요한 경우 위와 같이 구현
        // }

        const pluginDetails = reactive({
            name: 'Base Information',
            isLoading: true,
            fields: computed(() => [
                { label: 'Plugin ID', name: 'plugin_id' },
                { label: 'Version', name: 'version' },
                { label: 'State', name: 'state' },
                { label: 'Endpoints', name: 'endpoints' },
                { label: 'Supervisor', name: 'supervisor_name' },
                { label: 'Supervisor ID', name: 'supervisor_id' },
                { label: 'Managed', name: 'managed' },
            ]),
            data: {},
        });
        const getPluginDetailData = async (index) => {
            pluginDetails.data = state.items[index];
        };

        const onSelect = (index) => {
            state.selectIndex = index;
            getPluginDetailData(index);
        };

        const selectedItems = computed(() => {
            const items = [] as SupervisorPluginModel[];
            state.selectIndex.forEach((idx) => {
                items.push(state.items[idx]);
            });
            return items;
        });

        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['detail', 'COMMON.DETAILS', { keepAlive: true }],
                ],
                context.parent)),
            },
            {
                activeTab: 'detail',
            },
        );
        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA'],
                ]),
            }, {
                activeTab: 'data',
            },
        );

        const btnDisabled = computed(() => {
            if (state.selectIndex.length > 0 && state.items.every(item => item.managed === true)) {
                return true;
            }
            return false;
        });

        const recovery = async (item) => {
            try {
                await fluentApi.plugin().supervisorPlugin().recovery().setSubIds([
                    // eslint-disable-next-line camelcase
                    { plugin_id: item.plugin_id, version: item.version },
                ])
                    .setId(item.supervisor_id)
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'success',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to recover plugin', e, context.root);
            }
        };

        /** init
         */
        listPlugins();

        return {
            ...toRefs(state),
            listPlugins,
            onSelect,
            selectedItems,
            onChange,
            pluginDetails,
            getPluginDetailData,
            btnDisabled,
            recovery,
            singleItemTab,
            multiItemTab,
        };
    },
};
</script>
