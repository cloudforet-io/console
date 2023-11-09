<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { PDynamicLayout, PButtonTab } from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener, DynamicLayoutFetchOptions, DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { find } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ExportParameter } from '@/models/export';
import { QueryType } from '@/models/export';
import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import type { ConsoleDynamicField } from '@/lib/component-util/dynamic-layout/type';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { filterForExcelSchema } from '@/services/asset-inventory/cloud-service/cloud-service-detail/lib/helper';

interface Props {
    cloudServiceIdList: string[];
    cloudServiceGroup: string;
    cloudServiceType: string;
}

const props = defineProps<Props>();

const defaultFetchOptions: DynamicLayoutFetchOptions = {
    sortBy: '',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
    queryTags: [],
    searchText: '',
};

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
    layoutOptions: computed(() => {
        if (!state.currentLayout.options) return {};
        if (state.currentLayout.name === 'Base Information') {
            return { ...state.currentLayout.options?.layouts[0].options };
        }
        return state.currentLayout.options;
    }),
    fetchOptionKey: computed(() => `${state.currentLayout.name}/${state.currentLayout.type}`),
});
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed(() => state.currentLayout?.options?.search ?? []),
    'inventory.CloudService',
);
const getSchema = async () => {
    try {
        const params: Record<string, any> = {
            schema: 'details',
            resource_type: 'inventory.CloudService',
            options: {
                cloud_service_id: props.cloudServiceIdList[0],
            },
        };
        const res = await SpaceConnector.client.addOns.pageSchema.get(params);
        state.layouts = filterForExcelSchema(res.details);
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    if (!find(state.tabs, { name: state.activeTab })) state.activeTab = state.tabs[0].name;
};

const apiQuery = new ApiQueryHelper();
const getQuery = (): any => {
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    if (options.sortBy) apiQuery.setMultiSortV2([{ key: options.sortBy, desc: options.sortDesc }]);
    if (options.pageLimit !== undefined) apiQuery.setPageLimit(options.pageLimit);
    if (options.pageStart !== undefined) apiQuery.setPageStart(options.pageStart);
    if (options.searchText !== undefined) apiQuery.setFilters([{ v: options.searchText }]);
    if (options.queryTags !== undefined) {
        apiQuery.setFiltersAsQueryTag(options.queryTags);
    }
    apiQuery.addFilter({ k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' });
    return apiQuery;
};

const getParams = () => {
    const query = getQuery();
    let params: any;

    const rootPath = state.currentLayout.options?.root_path;
    const fields = state.currentLayout.options?.fields;
    if (rootPath && fields) {
        const only:string[] = [];
        fields.forEach((d) => { if (d) only.push(`${rootPath}.${d.key}`); });
        params = {
            query: {
                ...query.setOnly(...only).data,
                unwind: rootPath,
            },
        };
    } else {
        params = { query: query.data };
    }

    return params;
};


const getData = async () => {
    state.loading = true;
    state.data = dataMap[state.fetchOptionKey];
    try {
        const res = await SpaceConnector.clientV2.inventory.cloudService.list(getParams());
        state.totalCount = res.total_count;
        state.data = res.results;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = undefined;
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
    dataMap[state.fetchOptionKey] = state.data;
};

const baseInformationExcelDownload = async (fields:ConsoleDynamicField[]) => {
    const excelExportFetcher = () => {
        const excelQuery = new ApiQueryHelper()
            .addFilter({ k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' })
            .setMultiSortV2([{ key: 'created_at', desc: true }]);

        const cloudServiceExcelExportParams: ExportParameter = {
            options: [
                {
                    name: 'Cloud Service List',
                    query_type: QueryType.SEARCH,
                    search_query: {
                        ...excelQuery.data,
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
        let fields:ConsoleDynamicField[] = [];
        if (state.currentLayout.name === 'Base Information') {
            fields = state.currentLayout.options?.layouts[0].options?.fields;
            baseInformationExcelDownload(fields);
        } else {
            // TODO: unwind excel api
            fields = state.currentLayout?.options?.fields;
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

watch(() => props.cloudServiceIdList, async (after, before) => {
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
                <div :key="`${layout.name}-${i}`">
                    <p-dynamic-layout :type="layout.name === 'Base Information' ? 'table' : layout.type"
                                      :options="state.layoutOptions"
                                      :data="state.data"
                                      :type-options="{
                                          loading:state.loading,
                                          totalCount:state.totalCount,
                                          timezone:state.timezone,
                                          selectIndex:state.selectIndex,
                                          keyItemSets,
                                          valueHandlerMap,
                                          lanuage:state.language,
                                          excelVisible: true
                                      }"
                                      :field-handler="fieldHandler"
                                      v-on="dynamicLayoutListeners"
                    />
                </div>
            </template>
        </p-button-tab>
    </div>
</template>
