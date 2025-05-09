<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { find } from 'lodash';

import { isTableTypeInDynamicLayoutType } from '@cloudforet/core-lib/component-util/dynamic-layout';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
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
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceGetParameters } from '@/schema/inventory/cloud-service/api-verbs/get';
import type { CloudServiceListParameters } from '@/schema/inventory/cloud-service/api-verbs/list';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';
import { i18n } from '@/translations';

import { useServiceRouter } from '@/router/composables/use-service-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import { useUserStore } from '@/store/user/user-store';

import {
    dynamicFieldsToExcelDataFields,
} from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { MENU_ID } from '@/lib/menu/config';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';

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

const layoutSchemaCacheMap = {};
const fetchOptionsMap = {};
const dataMap = {};

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();

const router = useRouter();
const serviceRouter = useServiceRouter(router);

const { referenceFieldFormatter } = useReferenceFieldFormatter();

const state = reactive({
    data: undefined as any,
    loading: true,
    totalCount: 0,
    timezone: computed(() => userStore.state.timezone),
    selectIndex: [] as number[],
    language: computed(() => userStore.state.language),

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
});

const handleClickLinkButton = async (type: string, id: string) => {
    if (type === 'workspace') {
        try {
            const response = await SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>({
                cloud_service_id: state.data.cloud_service_id,
            });
            window.open(router.resolve({
                name: props.isSecurityPage ? ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: response.provider,
                    group: response.cloud_service_group,
                    name: response.cloud_service_type,
                    workspaceId: id,
                },
            }).href, '_blank');
        } catch (e: any) {
            ErrorHandler.handleRequestError(e, e.message);
        }
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

const getSchema = async () => {
    let layouts = layoutSchemaCacheMap[props.cloudServiceId];
    if (!layouts) {
        try {
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
const apiQueryForGetData = new ApiQueryHelper();
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
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
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

const getQueryForGetDataAPI = (): any => {
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    if (options.sortBy !== undefined) apiQueryForGetData.setSort(options.sortBy, options.sortDesc);
    if (options.pageLimit !== undefined) apiQueryForGetData.setPageLimit(options.pageLimit);
    if (options.pageStart !== undefined) apiQueryForGetData.setPageStart(options.pageStart);
    if (options.searchText !== undefined) apiQueryForGetData.setFilters([{ v: options.searchText }]);
    if (options.queryTags !== undefined) {
        apiQueryForGetData.setFiltersAsQueryTag(options.queryTags);
    }
    return apiQueryForGetData.data;
};
const fetchData = async () => {
    state.data = dataMap[state.fetchOptionKey];
    try {
        if (state.currentLayout.type === 'raw-table') {
            const params: any = { cloud_service_id: props.cloudServiceId, query: getQueryForGetDataAPI() };
            const keyPath = state.currentLayout.options?.root_path;
            if (keyPath) params.key_path = keyPath;
            const res = await SpaceConnector.client.inventory.cloudService.getData(params);
            if (res.total_count !== undefined) state.totalCount = res.total_count;
            state.data = res.results;
        } else if (state.isTableTypeInDynamicLayout) {
            const res = await SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>(getListApiParams(state.currentLayout.type));
            if (res.total_count !== undefined) state.totalCount = res.total_count;
            if (state.isTableTypeInDynamicLayout) {
                state.data = res.results ?? [];
            } else {
                state.data = res.results?.[0];
            }
        } else {
            const res = await SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>({ cloud_service_id: props.cloudServiceId });
            if (res) state.data = res;
        }
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

const unwindTableExcelDownload = async (fields: DynamicField[]) => {
    excelQuery.setFilters([{ k: 'cloud_service_id', v: props.cloudServiceId, o: '=' }]);
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const excelExportFetcher = () => {
        const cloudServiceExcelExportParams: ExportParameter = {
            file_name: props.isServerPage ? 'cloud_service_export' : cloudServiceDetailPageStore.sheetNamePrefix,
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
        return SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
    };
    await downloadExcelByExportFetcher(excelExportFetcher);
};

const dynamicLayoutListeners: Partial<DynamicLayoutEventListener> = {
    fetch(options) {
        fetchOptionsMap[state.fetchOptionKey] = options;
        fetchData();
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

const loadSchemaAndData = async () => {
    state.loading = true;
    await getSchema();
    await fetchData();
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
                                           @click="handleClickLinkButton('workspace', value)"
                            >
                                {{ allReferenceGetters.workspace[value]?.label }}
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
                                           @click="handleClickLinkButton('project', value)"
                            >
                                {{ allReferenceGetters.project[value]?.label }}
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
