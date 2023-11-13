<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { PDynamicLayout, PButtonTab } from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener, DynamicLayoutFetchOptions, DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout, DynamicLayoutType } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { find } from 'lodash';

import type { DynamicField } from '@cloudforet/core-lib/component-util/dynamic-layout/field-schema';
import type { KeyItemSet } from '@cloudforet/core-lib/component-util/query-search/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ExportParameter } from '@/models/export';
import { QueryType } from '@/models/export';
import { store } from '@/store';
import { i18n } from '@/translations';

import {
    dynamicFieldsToExcelDataFields,
    isTableTypeInDynamicLayoutType,
} from '@/lib/component-util/dynamic-layout';
import type { ConsoleDynamicField } from '@/lib/component-util/dynamic-layout/type';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    cloudServiceId: string;
    cloudServiceGroup: string;
    cloudServiceType: string;
    isServerPage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isServerPage: false,
});

const defaultFetchOptions: DynamicLayoutFetchOptions = {
    sortBy: '',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
    queryTags: [],
    searchText: '',
};

const layoutSchemaCacheMap = {};
const fetchOptionsMap = {};
const dataMap = {};

const state = reactive({
    data: undefined as any,
    loading: true,
    totalCount: 0,
    timezone: computed(() => store.state.user.timezone),
    selectIndex: [] as number[],
    language: computed(() => store.state.user.language),

    // button tab
    tabs: computed<TabItem[]>(() => {
        const local = i18n.locale;
        return state.layouts.map((d) => ({
            label: i18n.t(d.options?.translation_id, local) || d.name,
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
    isTableTypeInDynamicLayout: computed(() => isTableTypeInDynamicLayoutType(state.currentLayout.type)),
    layoutOptions: computed(() => {
        if (!state.currentLayout.options) return {};
        if (state.isTableTypeInDynamicLayout) {
            return { ...state.currentLayout.options, root_path: undefined };
        }
        return state.currentLayout.options;
    }),
    fetchOptionKey: computed(() => `${state.currentLayout.name}/${state.currentLayout.type}`),
    keyItemSets: computed<KeyItemSet[]>(() => {
        const keyItemSets: KeyItemSet[] = [{
            title: 'Properties',
            items: state.currentLayout.options?.search?.map((d) => ({
                label: d.name,
                name: d.key,
                operators: ['', '!', '=', '!='],
            })),
        }];
        return keyItemSets;
    }),
});
const getSchema = async () => {
    let layouts = layoutSchemaCacheMap[props.cloudServiceId];
    if (!layouts) {
        try {
            const params: Record<string, any> = {
                schema: 'details',
                options: {
                    cloud_service_id: props.cloudServiceId,
                },
            };
            if (props.isServerPage) {
                params.resource_type = 'inventory.Server';
            } else {
                params.resource_type = 'inventory.CloudService';
            }
            const res = await SpaceConnector.client.addOns.pageSchema.get(params);

            layouts = res.details;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    }

    layoutSchemaCacheMap[props.cloudServiceId] = layouts;
    state.layouts = layouts || [];
    if (!find(state.tabs, { name: state.activeTab })) state.activeTab = state.tabs[0].name;
};

const apiQuery = new ApiQueryHelper();
const listTypeQuery = new ApiQueryHelper();
const unwindTagQuery = new ApiQueryHelper();

const setOnlyQuery = (query:ApiQueryHelper, type?: DynamicLayoutType) => {
    if (type === 'list') return;
    const fields:DynamicField[] = state.currentLayout.options?.fields ?? [];
    const only:string[] = [];
    fields.forEach((d) => { if (d) only.push(d.key); });
    query.setOnly(...only);
};
const setListQuery = (options, type?:DynamicLayoutType): any => {
    apiQuery.setFilters([]);
    if (options.sortBy) apiQuery.setSort(options.sortBy, options.sortDesc);
    if (options.pageLimit !== undefined) apiQuery.setPageLimit(options.pageLimit);
    if (options.pageStart !== undefined) apiQuery.setPageStart(options.pageStart);
    apiQuery.addFilter({ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' });
    setOnlyQuery(apiQuery, type);
};



const getListApiParams = (type?: DynamicLayoutType) => {
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    setListQuery(options, type);
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    let params: any;

    if (type !== 'list') {
        params = {
            query: {
                ...apiQuery.data,
                unwind: {
                    path: state.currentLayout.options?.unwind?.path ?? '',
                    ...(!isTagsEmpty && { ...unwindTagQuery.data }),
                },
            },
        };
    } else {
        listTypeQuery
            .setFilters([{ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' }]);
        params = { query: listTypeQuery.data };
    }

    return params;
};

const getData = async () => {
    state.data = dataMap[state.fetchOptionKey];
    try {
        const res = await SpaceConnector.clientV2.inventory.cloudService.list(getListApiParams(state.currentLayout.type));
        if (res.total_count !== undefined) state.totalCount = res.total_count;
        if (res.results) state.data = state.isTableTypeInDynamicLayout ? res.results : res.results[0];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = undefined;
        state.totalCount = 0;
    }
    dataMap[state.fetchOptionKey] = state.data;
};

// excel
const excelQuery = new ApiQueryHelper()
    .setMultiSortV2([{ key: 'created_at', desc: true }]);

const unwindTableExcelDownload = async (fields:ConsoleDynamicField[]) => {
    excelQuery.setFilters([{ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' }]);
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const excelExportFetcher = () => {
        const cloudServiceExcelExportParams: ExportParameter = {
            options: [
                {
                    name: state.currentLayout.name,
                    query_type: QueryType.SEARCH,
                    search_query: {
                        ...excelQuery.data,
                        unwind: {
                            path: state.currentLayout.options?.unwind?.path ?? '',
                            ...(!isTagsEmpty && { ...unwindTagQuery.data }),
                        },
                        fields: dynamicFieldsToExcelDataFields(fields),
                    },
                },
            ],
        };
        return SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
    };
    await downloadExcelByExportFetcher(excelExportFetcher);
};

const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
    fetch(options) {
        fetchOptionsMap[state.fetchOptionKey] = options;
        getData();
    },
    select(selectIndex) {
        state.selectIndex = selectIndex;
    },
    export() {
        const fields:ConsoleDynamicField[] = state.currentLayout?.options?.fields;
        unwindTableExcelDownload(fields);
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

(async () => {
    await loadSchemaAndData();
})();


</script>

<template>
    <div>
        <p-button-tab v-if="state.tabs.length > 0"
                      :tabs="state.tabs"
                      :active-tab="state.activeTab"
                      keep-alive-all
                      @change="onChangeTab"
        >
            <template v-for="(layout, i) in state.layouts"
                      :slot="layout.name"
            >
                <div :key="`${layout.name}-${i}`"
                     class="dynamic-layout-wrapper"
                >
                    <p-dynamic-layout :type="layout.type"
                                      :options="state.layoutOptions"
                                      :data="state.data"
                                      :type-options="{
                                          loading:state.loading,
                                          totalCount:state.totalCount,
                                          timezone:state.timezone,
                                          selectIndex:state.selectIndex,
                                          keyItemSets:state.keyItemSets,
                                          lanuage:state.language,
                                      }"
                                      :field-handler="fieldHandler"
                                      v-on="dynamicLayoutListeners"
                    />
                </div>
            </template>
        </p-button-tab>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-toolbox-table */
.dynamic-layout-wrapper {
    :deep(.p-dynamic-layout-query-search-table) {
        .p-toolbox-table {
            border-width: 0;
            .table-container {
                min-height: 200px;
            }
        }
    }
}
</style>
