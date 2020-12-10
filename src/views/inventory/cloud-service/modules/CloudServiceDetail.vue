<template>
    <div>
        <p-button-tab v-if="tabs.length > 0" :tabs="tabs" :active-tab="activeTab"
                      keep-alive-all
                      @change="onChangeTab"
        >
            <template v-for="(layout, i) in layouts" :slot="layout.name">
                <div :key="`${layout.name}-${i}`">
                    <p-dynamic-layout v-bind="layout" :data="data"
                                      :type-options="{
                                          loading,
                                          totalCount,
                                          timezone,
                                          selectIndex,
                                          keyItemSets,
                                          valueHandlerMap,
                                          language,
                                      }"
                                      :field-handler="fieldHandler"
                                      v-on="dynamicLayoutListeners"
                    />
                </div>
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
import { DynamicLayout, DynamicLayoutType } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { KeyItemSet, ValueHandlerMap } from '@/components/organisms/search/query-search/type';
import {
    DynamicLayoutEventListeners, DynamicLayoutFetchOptions, DynamicLayoutFieldHandler,
} from '@/components/organisms/dynamic-layout/type';
import { getApiActionByLayoutType, makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { ApiQueryHelper, SpaceConnector } from '@/lib/space-connector';
import { getTimezone } from '@/lib/util';
import config from '@/lib/config';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { TabItem } from '@/components/organisms/tabs/tab/type';
import { find } from 'lodash';
import { QueryHelper } from '@/lib/query';

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
            keyItemSets: [] as KeyItemSet[],
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
            const { keyItemSets, valueHandlerMap } = makeQuerySearchPropsWithSearchSchema(
                state.currentLayout.options.search,
                'inventory.CloudService',
            );
            state.keyItemSets = keyItemSets;
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

        const apiQuery = new ApiQueryHelper();
        const queryStore = new QueryHelper();
        const getQuery = (): any => {
            const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
            if (options.sortBy !== undefined) apiQuery.setSort(options.sortBy, options.sortDesc);
            if (options.pageLimit !== undefined) apiQuery.setPageLimit(options.pageLimit);
            if (options.pageStart !== undefined) apiQuery.setPageStart(options.pageStart);
            if (options.searchText !== undefined) apiQuery.setKeyword(options.searchText);
            if (options.queryTags !== undefined) {
                const { filter, keyword } = queryStore.setFiltersAsQueryTag(options.queryTags).apiQuery;
                apiQuery.setApiFilter(...filter)
                    .setKeyword(keyword);
            }

            return apiQuery.data;
        };

        const getParams = (type?: DynamicLayoutType) => {
            const params: any = { cloud_service_id: props.cloudServiceId, query: getQuery() };

            if (type === 'list') delete params.query.sort;

            const keyPath = state.currentLayout.options?.root_path;
            if (keyPath) params.key_path = keyPath;

            return params;
        };


        const getData = async () => {
            state.data = dataMap[state.fetchOptionKey];
            try {
                const api = SpaceConnector.client.inventory.cloudService[getApiActionByLayoutType(state.currentLayout.type)];
                const res = await api(getParams(state.currentLayout.type));

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
