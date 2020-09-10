<template>
    <div>
        <p-button-tab :tabs="tabs" :active-tab="activeTab" keep-alive-all
                      @update:activeTab="onChangeTab"
        >
            <template slot="Base Information">
                <server-base-info :data="data" :loading="loading" />
            </template>
            <template v-for="(layout, idx) in layouts" :slot="layout.name">
                <p-dynamic-layout :key="idx" v-bind="layout" :data="data"
                                  :fetch-options="fetchOptionsMap[layout.name]"
                                  :type-options="{
                                      loading,
                                      totalCount,
                                      timezone,
                                      selectIndex,
                                      keyItems,
                                      valueHandlerMap,
                                      language,
                                  }"
                                  :field-handler="fieldHandler"
                                  v-on="getLayoutListeners(layout)"
                />
            </template>
            <template slot="Raw Data">
                <div class="raw-data">
                    <p-panel-top title="Raw Data" />
                    <p-raw-data :item="data" />
                </div>
            </template>
        </p-button-tab>
    </div>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    get, set, find,
} from 'lodash';
import baseInfoSchema from '@/views/inventory/server/default-schema/base-info.json';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import ServerBaseInfo from '@/views/inventory/server/modules/ServerBaseInfo.vue';
import PButtonTab from '@/components/organisms/tabs/button-tab/PButtonTab.vue';
import {
    DynamicLayoutEventListeners, DynamicLayoutFieldHandler,
} from '@/components/organisms/dynamic-layout/type';
import { getTimezone } from '@/lib/util';
import PRawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';
import { getFiltersFromQueryTags } from '@/lib/api/query-search';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { SearchSchema } from '@/lib/component-utils/query-search/type';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import config from '@/lib/config';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

export default {
    name: 'PServerDetail',
    components: {
        PPanelTop,
        PRawData,
        PButtonTab,
        ServerBaseInfo,
        PDynamicLayout,
    },
    props: {
        serverId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const layoutSchemaCacheMap = {};
        const searchSchemaCacheMap = {};
        const fetchOptionsMap = {};


        const state = reactive({
            data: {} as any,
            loading: true,
            totalCount: 0,
            timezone: computed(() => getTimezone()),
            selectIndex: [] as number[],
            keyItems: [] as KeyItem[],
            valueHandlerMap: {} as ValueHandlerMap,
            language: computed(() => store.state.user.language),

            // button tab
            tabs: computed<string[]>(() => {
                const res: string[] = [];
                res.push('Base Information');
                if (state.layouts) res.push(...state.layouts.map(d => d.name));
                res.push('Raw Data');
                return res;
            }),
            activeTab: 'Base Information',

            // schema
            layouts: [] as DynamicLayout[],
            currentLayout: computed<undefined|DynamicLayout>(() => find(state.layouts, { name: state.activeTab })),
            searches: [] as SearchSchema[],
        });

        const schemaQuery = new QueryHelper().setOnly('metadata.view.sub_data.layouts', 'metadata.view.search');
        const getSchema = async () => {
            let layouts = layoutSchemaCacheMap[props.serverId];
            let searches = searchSchemaCacheMap[props.serverId];

            if (!layouts || !searches) {
                try {
                    const res = await SpaceConnector.client.inventory.server.get({
                        // eslint-disable-next-line camelcase
                        server_id: props.serverId,
                        query: schemaQuery.data,
                    });

                    layouts = get(res, 'metadata.view.sub_data.layouts', null);
                    searches = get(res, 'metadata.view.search', null);
                } catch (e) {
                    console.error(e);
                }
            }

            layoutSchemaCacheMap[props.serverId] = layouts;
            searchSchemaCacheMap[props.serverId] = searches;

            state.layouts = layouts || [];
            state.searches = searches || [];

            if (!state.tabs.includes(state.activeTab)) state.activeTab = state.tabs[0];
        };

        const getQuery = (): undefined|any => {
            if (!state.currentLayout) return undefined;

            const query = new QueryHelper();

            if (fetchOptionsMap[state.currentLayout.name]) {
                const options = fetchOptionsMap[state.currentLayout.name];
                if (options.sortBy) query.setSort(options.sortBy, options.sortDesc);
                if (options.pageLimit) query.setPageLimit(options.pageLimit);
                if (options.pageStart) query.setPageStart(options.pageStart);
                if (options.searchText) query.setKeyword(options.searchText);
                if (options.queryTags) {
                    const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(options.queryTags);
                    query.setFilter(...andFilters)
                        .setFilterOr(...orFilters)
                        .setKeyword(...keywords);
                }
            }

            if (state.currentLayout.options?.fields) {
                query.setOnly(...state.currentLayout.options.fields.map(d => d.name));
            }

            return query.data;
        };

        const getParams = () => {
            // eslint-disable-next-line camelcase
            const params: any = { server_id: props.serverId };
            const query = getQuery();
            if (query) params.query = query;
            // eslint-disable-next-line camelcase
            const keyPath = state.currentLayout?.options?.root_path;
            // eslint-disable-next-line camelcase
            if (keyPath) params.key_path = keyPath;
            return params;
        };

        const getApi = (): Promise<any> => {
            // eslint-disable-next-line camelcase
            if (state.currentLayout?.options?.root_path) {
                return SpaceConnector.client.inventory.server.getData(getParams());
            }
            return SpaceConnector.client.inventory.server.get(getParams());
        };

        const getData = async () => {
            state.loading = true;

            try {
                const res = await getApi();

                if (res.total_count !== undefined) state.totalCount = res.total_count;

                const data = res.results || res;
                // eslint-disable-next-line camelcase
                const keyPath = state.currentLayout?.options?.root_path;
                if (keyPath) {
                    set(state.data, keyPath, data);
                    if (Array.isArray(state.data)) state.data = [...state.data];
                    else state.data = { ...state.data };
                } else state.data = data;
            } catch (e) {
                state.data = {};
                state.totalCount = 0;
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.serverId, async (after, before) => {
            if (after && after !== before) {
                await getSchema();
                await getData();
            }
        }, { immediate: true });

        const onChangeTab = async (tab) => {
            state.activeTab = tab;
            await getData();
        };

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const getLayoutListeners = (layout: DynamicLayout): Partial<DynamicLayoutEventListeners> => ({
            init(options) {
                if (fetchOptionsMap[layout.name]) fetchOptionsMap[layout.name] = options;
                if (searchSchemaCacheMap[props.serverId]) {
                    const { keyItems, valueHandlerMap } = makeQuerySearchPropsWithSearchSchema(
                        searchSchemaCacheMap[props.serverId],
                        'inventory.Server',
                    );
                    state.keyItems = keyItems;
                    state.valueHandlerMap = valueHandlerMap;
                }
            },
            fetch(options) {
                fetchOptionsMap[layout.name] = options;
                getData();
            },
            select(selectIndex) {
                state.selectIndex = selectIndex;
            },
            async export(options, fields) {
                try {
                    const res = await exportApi({
                        source: {
                            url: '/inventory/server/get-data',
                            param: getParams(),
                        },
                        template: {
                            options: {
                                fileType: 'xlsx',
                                timezone: state.timezone,
                            },
                            // eslint-disable-next-line camelcase
                            data_source: fields,
                        },
                    });
                    window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
                } catch (e) {
                    console.error(e);
                }
            },
        });
        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        return {
            ...toRefs(state),
            baseInfoSchema,
            getLayoutListeners,
            fetchOptionsMap,
            fieldHandler,
            onChangeTab,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .raw-data {
        @apply px-4;
    }
    .p-button-tab {
        @apply mt-8;
    }
</style>
