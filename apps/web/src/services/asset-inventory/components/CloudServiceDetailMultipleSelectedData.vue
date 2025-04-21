<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { find } from 'lodash';

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
import type { DynamicLayout } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';
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

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { MENU_ID } from '@/lib/menu/config';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { BASE_INFORMATION } from '@/services/asset-inventory/constants/cloud-service-detail-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';

interface Props {
    cloudServiceIdList: string[];
    cloudServiceGroup: string;
    cloudServiceType: string;
    isSecurityPage: boolean;
}

const props = withDefaults(defineProps<Props>(), {
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

const fetchOptionsMap = {};
const dataMap = {};

const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const userWorkspaceStore = useUserWorkspaceStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
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
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    selectIndex: [] as number[],
    language: computed<string|undefined>(() => userStore.state.language),

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
        return state.currentLayout.options;
    }),
    fetchOptionKey: computed(() => `${state.currentLayout.name}/${state.currentLayout.type}`),
    rootPath: computed(() => state.currentLayout.options?.unwind?.path ?? ''),
    isBaseInformationSchema: computed(() => (state.currentLayout.name === BASE_INFORMATION)),
});

/* Event */
const handleClickLinkButton = async (type: string, workspaceId: string, id: string) => {
    if (type === 'workspace') {
        try {
            const response = await SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>({
                cloud_service_id: id,
            });
            window.open(router.resolve({
                name: props.isSecurityPage ? ASSET_INVENTORY_ROUTE.SECURITY.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: response.provider,
                    group: response.cloud_service_group,
                    name: response.cloud_service_type,
                    workspaceId,
                },
            }).href, '_blank');
        } catch (e: any) {
            ErrorHandler.handleRequestError(e, e.message);
        }
    } else {
        window.open(serviceRouter.resolve({
            feature: MENU_ID.PROJECT,
            routeKey: 'detail',
            params: { id, workspaceId },
        }).href, '_blank');
    }
};

/* API */
const schemaQueryHelper = new QueryHelper();
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed(() => (state.currentLayout?.options?.search ?? [])),
    'inventory.CloudService',
    computed(() => schemaQueryHelper.setFilters([
        { k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' },
    ]).apiQuery.filter),
);

const getSchema = async () => {
    try {
        const params: Record<string, any> = {
            schema: 'details',
            resource_type: 'inventory.CloudService',
            options: {
                cloud_service_id: props.cloudServiceIdList[0],
                include_workspace_info: appContextGetters.isAdminMode,
                is_multiple: true,
            },
        };
        const res = await SpaceConnector.client.addOns.pageSchema.get(params);
        state.layouts = res.details;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
    if (!find(state.tabs, { name: state.activeTab })) state.activeTab = state.tabs[0].name;
};

const apiQuery = new ApiQueryHelper();
const baseInformationQuery = new ApiQueryHelper();

const setOnlyQuery = (query:ApiQueryHelper) => {
    if (state.isBaseInformationSchema) return;
    const fields:DynamicField[] = state.currentLayout.options?.fields ?? [];
    const only:string[] = [];
    fields.forEach((d) => {
        if (d.type === 'more' && d.options?.sub_key) {
            only.push(d.options.sub_key);
        } else if (d) only.push(d.key);
    });
    query.setOnly(...only);
};
const setListQuery = (options) => {
    apiQuery.setFilters([]);
    if (options.sortBy) apiQuery.setSort(options.sortBy, options.sortDesc);
    if (options.pageLimit !== undefined) apiQuery.setPageLimit(options.pageLimit);
    if (options.pageStart !== undefined) apiQuery.setPageStart(options.pageStart);
    apiQuery.addFilter({ k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' });
    setOnlyQuery(apiQuery);
};

const unwindTagQuery = new ApiQueryHelper();
const getListApiParams = () => {
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    setListQuery(options);
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    let params: any;

    if (!state.isBaseInformationSchema) {
        params = {
            query: {
                ...apiQuery.data,
                unwind: {
                    path: state.rootPath,
                    ...(!isTagsEmpty && { ...unwindTagQuery.data }),
                },
            },
        };
    } else {
        baseInformationQuery
            .setFilters([{ k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' }]);
        params = { query: baseInformationQuery.data };
    }

    return params;
};


const getData = async () => {
    state.loading = true;
    state.data = dataMap[state.fetchOptionKey];
    try {
        const res = await SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>(getListApiParams());
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

const excelQuery = new ApiQueryHelper()
    .setMultiSortV2([{ key: 'created_at', desc: true }]);

const unwindTableExcelDownload = async (fields: DynamicField[]) => {
    excelQuery.setFilters([{ k: 'cloud_service_id', v: props.cloudServiceIdList, o: '=' }]);
    const options = fetchOptionsMap[state.fetchOptionKey] || defaultFetchOptions;
    const isTagsEmpty = (options.queryTags ?? []).length === 0;
    if (options.queryTags !== undefined) unwindTagQuery.setFiltersAsQueryTag(options.queryTags);
    const excelExportFetcher = () => {
        const cloudServiceExcelExportParams: ExportParameter = {
            file_name: cloudServiceDetailPageStore.sheetNamePrefix,
            options: [
                {
                    name: state.currentLayout.name,
                    query_type: QueryType.SEARCH,
                    search_query: {
                        ...excelQuery.data,
                        unwind: {
                            path: state.rootPath,
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
        fetchOptionsMap[state.fetchOptionKey] = {
            ...fetchOptionsMap[state.fetchOptionKey],
            ...options,
        };
        getData();
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
                                          lanuage:state.language,
                                      }"
                                      :field-handler="fieldHandler"
                                      v-on="dynamicLayoutListeners"
                    >
                        <template #col-workspace_id-format="{value, item}">
                            <p-text-button class="report-link"
                                           size="md"
                                           @click="handleClickLinkButton('workspace', value, item.cloud_service_id)"
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
                        <template #col-project_id-format="{value, item}">
                            <p-text-button class="report-link"
                                           size="md"
                                           @click="handleClickLinkButton('project', item.workspace_id, value)"
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
    .report-link {
        @apply flex items-center text-gray-900;
        gap: 0.25rem;
    }
}
</style>
