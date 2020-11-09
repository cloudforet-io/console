<template>
    <div>
        <p-button-tab v-if="tabs.length > 0" :tabs="tabs" :active-tab="activeTab"
                      @change="onChangeTab"
        >
            <template v-for="(layout, i) in layouts" :slot="layout.name">
                <p-dynamic-layout :key="`${layout.name}-${i}`" v-bind="layout" :data="data"
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
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import PButtonTab from '@/components/organisms/tabs/button-tab/PButtonTab.vue';

import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { KeyItem, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import {
    DynamicLayoutEventListeners,
    DynamicLayoutFetchOptions,
    DynamicLayoutFieldHandler,
} from '@/components/organisms/dynamic-layout/type';

import { getApiActionByLayoutType, makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { getFiltersFromQueryTags } from '@/lib/component-utils/query-search-tags';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import config from '@/lib/config';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { TabItem } from '@/components/organisms/tabs/tab/type';
import { find } from 'lodash';

const defaultFetchOptions: DynamicLayoutFetchOptions = {
    sortBy: '',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
    queryTags: [],
    searchText: '',
};

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
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const layoutSchemaCacheMap = {};
        const fetchOptionsMap = {};
        const dataMap = {};

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
            tabs: computed<TabItem[]>(() => {
                const local = vm.$i18n.locale;
                return state.layouts.map(d => ({
                    label: vm.$t(d.options?.translation_id, local) || d.name,
                    name: d.name,
                }));
            }),
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


        const setSearchOptions = () => {
            const { keyItems, valueHandlerMap } = makeQuerySearchPropsWithSearchSchema(
                state.currentLayout.options.search[0],
                'inventory.CloudService',
            );
            state.keyItems = keyItems;
            state.valueHandlerMap = valueHandlerMap;
        };

        const getSchema = async () => {
            let layouts = layoutSchemaCacheMap[props.cloudServiceId];
            if (!layouts) {
                try {
                    const res = await SpaceConnector.client.addOns.pageSchema.get({
                        resource_type: 'inventory.CloudService',
                        schema: 'details',
                        options: {
                            cloud_service_id: props.cloudServiceId,
                        },
                    });

                    layouts = res.details;
                } catch (e) {
                    console.error(e);
                }
            }

            layoutSchemaCacheMap[props.cloudServiceId] = layouts;
            state.layouts = layouts || [];
            if (!find(state.tabs, { name: state.activeTab })) state.activeTab = state.tabs[0].name;
            if (state.currentLayout.options?.search) setSearchOptions();
        };

        const getQuery = (): undefined|any => {
            const query = new QueryHelper();

            const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
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
            state.data = dataMap[state.fetchOptionKey];
            try {
                const api = SpaceConnector.client.inventory.cloudService[getApiActionByLayoutType(state.currentLayout.type)];
                const res = await api(getParams());

                if (res.total_count !== undefined) state.totalCount = res.total_count;
                state.data = res.results || res;
            } catch (e) {
                state.data = undefined;
                state.totalCount = 0;
                console.error(e);
            }
            dataMap[state.fetchOptionKey] = state.data;
        };


        const exportApi = SpaceConnector.client.addOns.excel.export;
        const dynamicLayoutListeners: Partial<DynamicLayoutEventListeners> = {
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

        const loadSchemaAndData = async () => {
            state.loading = true;
            await getSchema();
            await getData();
            state.loading = false;
        };

        const onChangeTab = async (tab) => {
            state.activeTab = tab;
            await loadSchemaAndData();
        };

        watch(() => props.cloudServiceId, async (after, before) => {
            if (after && after !== before) {
                await loadSchemaAndData();
            }
        }, { immediate: false });

        const init = async () => {
            await store.dispatch('resource/loadAll');
            await loadSchemaAndData();
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
