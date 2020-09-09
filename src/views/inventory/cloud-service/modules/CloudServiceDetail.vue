<template>
    <div>
        <p-button-tab :tabs="tabs" :active-tab="activeTab" keep-alive-all
                      @update:activeTab="onChangeTab"
        >
            <template slot="Base Information">
                <cloud-service-base-info :data="data" :loading="loading" />
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
import { find, get, set } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import CloudServiceBaseInfo from '@/views/inventory/cloud-service/modules/CloudServiceBaseInfo.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PButtonTab from '@/components/organisms/tabs/button-tab/PButtonTab.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PRawData from '@/components/organisms/text-editor/raw-data/PRawData.vue';

import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { DynamicFieldHandler } from '@/components/organisms/dynamic-field/type';
import { DynamicLayoutEventListeners } from '@/components/organisms/dynamic-layout/type';

import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { SearchSchema } from '@/lib/component-utils/query-search/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { getFiltersFromQueryTags } from '@/lib/api/query-search';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import config from '@/lib/config';
import { store } from '@/store';

export default {
    name: 'CloudServiceDetail',
    components: {
        CloudServiceBaseInfo,
        PDynamicLayout,
        PRawData,
        PPanelTop,
        PButtonTab,
    },
    props: {
        cloudServiceId: {
            type: String,
            required: true,
        },
        provider: {
            type: String,
            required: true,
        },
        cloudServiceGroup: {
            type: String,
            required: true,
        },
        cloudServiceType: {
            type: String,
            required: true,
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
            let layouts = layoutSchemaCacheMap[props.cloudServiceId];
            let searches = searchSchemaCacheMap[props.cloudServiceId];

            if (!layouts || !searches) {
                try {
                    const res = await SpaceConnector.client.inventory.cloudService.get({
                        // eslint-disable-next-line camelcase
                        cloud_service_id: props.cloudServiceId,
                        query: schemaQuery.data,
                    });
                    layouts = get(res, 'metadata.view.sub_data.layouts', null);
                    searches = get(res, 'metadata.view.search', null);
                } catch (e) {
                    console.error(e);
                }

                layoutSchemaCacheMap[props.cloudServiceId] = layouts;
                searchSchemaCacheMap[props.cloudServiceId] = searches;

                state.layouts = layouts || [];
                state.searches = searches || [];
            }
        };
        //
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
            const params: any = { cloud_service_id: props.cloudServiceId };
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
                return SpaceConnector.client.inventory.cloudService.getData(getParams());
            }
            return SpaceConnector.client.inventory.cloudService.get(getParams());
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

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const getLayoutListeners = (layout: DynamicLayout): Partial<DynamicLayoutEventListeners> => ({
            init(options) {
                if (fetchOptionsMap[layout.name]) fetchOptionsMap[layout.name] = options;
                if (searchSchemaCacheMap[props.cloudServiceId]) {
                    const { keyItems, valueHandlerMap } = makeQuerySearchPropsWithSearchSchema(
                        searchSchemaCacheMap[props.cloudServiceId],
                        'inventory.CloudService',
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
                            url: '/inventory/cloud-service/get-data',
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
        const fieldHandler: DynamicFieldHandler = (item) => {
            if (item.extraData?.reference) {
                return {
                    options: {
                        ...item.options,
                        link: referenceRouter(
                            item.extraData.reference.resource_type,
                            item.extraData.reference.reference_key,
                        ),
                    },
                };
            }
            return {};
        };

        const onChangeTab = async (tab) => {
            state.activeTab = tab;
            await getData();
        };

        watch(() => props.cloudServiceId, async (after, before) => {
            if (after && after !== before) {
                await getSchema();
                await getData();
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            onChangeTab,
            getLayoutListeners,
            fetchOptionsMap,
            fieldHandler,
        };
    },
};
</script>

<style scoped>

</style>
