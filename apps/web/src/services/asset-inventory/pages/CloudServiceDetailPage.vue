<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import { reactive, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { isEmpty, get, cloneDeep } from 'lodash';

import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter, ConsoleFilterValue } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { ApiFilterOperator } from '@cloudforet/core-lib/space-connector/type';
import {
    PHorizontalLayout, PDynamicLayout, PHeading, PButton, PTextButton, PI, PBadge, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';
import type {
    DynamicLayoutEventListener, DynamicLayoutFetchOptions,
    DynamicLayoutFieldHandler,
} from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type';
import type {
    DynamicLayout,
    DynamicLayoutOptions,
} from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import { QueryType } from '@/api-clients/_common/schema/api-verbs/export';
import type { ExportParameter } from '@/api-clients/_common/schema/api-verbs/export';
import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { CloudServiceGetParameters } from '@/schema/inventory/cloud-service/api-verbs/get';
import type { CloudServiceListParameters } from '@/schema/inventory/cloud-service/api-verbs/list';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';

import { useServiceRouter } from '@/router/composables/use-service-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { dynamicFieldsToExcelDataFields } from '@/lib/excel-export';
import { downloadExcelByExportFetcher } from '@/lib/helper/file-download-helper';
import { MENU_ID } from '@/lib/menu/config';
import type { Reference } from '@/lib/reference/type';
import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';
import {
    arrayToQueryString, queryStringToArray,
    queryStringToObject,
    replaceUrlQuery,
} from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModalForDynamicLayout from '@/common/modules/custom-table/custom-field-modal/CustomFieldModalForDynamicLayout.vue';

import ExcelExportOptionModal
    from '@/services/asset-inventory/components/CloudServiceDetailExcelExportOptionModal.vue';
import CloudServiceDetailTabs
    from '@/services/asset-inventory/components/CloudServiceDetailTabs.vue';
import CloudServiceMetricButton from '@/services/asset-inventory/components/CloudServiceMetricButton.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/components/CloudServicePeriodFilter.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import {
    TABLE_MIN_HEIGHT, useAssetInventorySettingsStore,
} from '@/services/asset-inventory/stores/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/stores/cloud-service-detail-page-store';
import { useCloudServiceLSBStore } from '@/services/asset-inventory/stores/cloud-service-l-s-b-store';
import type { Period } from '@/services/asset-inventory/types/type';


interface Props {
    provider?: string;
    group?: string;
    name?: string;
    isServerPage?: boolean;
    isSecurityPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    provider: '',
    group: '',
    name: '',
    isServerPage: false,
    isSecurityPage: false,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const cloudServiceLSBStore = useCloudServiceLSBStore();
const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const assetInventorySettingsStore = useAssetInventorySettingsStore();
const userWorkspaceStore = useUserWorkspaceStore();
const appContextStore = useAppContextStore();
const appContextGetters = appContextStore.getters;
const userStore = useUserStore();
assetInventorySettingsStore.initState(userStore.state.userId);

const route = useRoute();
const router = useRouter();
const serviceRouter = useServiceRouter(router);

const { referenceFieldFormatter } = useReferenceFieldFormatter();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
});

/* Main Table */
const queryTagsHelper = useQueryTags({});
queryTagsHelper.setURLQueryStringFilters(route.query.filters);
const { filters: searchFilters, urlQueryStringFilters, setQueryTags } = queryTagsHelper;
const fetchOptionState = reactive({
    pageStart: 1,
    pageLimit: assetInventorySettingsStore.getCloudServiceTablePageLimit,
    sortDesc: true,
    sortBy: 'created_at',
    queryTags: computed(() => queryTagsHelper.queryTags.value),
});

const state = reactive({
    globalFilters: computed(() => ({
        project: arrayToQueryString(cloudServiceLSBStore.getters.selectedProjects),
        service_account: arrayToQueryString(cloudServiceLSBStore.getters.selectedServiceAccounts),
    })),
});

const typeOptionState = reactive({
    loading: true,
    totalCount: 0,
    timezone: computed<string>(() => userStore.state.timezone || 'UTC'),
    selectIndex: [] as number[],
});

const tableHeight = assetInventorySettingsStore.getCloudServiceTableHeight;

interface Condition {
    key: string;
    value: ConsoleFilterValue | ConsoleFilterValue[];
    operator: ApiFilterOperator;
}

const tableState = reactive({
    schema: null as null|DynamicLayout,
    defaultFilter: computed<Condition[]|undefined>(() => tableState.schema?.options?.default_filter ?? []),
    items: [],
    selectedItems: computed(() => typeOptionState.selectIndex.map((d) => tableState.items[d])),
    consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
    multiSchema: computed<null|DynamicLayout>(() => {
        if (!tableState.schema) return null;

        const res: DynamicLayout = { ...tableState.schema };
        if (tableState.schema.options.fields) {
            res.options = {
                ...tableState.schema.options,
                fields: [{ name: 'ID', key: 'cloud_service_id' }, ...tableState.schema.options.fields],
            };
        }

        return res;
    }),
    selectedCloudServiceIds: computed(() => tableState.selectedItems.map((d) => d.cloud_service_id)),
    tableHeight: tableHeight > TABLE_MIN_HEIGHT ? tableHeight : TABLE_MIN_HEIGHT,
    visibleCustomFieldModal: false,
    dynamicTableFields: computed<DynamicField[]>(() => {
        if (!tableState.schema) return [];
        return tableState.schema.options.fields ?? [];
    }),
    hasAdminOrWorkspaceOwnerRole: computed(() => userStore.getters.hasAdminOrWorkspaceOwnerRole),
    defaultSearchQuery: [],
});

const schemaQueryHelper = new QueryHelper();
const { keyItemSets, valueHandlerMap } = useQuerySearchPropsWithSearchSchema(
    computed(() => tableState.schema?.options?.search ?? []),
    'inventory.CloudService',
    computed(() => (props.isServerPage
        ? schemaQueryHelper.setFilters([
            { k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' },
        ]).apiQuery.filter
        : schemaQueryHelper.setFilters([
            { k: 'provider', o: '=', v: props.provider },
            { k: 'cloud_service_group', o: '=', v: props.group },
            { k: 'cloud_service_type', o: '=', v: props.name },
        ]).apiQuery.filter)),
);

const hiddenFilterHelper = new QueryHelper();
const hiddenFilters = computed<ConsoleFilter[]>(() => {
    hiddenFilterHelper.setFilters([]);
    if (props.isServerPage) {
        hiddenFilterHelper.addFilter({ k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' });
    } else if (props.isSecurityPage) {
        hiddenFilterHelper.addFilter({ k: 'ref_cloud_service_type.labels', v: 'CSPM', o: '=' });
    } else {
        hiddenFilterHelper.addFilter(
            { k: 'provider', o: '=', v: props.provider },
            { k: 'cloud_service_group', o: '=', v: props.group },
            { k: 'cloud_service_type', o: '=', v: props.name },
        );
    }
    return hiddenFilterHelper.filters;
});

const overviewState = reactive({
    period: queryStringToObject(route.query.period) as Period|undefined,
});

const handleTableHeightChange = (height) => {
    tableState.tableHeight = height;
    assetInventorySettingsStore.setCloudServiceTableHeight(height);
};

const handleSelect: DynamicLayoutEventListener['select'] = (selectIndex) => {
    typeOptionState.selectIndex = selectIndex;
};

const getTableSchema = async (): Promise<null|DynamicLayout> => {
    try {
        const params: Record<string, any> = {
            schema: 'table',
        };
        if (props.isServerPage) {
            params.resource_type = 'inventory.Server';
            params.options = {
                include_workspace_info: appContextGetters.isAdminMode,
                // is_default: false,
            };
        } else {
            params.resource_type = 'inventory.CloudService';
            params.options = {
                provider: props.provider,
                cloud_service_group: props.group,
                cloud_service_type: props.name,
                include_workspace_info: appContextGetters.isAdminMode,
                // is_default: false,
            };
        }
        const response = await SpaceConnector.client.addOns.pageSchema.get(params);
        /*
        * NOTE: The storage for schema config is the same for both user and admin modes, making it difficult to distinguish data on the entry level.
        * Therefore, it is segmented as follows:
        * */
        const workspaceIndex = response.options.fields.findIndex((field) => field.name === 'Workspace');
        if (!appContextGetters.isAdminMode && workspaceIndex !== -1) {
            response.options.fields.splice(workspaceIndex, 1);
        }
        const nameIndex = response.options.fields.findIndex((field) => field.name === 'Name');
        if (props.isSecurityPage) {
            response.options.fields[nameIndex] = {
                ...response.options.fields[nameIndex],
                options: {
                    width: '28rem',
                },
            };
        }
        return response;
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

const resetSort = (schemaOptions: DynamicLayoutOptions) => {
    const defaultSort = schemaOptions.default_sort;
    if (defaultSort) {
        fetchOptionState.sortBy = defaultSort.key;
        fetchOptionState.sortDesc = defaultSort.desc ?? false;
    } else {
        fetchOptionState.sortBy = 'created_at';
        fetchOptionState.sortDesc = true;
    }
};
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

const apiQuery = new ApiQueryHelper();
const getQuery = () => {
    apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
        .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
        .setFilters(hiddenFilters.value)
        .addFilter(...cloudServiceLSBStore.getters.allFilters)
        .addFilter(...searchFilters.value);

    if (props.isSecurityPage) {
        apiQuery.addFilter({ k: 'provider', v: props.provider, o: '=' }, { k: 'cloud_service_type', v: props.name, o: '=' });
    }

    const fields = tableState.schema?.options?.fields;
    if (fields) {
        apiQuery.setOnly(...fields.map((d) => d.key).filter((d) => !d.startsWith('tags.')), 'reference.resource_id', 'reference.external_link', 'cloud_service_id', 'tags', 'provider');
    }
    return apiQuery.data;
};

const listCloudServiceTableData = async (): Promise<{items: any[]; totalCount: number}> => {
    typeOptionState.loading = true;
    try {
        const query = cloneDeep(getQuery());
        query.filter = query.filter ? query.filter.concat(tableState.defaultSearchQuery) : tableState.defaultSearchQuery;

        const res = await SpaceConnector.clientV2.inventory.cloudService.list<CloudServiceListParameters, ListResponse<CloudServiceModel>>({
            query,
        });

        // filtering select index
        typeOptionState.selectIndex = typeOptionState.selectIndex.filter((d) => !!(res.results ?? [])[d]);

        return { items: res.results ?? [], totalCount: res.total_count ?? 0 };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { items: [], totalCount: 0 };
    } finally {
        typeOptionState.loading = false;
    }
};

const fetchTableData = async (changed: DynamicLayoutFetchOptions = {}) => {
    if (changed.sortBy !== undefined) {
        fetchOptionState.sortBy = changed.sortBy;
        fetchOptionState.sortDesc = !!changed.sortDesc;
    }
    if (changed.pageLimit !== undefined) {
        fetchOptionState.pageLimit = changed.pageLimit;
        assetInventorySettingsStore.setCloudServiceTablePageLimit(changed.pageLimit);
    }
    if (changed.pageStart !== undefined) {
        fetchOptionState.pageStart = changed.pageStart;
    }
    if (changed.queryTags !== undefined) {
        queryTagsHelper.setQueryTags(changed.queryTags);
    }

    const { items, totalCount } = await listCloudServiceTableData();
    tableState.items = items;
    typeOptionState.totalCount = totalCount;
    typeOptionState.selectIndex = [];
};

// excel
const excelState = reactive({
    visible: false,
});
const excelQuery = new ApiQueryHelper()
    .setMultiSortV2([{ key: 'created_at', desc: true }]);
const exportCloudServiceData = async () => {
    if (!(props.isServerPage)) excelState.visible = true;
    else {
        const excelExportFetcher = () => {
            hiddenFilters.value.forEach((filter) => excelQuery.addFilter(filter));
            const cloudServiceExcelExportParams: ExportParameter = {
                options: [
                    {
                        name: 'Main Table',
                        query_type: QueryType.SEARCH,
                        search_query: {
                            ...excelQuery.data,
                            fields: dynamicFieldsToExcelDataFields(tableState.dynamicTableFields),
                        },
                    },
                ],
            };
            return SpaceConnector.clientV2.inventory.cloudService.export(cloudServiceExcelExportParams);
        };
        await downloadExcelByExportFetcher(excelExportFetcher);
    }
};

const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter({ ...field.extraData.reference, workspace_id: userWorkspaceStore.getters.currentWorkspaceId }, field.data);
    }
    return {};
};

const reloadTable = async () => {
    tableState.schema = await getTableSchema();
    resetSort(tableState.schema.options);
    await fetchTableData();
};

const handleClickSettings = () => {
    tableState.visibleCustomFieldModal = true;
};
const initPage = async (initQueryTags = false) => {
    if (!props.isServerPage && !props.name) return;
    if (initQueryTags) setQueryTags([]);
    tableState.schema = await getTableSchema();
    resetSort(tableState.schema.options);
    if (tableState.defaultFilter?.length) {
        queryTagsHelper.setFilters([
            ...convertToQueryTag(tableState.defaultFilter),
            ...searchFilters.value,
        ]);
    }
    await fetchTableData();
};
const initDefaultFilter = () => {
    const defaultSearchQuery = (Array.isArray(route.query.default_filters) ? route.query.default_filters : [route.query.default_filters]);
    if (defaultSearchQuery.length) {
        tableState.defaultSearchQuery = defaultSearchQuery.map((d) => (d ? JSON.parse(d) : undefined))
            .filter((d) => d);
    }
};
const initExcelFilter = () => {
    excelQuery.setFiltersAsRawQueryString(route.query.filters);
    excelQuery.addFilter(...cloudServiceLSBStore.getters.allFilters);
};

/* Actions */
const handleDynamicLayoutFetch = (changed: ToolboxOptions = {}) => {
    if (changed.queryTags !== undefined) {
        apiQuery.setFiltersAsQueryTag(changed.queryTags);
        excelQuery.setFiltersAsQueryTag(changed.queryTags);
        cloudServiceDetailPageStore.$patch((_state) => {
            _state.searchFilters = excelQuery.filters;
        });
    }
    if (tableState.schema === null) return;
    fetchTableData(changed);
};
const handleClickConnectToConsole = () => { window.open(tableState.consoleLink, '_blank'); };

/* Usage Overview */
const handleDeletePeriodFilter = () => {
    overviewState.period = undefined;
    replaceUrlQuery('period', undefined);
};
const handleCustomFieldModalVisibleUpdate = (visible) => {
    tableState.visibleCustomFieldModal = visible;
};

const checkIsEmpty = (data) => isEmpty(data);

const handleUpdateVisible = (visible) => {
    excelState.visible = visible;
};

const handleClearDefaultFilter = async () => {
    tableState.defaultSearchQuery = [];
    replaceUrlQuery('default_filters', undefined);
    await fetchTableData();
};

// set global filters to url query
const initGlobalFilters = (): boolean => {
    let _initPage = false;
    const routeQueryString = route.query ?? '';
    const urlQueryString = {
        ...state.globalFilters,
        filters: urlQueryStringFilters.value,
    };
    if (JSON.stringify(urlQueryString) !== JSON.stringify(routeQueryString)) {
        replaceUrlQuery(urlQueryString);
        _initPage = true;
    }
    return _initPage;
};
/* Watchers */
watch(() => state.globalFilters, () => {
    const _initPage = initGlobalFilters();
    if (_initPage) initPage();
}, { immediate: true });

watch(() => keyItemSets.value, (after) => {
    // initiate queryTags with keyItemSets
    queryTagsHelper.setKeyItemSets(after);
}, { immediate: true });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
debouncedWatch([() => props.group, () => props.name, () => props.provider], async () => {
    initGlobalFilters(); // maintain global filters when changing service menu
    await initPage(true);
});


const ApiQueryToRawQueryMap = {
    eq: '=',
    not: '!=',
} as const;
const convertToQueryTag = (filter: Condition[]): ConsoleFilter[] => filter.map((condition) => ({
    k: condition.key,
    v: condition.value,
    o: ApiQueryToRawQueryMap[condition.operator] ?? '=',
}));

(async () => {
    initDefaultFilter();
    initExcelFilter();

    const urlQueryValue = {
        project: queryStringToArray(route.query.project),
        service_account: queryStringToArray(route.query.service_account),
    };
    cloudServiceLSBStore.setSelectedProjectsToFilters(urlQueryValue.project);
    cloudServiceLSBStore.setSelectedServiceAccountsToFilters(urlQueryValue.service_account);
    cloudServiceDetailPageStore.$patch((_state) => {
        _state.searchFilters = searchFilters.value;
    });

    await initPage();
})();
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading v-if="props.isServerPage"
                           :title="$t('INVENTORY.SERVER.MAIN.TITLE')"
                           use-total-count
                           use-selected-count
                           :total-count="typeOptionState.totalCount"
                           :selected-count="tableState.selectedItems.length"
                           @click-back-button="$router.go(-1)"
                />
                <p-heading v-else-if="props.isSecurityPage"
                           :title="props.provider ? `[${allReferenceGetters.provider[props.provider].label}] ${props.name}` : $t('INVENTORY.SECURITY.MAIN.TITLE')"
                           use-total-count
                           use-selected-count
                           :total-count="typeOptionState.totalCount"
                           :selected-count="tableState.selectedItems.length"
                           @click-back-button="$router.go(-1)"
                />
                <p-heading v-else
                           :title="props.name"
                           show-back-button
                           use-total-count
                           use-selected-count
                           :total-count="typeOptionState.totalCount"
                           :selected-count="tableState.selectedItems.length"
                           @click-back-button="$router.go(-1)"
                />
            </template>
            <template #extra>
                <cloud-service-metric-button v-if="props.isServerPage"
                                             go-to-metric-server-page
                />
                <cloud-service-metric-button v-else-if="!props.isSecurityPage"
                                             :provider="props.provider"
                                             :group="props.group"
                                             :name="props.name"
                />
            </template>
        </p-heading-layout>
        <div v-if="!checkIsEmpty(overviewState.period)"
             class="filter-wrapper"
        >
            <span class="filter-title">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTER') }}</span>
            <cloud-service-period-filter :period="overviewState.period"
                                         @delete-period="handleDeletePeriodFilter"
            />
        </div>
        <p-horizontal-layout :min-height="TABLE_MIN_HEIGHT"
                             :height="tableState.tableHeight"
                             @resize-end="handleTableHeightChange"
        >
            <template #container="{ height }">
                <template v-if="tableState.schema">
                    <p-dynamic-layout type="query-search-table"
                                      :options="tableState.schema.options"
                                      :data="tableState.items"
                                      :fetch-options="fetchOptionState"
                                      :type-options="{
                                          loading: typeOptionState.loading,
                                          totalCount: typeOptionState.totalCount,
                                          timezone: typeOptionState.timezone,
                                          selectIndex: typeOptionState.selectIndex,
                                          selectable: true,
                                          colCopy: false,
                                          settingsVisible: true,
                                          keyItemSets: keyItemSets,
                                          valueHandlerMap: valueHandlerMap
                                      }"
                                      :style="{height: `${height}px`}"
                                      :field-handler="fieldHandler"
                                      @fetch="handleDynamicLayoutFetch"
                                      @select="handleSelect"
                                      @export="exportCloudServiceData"
                                      @click-settings="handleClickSettings"
                    >
                        <template #toolbox-bottom>
                            <div v-if="tableState.defaultSearchQuery.length"
                                 class="default-filter"
                            >
                                <i18n path="INVENTORY.SERVER.MAIN.DEFAULT_FILTER_DESC"
                                      tag="p"
                                      class="desc"
                                >
                                    <template #count>
                                        <strong>{{ tableState.defaultSearchQuery.length }}</strong>
                                    </template>
                                </i18n><p-text-button class="ml-1"
                                                      style-type="highlight"
                                                      size="sm"
                                                      @click="handleClearDefaultFilter"
                                >
                                    {{ $t('INVENTORY.SERVER.MAIN.CLEAR') }}
                                </p-text-button>
                            </div>
                        </template>
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
                        <template #col-provider-format="{value}">
                            <p-badge v-if="storeState.providers[value]"
                                     :background-color="storeState.providers[value]?.color"
                                     text-color="white"
                            >
                                {{ storeState.providers[value]?.label }}
                            </p-badge>
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
                        <template v-if="!props.isSecurityPage"
                                  #toolbox-left
                        >
                            <p-button style-type="secondary"
                                      :disabled="!tableState.consoleLink || tableState.selectedItems.length > 1"
                                      icon-right="ic_external-link"
                                      @click="handleClickConnectToConsole"
                            >
                                {{ $t('INVENTORY.SERVER.MAIN.CONSOLE') }}
                            </p-button>
                        </template>
                        <!--                        <template v-if="!props.isServerPage &&!props.isSecurityPage"-->
                        <!--                                  #toolbox-bottom-->
                        <!--                        >-->
                        <!--                            <div class="mb-3">-->
                        <!--                                <p-divider />-->
                        <!--                            </div>-->
                        <!--                            <cloud-service-usage-overview :cloud-service-type-info="cloudServiceDetailPageState.selectedCloudServiceType"-->
                        <!--                                                          :filters="searchFilters"-->
                        <!--                                                          :hidden-filters="hiddenFilters"-->
                        <!--                                                          :period="overviewState.period"-->
                        <!--                                                          :key-item-sets="keyItemSets"-->
                        <!--                            />-->
                        <!--                        </template>-->
                    </p-dynamic-layout>
                </template>
            </template>
        </p-horizontal-layout>
        <cloud-service-detail-tabs :table-state="tableState"
                                   :field-handler="fieldHandler"
                                   :group="props.group"
                                   :name="props.name"
                                   :is-security-page="props.isSecurityPage"
                                   :is-server-page="props.isServerPage"
                                   :selected-index="typeOptionState.selectIndex.length ?? 0"
                                   :timezone="typeOptionState.timezone ?? 'UTC'"
        />
        <custom-field-modal-for-dynamic-layout :visible="tableState.visibleCustomFieldModal"
                                               resource-type="inventory.CloudService"
                                               :options="{
                                                   provider: props.provider,
                                                   cloudServiceGroup: props.group,
                                                   cloudServiceType: props.name,
                                                   include_workspace_info: appContextGetters.isAdminMode,
                                               }"
                                               :is-server-page="props.isServerPage"
                                               @update:visible="handleCustomFieldModalVisibleUpdate"
                                               @complete="reloadTable"
        />
        <excel-export-option-modal :visible="excelState.visible"
                                   :cloud-service-id="tableState.items[0]?.cloud_service_id"
                                   :hidden-filters="hiddenFilters"
                                   :cloud-service-list-fields="tableState.dynamicTableFields"
                                   :default-filter="tableState.defaultSearchQuery"
                                   @update:visible="handleUpdateVisible"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-horizontal-layout */
:deep(.p-horizontal-layout) .horizontal-contents {
    overflow: unset;
}

.default-filter {
    @apply flex items-end;
    padding: 0 1.5rem 1rem 1.5rem;
    margin-top: -0.5rem;

    .desc {
        @apply text-label-md text-gray-900;
    }
}

.filter-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.filter-title {
    @apply text-gray-600;
    font-size: 0.875rem;
    margin-right: 0.5rem;
}

.left-toolbox-item {
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}

.selected-data-tab {
    @apply mt-8;
}

/* custom design-system component - p-dynamic-layout */

/* custom design-system component - p-dynamic-layout-query-search-table */
:deep(.p-dynamic-layout-query-search-table) .p-toolbox-table {
    @apply border border-gray-200 rounded-lg;
    .p-data-table {
        min-height: unset;
    }
    .report-link {
        @apply flex items-center text-gray-900;
        gap: 0.25rem;
    }
    .tr-selected {
        .report-link {
            @apply text-blue-700;
        }
    }
}

/* custom design-system component - p-tab */
:deep(.p-tab) {
    @apply rounded-lg;
    &.monitoring {
        .tab-pane {
            @apply bg-secondary2;
        }
    }
}

@screen mobile {
    /* custom design-system component - p-horizontal-layout */
    :deep(.p-horizontal-layout) {
        .horizontal-contents {
            height: 50rem !important;
        }
    }

    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-dynamic-layout-query-search-table */
    :deep(.p-dynamic-layout-query-search-table) {
        height: 50rem !important;
    }
}
</style>
