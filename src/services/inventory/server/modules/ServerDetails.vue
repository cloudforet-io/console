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
                                          excelVisible: false
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
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButtonTab, PDynamicLayout } from '@spaceone/design-system';
import {
    DynamicLayoutEventListener,
    DynamicLayoutFetchOptions, DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { DynamicLayout, DynamicLayoutType } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import {
    dynamicFieldsToExcelDataFields,
    getApiActionByLayoutType,
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import { store } from '@/store';
import { Reference } from '@/lib/reference/type';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { find } from 'lodash';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';

const defaultFetchOptions: DynamicLayoutFetchOptions = {
    sortBy: '',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
    queryTags: [],
    searchText: '',
};

export default {
    name: 'ServerDetails',
    components: {
        PButtonTab,
        PDynamicLayout,
    },
    props: {
        serverId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const layoutSchemaCacheMap = {};
        const fetchOptionsMap = {};
        const dataMap = {};

        const state = reactive({
            data: undefined as any,
            loading: false,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone),
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
                'inventory.Server',
            );
            state.keyItemSets = keyItemSets;
            state.valueHandlerMap = valueHandlerMap;
        };

        const getSchema = async () => {
            let layouts = layoutSchemaCacheMap[props.serverId];
            if (!layouts) {
                try {
                    const res = await SpaceConnector.client.addOns.pageSchema.get({
                        resource_type: 'inventory.Server',
                        schema: 'details',
                        options: {
                            server_id: props.serverId,
                            translation_id: true,
                        },
                    });

                    layouts = res.details;
                } catch (e) {
                    ErrorHandler.handleError(e);
                }
            }

            layoutSchemaCacheMap[props.serverId] = layouts;
            state.layouts = layouts || [];
            if (!find(state.tabs, { name: state.activeTab })) state.activeTab = state.tabs[0].name;
            if (state.currentLayout.options?.search) setSearchOptions();
        };

        const apiQuery = new ApiQueryHelper();
        const getQuery = (): any => {
            const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
            if (options.sortBy !== undefined) apiQuery.setSort(options.sortBy, options.sortDesc);
            if (options.pageLimit !== undefined) apiQuery.setPageLimit(options.pageLimit);
            if (options.pageStart !== undefined) apiQuery.setPageStart(options.pageStart);
            if (options.searchText !== undefined) apiQuery.setFilters([{ v: options.searchText }]);
            if (options.queryTags !== undefined) {
                apiQuery.setFiltersAsQueryTag(options.queryTags);
            }

            return apiQuery.data;
        };

        const getParams = (type?: DynamicLayoutType) => {
            const params: any = { server_id: props.serverId, query: getQuery() };

            if (type === 'list') delete params.query.sort;

            const keyPath = state.currentLayout.options?.root_path;
            if (keyPath) params.key_path = keyPath;

            return params;
        };


        const getData = async () => {
            state.data = dataMap[state.fetchOptionKey];
            try {
                const api = SpaceConnector.client.inventory.server[getApiActionByLayoutType(state.currentLayout.type)];
                const res = await api(getParams(state.currentLayout.type));

                if (res.total_count !== undefined) state.totalCount = res.total_count;
                state.data = res.results || res;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = undefined;
                state.totalCount = 0;
            }
            dataMap[state.fetchOptionKey] = state.data;
        };

        const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
            fetch(options) {
                fetchOptionsMap[state.fetchOptionKey] = options;
                getData();
            },
            select(selectIndex) {
                state.selectIndex = selectIndex;
            },
            async export() {
                const fields = state.currentLayout?.options?.fields;
                if (!fields) return;
                try {
                    showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
                    await store.dispatch('file/downloadExcel', {
                        url: '/inventory/server/get-data',
                        param: getParams(),
                        fields: dynamicFieldsToExcelDataFields(fields),
                        file_name_prefix: FILE_NAME_PREFIX.server,
                    });
                } catch (e) {
                    ErrorHandler.handleError(e);
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

        watch(() => props.serverId, async (after, before) => {
            if (after !== before && !state.loading) {
                await loadSchemaAndData();
            }
        }, { immediate: false });

        const init = async () => {
            await loadSchemaAndData();
        };

        init();

        return {
            ...toRefs(state),
            dynamicLayoutListeners,
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
