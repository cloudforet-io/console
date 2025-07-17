<script setup lang="ts">
import {
    computed, reactive, watch, ref,
} from 'vue';
import { useRouter } from 'vue-router/composables';


import { isTableTypeInDynamicLayoutType } from '@cloudforet/core-lib/component-util/dynamic-layout';
import { getThisPage } from '@cloudforet/core-lib/component-util/pagination';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDynamicLayout, PButtonTab, PTextButton, PI,
} from '@cloudforet/mirinae';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    DynamicLayoutEventListener, DynamicLayoutFetchOptions, DynamicLayoutFieldHandler,
} from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout, DynamicLayoutType } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';


import { QueryType } from '@/api-clients/_common/schema/api-verbs/export';
import type { ExportParameter } from '@/api-clients/_common/schema/api-verbs/export';
import type { PageSchemaGetParameters } from '@/api-clients/add-ons/page-schema/schema/api-verbs/get';
import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import type { CloudServiceListParameters } from '@/api-clients/inventory/cloud-service/schema/api-verbs/list';
import type { CloudServiceModel } from '@/api-clients/inventory/cloud-service/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { useServiceRouter } from '@/router/composables/use-service-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { MENU_ID } from '@/lib/menu/config';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';

import { useCloudServiceGetQuery } from '@/services/asset-inventory/composables/use-cloud-service-get-query';
import { useCloudServicePageSchemaGetQuery } from '@/services/asset-inventory/composables/use-cloud-service-page-schema-get-query';
import { useCloudServicePaginationQuery } from '@/services/asset-inventory/composables/use-cloud-service-pagination-query';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';


interface Props {
    cloudServiceId: string;
    cloudServiceGroup: string;
    cloudServiceType: string;
    isServerPage: boolean;
    isSecurityPage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isServerPage: false,
    isSecurityPage: false,
});

const defaultFetchOptions: DynamicLayoutFetchOptions = {
    sortBy: '',
    sortDesc: true,
    pageStart: 1,
    pageLimit: 15,
    queryTags: [],
    searchText: '',
};

const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageGetters = cloudServiceDetailPageStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();

const router = useRouter();
const serviceRouter = useServiceRouter(router);
const referenceMap = useAllReferenceDataModel();
const { cloudServiceAPI } = useCloudServiceApi();

const { data: schemaData } = useCloudServicePageSchemaGetQuery({
    params: computed<PageSchemaGetParameters>(() => {
        const params: Record<string, any> = {
            schema: 'details',
            options: {
                cloud_service_id: props.cloudServiceId,
                include_workspace_info: appContextGetters.isAdminMode,
            },
        };
        if (props.isServerPage) {
            params.resource_type = 'inventory.Server';
        } else {
            params.resource_type = 'inventory.CloudService';
        }
        return params as PageSchemaGetParameters;
    }),
});

const { referenceFieldFormatter } = useReferenceFieldFormatter();
const state = reactive({
    // data: undefined as any,
    data: computed(() => {
        if (state.isTableTypeInDynamicLayout) {
            return cloudServiceDataForDynamicLayout.value?.results ?? [];
        }
        return cloudServiceData.value;
    }),
    totalCount: computed<number>(() => {
        if (state.isTableTypeInDynamicLayout) {
            return cloudServiceDataForDynamicLayoutTotalCount.value ?? 0;
        }
        return 0;
    }),
    loading: computed(() => {
        if (state.isTableTypeInDynamicLayout) {
            return isCloudServiceDataLoadingForDynamicLayout.value;
        }
        return isCloudServiceDataLoading.value;
    }),
    timezone: computed(() => userStore.state.timezone),
    selectIndex: [] as number[],
    language: computed(() => userStore.state.language),

    // button tab
    tabs: computed<TabItem[]>(() => {
        if (!schemaData.value) return [];
        const local = i18n.locale;
        return (schemaData.value?.details || []).map((d) => ({
            label: i18n.t(d.options?.translation_id, local) || d.name,
            name: d.name,
        }));
    }),
    activeTab: '',

    // schema
    layoutMap: computed(() => {
        const res = {};
        if (!schemaData.value) return res;
        (schemaData.value.details || []).forEach((d) => {
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
});
const fetchOptionsMap = ref(defaultFetchOptions);

const handleClickLinkButton = (type: string, id: string, item: CloudServiceModel) => {
    if (type === 'workspace') {
        window.open(router.resolve({
            name: props.isSecurityPage ? ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
            params: {
                provider: item.provider,
                group: item.cloud_service_group,
                name: item.cloud_service_type,
                workspaceId: id,
            },
        }).href, '_blank');
    } else {
        window.open(serviceRouter.resolve({
            feature: MENU_ID.PROJECT,
            routeKey: 'detail',
            params: { id, workspaceId: state.data.workspace_id },
        }).href, '_blank');
    }
};

const schemaQueryHelper = new QueryHelper();
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed(() => (state.currentLayout?.options?.search ?? [])),
    'inventory.CloudService',
    computed(() => schemaQueryHelper.setFilters([
        { k: 'cloud_service_id', v: props.cloudServiceId, o: '=' },
    ]).apiQuery.filter),
);

const apiQuery = new ApiQueryHelper();
const listTypeQuery = new ApiQueryHelper();
const unwindTagQuery = new ApiQueryHelper();

const setOnlyQuery = (query:ApiQueryHelper, type?: DynamicLayoutType) => {
    if (type === 'list') return;
    const fields: DynamicField[] = state.currentLayout.options?.fields ?? [];
    const only:string[] = [];
    fields.forEach((d) => {
        if (d.type === 'more' && d.options?.sub_key) {
            only.push(d.options.sub_key);
        } else if (d) only.push(d.key);
    });
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
    const options = fetchOptionsMap.value || defaultFetchOptions;
    setListQuery(options, type);
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    let params: any;

    if (type !== 'list') {
        const unwindQueryData = unwindTagQuery.data;
        const keyword = unwindQueryData.keyword;
        delete unwindQueryData.keyword;
        params = {
            query: {
                ...apiQuery.data,
                unwind: {
                    path: state.currentLayout.options?.unwind?.path ?? '',
                    ...(!isTagsEmpty && { ...unwindQueryData }),
                },
                ...(keyword && { keyword }),
            },
        };
    } else {
        listTypeQuery
            .setFilters([{ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' }]);
        params = { query: listTypeQuery.data };
    }

    return params;
};


const { data: cloudServiceData, isLoading: isCloudServiceDataLoading } = useCloudServiceGetQuery({
    cloudServiceId: computed(() => props.cloudServiceId),
    enabled: computed(() => !state.isTableTypeInDynamicLayout),
});

const { data: cloudServiceDataForDynamicLayout, isLoading: isCloudServiceDataLoadingForDynamicLayout, totalCount: cloudServiceDataForDynamicLayoutTotalCount } = useCloudServicePaginationQuery({
    params: computed<CloudServiceListParameters>(() => getListApiParams(state.currentLayout.type)),
    thisPage: computed(() => getThisPage(fetchOptionsMap.value?.pageStart || 1, fetchOptionsMap.value?.pageLimit || 45)),
    pageSize: computed(() => fetchOptionsMap.value?.pageLimit || 45),
    enabled: computed(() => state.isTableTypeInDynamicLayout),
});

// excel
const excelQuery = new ApiQueryHelper()
    .setMultiSortV2([{ key: 'created_at', desc: true }]);

const unwindTableExcelDownload = async (fields: DynamicField[]) => {
    excelQuery.setFilters([{ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' }]);
    const options = fetchOptionsMap.value || defaultFetchOptions;
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const excelExportFetcher = () => {
        const cloudServiceExcelExportParams: ExportParameter = {
            file_name: props.isServerPage ? 'cloud_service_export' : cloudServiceDetailPageGetters.sheetNamePrefix,
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
            timezone: state.timezone,
        };
        return cloudServiceAPI.export(cloudServiceExcelExportParams);
    };
    await downloadExcelByExportFetcher(excelExportFetcher);
};

const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
    fetch(options) {
        fetchOptionsMap.value = {
            ...fetchOptionsMap.value,
            ...options,
        };
    },
    select(selectIndex) {
        state.selectIndex = selectIndex;
    },
    export() {
        const fields: DynamicField[] = state.currentLayout?.options?.fields;
        unwindTableExcelDownload(fields);
    },
};

const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter({ ...field.extraData.reference, workspace_id: userWorkspaceStore.getters.currentWorkspaceId }, field.data);
    }
    return {};
};

const onChangeTab = async (tab) => {
    state.activeTab = tab;
    fetchOptionsMap.value = defaultFetchOptions;
};


watch(schemaData, (schema) => {
    if (schema?.details?.length && schema.details.length > 0) {
        state.activeTab = schema.details[0].name;
    }
}, { immediate: true });

</script>

<template>
    <div>
        <p-button-tab v-if="state.tabs.length > 0"
                      :tabs="state.tabs"
                      :active-tab="state.activeTab"
                      keep-alive-all
                      @change="onChangeTab"
        >
            <template v-for="(layout, i) in schemaData?.details || []"
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
                                          keyItemSets,
                                          valueHandlerMap,
                                          language:state.language,
                                          excelVisible: layout.type !== 'raw-table',
                                      }"
                                      :field-handler="fieldHandler"
                                      v-on="dynamicLayoutListeners"
                    >
                        <template #data-workspace_id="{value}">
                            <p-text-button class="report-link"
                                           size="md"
                                           @click="handleClickLinkButton('workspace', value, state.data)"
                            >
                                {{ referenceMap.workspace[value]?.label || value }}
                                <p-i name="ic_arrow-right-up"
                                     class="link-mark"
                                     height="0.875rem"
                                     width="0.875rem"
                                     color="inherit"
                                />
                            </p-text-button>
                        </template>
                        <template #data-project_id="{value}">
                            <p-text-button class="report-link"
                                           size="md"
                                           @click="handleClickLinkButton('project', value, state.data)"
                            >
                                {{ referenceMap.project[value]?.label || value }}
                                <p-i name="ic_arrow-right-up"
                                     class="link-mark"
                                     height="0.875rem"
                                     width="0.875rem"
                                     color="inherit"
                                />
                            </p-text-button>
                        </template>
                    </p-dynamic-layout>
                </div>
            </template>
        </p-button-tab>
    </div>
</template>

<style scoped lang="postcss">
/* custom design-system component - p-dynamic-layout-query-search-table */
.dynamic-layout-wrapper {
    :deep(.p-dynamic-layout-query-search-table) {
        .p-toolbox-table {
            border-width: 0;
            .table-container {
                min-height: 200px;
            }
        }
    }

    /* custom design-system component - p-definition-table */
    :deep(.p-definition-table) {
        min-height: initial;
        .p-definition {
            td.key {
                min-width: 22rem;
                width: 22rem;
            }
        }
    }

    .report-link {
        @apply inline-block text-gray-900;
        padding: 0;
    }
}
</style>
