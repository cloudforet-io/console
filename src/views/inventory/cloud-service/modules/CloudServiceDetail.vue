<template>
    <div>
        <p-button-tab v-if="tabs.length > 0" :tabs="tabs" :active-tab="activeTab"
                      @change="onChangeTab"
        >
            <template v-for="(layout, i) in layouts" :slot="layout.name">
                <p-dynamic-layout :key="`${cloudServiceId}-${layout.name}-${i}`" v-bind="layout" :data="data"
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
                                  v-on="dynamicLayoutListeners"
                />
            </template>
        </p-button-tab>
    </div>
</template>

<script lang="ts">
import { find, get, set } from 'lodash';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PButtonTab from '@/components/organisms/tabs/button-tab/PButtonTab.vue';

import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import { DynamicLayoutEventListeners, DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';

import { getApiActionByLayoutType, makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import config from '@/lib/config';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

export default {
    name: 'CloudServiceDetail',
    components: {
        PDynamicLayout,
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
        const fetchOptionsMap = {};

        const state = reactive({
            data: undefined as any,
            loading: true,
            totalCount: 0,
            timezone: computed(() => getTimezone()),
            selectIndex: [] as number[],
            keyItems: [] as KeyItem[],
            valueHandlerMap: {} as ValueHandlerMap,
            language: computed(() => store.state.user.language),

            // button tab
            tabs: computed<string[]>(() => state.layouts.map(d => d.name)),
            activeTab: '',

            // schema
            layouts: [] as DynamicLayout[],
            layoutMap: computed(() => {
                const res = {};
                state.layouts.forEach((d) => {
                    res[d.name] = d;
                });
                return res;
            }),
            currentLayout: computed<DynamicLayout>(() => state.layoutMap[state.activeTab] || {}),
            fetchOptionKey: computed(() => `${state.currentLayout.name}/${state.currentLayout.type}`),
        });

        const getSchema = async () => {
            let layouts = layoutSchemaCacheMap[props.cloudServiceId];

            if (!layouts) {
                try {
                    const res = await SpaceConnector.client.addOns.pageSchema.get({
                        // eslint-disable-next-line camelcase
                        resource_type: 'inventory.CloudService',
                        schema: 'details',
                        options: {
                            // eslint-disable-next-line camelcase
                            cloud_service_id: props.cloudServiceId,
                        },
                    });

                    layouts = res.details;
                } catch (e) {
                    console.error(e);
                }

                layoutSchemaCacheMap[props.cloudServiceId] = layouts;

                state.layouts = layouts ? [...layouts] : [];

                if (!state.tabs.includes(state.activeTab)) state.activeTab = state.tabs[0];
            }
        };

        const getQuery = (): undefined|any => {
            const query = new QueryHelper();

            if (fetchOptionsMap[state.fetchOptionKey]) {
                const options = fetchOptionsMap[state.fetchOptionKey];
                if (options.sortBy !== undefined) query.setSort(options.sortBy, options.sortDesc);
                if (options.pageLimit !== undefined) query.setPageLimit(options.pageLimit);
                if (options.pageStart !== undefined) query.setPageStart(options.pageStart);
                if (options.searchText !== undefined) query.setKeyword(options.searchText);
                if (options.queryTags !== undefined) {
                    const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(options.queryTags);
                    query.setFilter(...andFilters)
                        .setFilterOr(...orFilters)
                        .setKeyword(...keywords);
                }
            }

            return query.data;
        };

        const getParams = () => {
            // eslint-disable-next-line camelcase
            const params: any = { cloud_service_id: props.cloudServiceId };
            const query = getQuery();
            if (query) params.query = query;
            // eslint-disable-next-line camelcase
            const keyPath = state.currentLayout.options?.root_path;
            // eslint-disable-next-line camelcase
            if (keyPath) params.key_path = keyPath;
            return params;
        };


        const getData = async () => {
            state.loading = true;
            try {
                const api = SpaceConnector.client.inventory.cloudService[getApiActionByLayoutType(state.currentLayout.type)];
                const res = await api(getParams());

                if (res.total_count !== undefined) state.totalCount = res.total_count;
                state.data = res.results || res;
            } catch (e) {
                state.data = undefined;
                state.totalCount = 0;
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const setSearchOptions = () => {
            if (state.currentLayout.options?.search) {
                const { keyItems, valueHandlerMap } = makeQuerySearchPropsWithSearchSchema(
                    state.currentLayout.options.search,
                    'inventory.Server',
                );
                state.keyItems = keyItems;
                state.valueHandlerMap = valueHandlerMap;
            }
        };

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const dynamicLayoutListeners: DynamicLayoutEventListeners = {
            async init(options) {
                fetchOptionsMap[state.fetchOptionKey] = options;
                setSearchOptions();
                await getData();
            },
            fetch(options) {
                fetchOptionsMap[state.fetchOptionKey] = options;
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
        };

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        const onChangeTab = async (tab) => {
            state.activeTab = tab;
        };

        watch(() => props.cloudServiceId, async (after, before) => {
            if (after && after !== before) {
                await getSchema();
            }
        }, { immediate: false });

        const init = async () => {
            await store.dispatch('resource/loadAll');
            await getSchema();
        };

        init();

        return {
            ...toRefs(state),
            onChangeTab,
            dynamicLayoutListeners,
            fetchOptionsMap,
            fieldHandler,
        };
    },
};
</script>
