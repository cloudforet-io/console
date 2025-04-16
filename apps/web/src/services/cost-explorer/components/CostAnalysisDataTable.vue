<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';
import {
    cloneDeep, find, lowerCase, sortBy,
} from 'lodash';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButtonModal,
    PI,
    PToolboxTable,
    PTextPagination,
    PCollapsibleToggle,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';
import { numberFormatter } from '@cloudforet/utils';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';
import type { RegionReferenceMap } from '@/store/reference/region-reference-store';
import type { ServiceAccountReferenceMap } from '@/store/reference/service-account-reference-store';
import type { WorkspaceReferenceMap } from '@/store/reference/workspace-reference-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';
import { usageUnitFormatter } from '@/lib/helper/usage-formatter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    GRANULARITY,
    GROUP_BY,
    GROUP_BY_ITEM_MAP,
    ADDITIONAL_GROUP_BY,
    ADDITIONAL_GROUP_BY_ITEM_MAP,
} from '@/services/cost-explorer/constants/cost-explorer-constant';
import {
    getDataTableCostFields,
    getTimeUnitByGranularity,
} from '@/services/cost-explorer/helpers/cost-analysis-data-table-helper';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type {
    Granularity,
    Period,
    DisplayDataType,
} from '@/services/cost-explorer/types/cost-explorer-query-type';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

type CostAnalyzeRawData = {
  [groupBy: string]: string | any;
  value_sum?: Array<{
    date: string;
    value: number | null;
  }>;
  usage_unit?: string;
  _total_value_sum?: number;
};

const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
const allReferenceStore = useAllReferenceStore();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageGetters = costAnalysisPageStore.getters;
const costAnalysisPageState = costAnalysisPageStore.state;
const router = useRouter();

const { getReferenceLocation } = useReferenceRouter();

const getValueSumKey = (dataType: string) => {
    switch (dataType) {
    case 'cost':
        return costAnalysisPageGetters.isUnifiedCost
            ? `cost.${costAnalysisPageGetters.currency}`
            : 'cost';
    case 'usage':
        return 'usage_quantity';
    default:
        return `data.${dataType}`;
    }
};

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStore.getters.currentWorkspaceId),
    projects: computed<ProjectReferenceMap>(
        () => allReferenceStore.getters.project,
    ),
    projectGroups: computed<ProjectGroupReferenceMap>(
        () => allReferenceStore.getters.projectGroup,
    ),
    providers: computed<ProviderReferenceMap>(
        () => allReferenceStore.getters.provider,
    ),
    regions: computed<RegionReferenceMap>(() => allReferenceStore.getters.region),
    serviceAccounts: computed<ServiceAccountReferenceMap>(
        () => allReferenceStore.getters.serviceAccount,
    ),
    workspaces: computed<WorkspaceReferenceMap>(
        () => allReferenceStore.getters.workspace,
    ),
});
const state = reactive({
    component: computed(() => PToolboxTable),
    timeUnit: computed(() => getTimeUnitByGranularity(costAnalysisPageState.granularity)),
    dateFormat: computed(() => {
        if (costAnalysisPageState.granularity === GRANULARITY.MONTHLY) return 'YYYY-MM';
        if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) return 'YYYY';
        return 'YYYY-MM-DD';
    }),
    //
    visibleExcelNotiModal: false,
    isIncludedUsageTypeInGroupBy: computed<boolean>(() => costAnalysisPageState.groupBy.includes(GROUP_BY.USAGE_TYPE)),
    analyzeQuery: computed(() => {
        let dateFormat = 'YYYY-MM';
        if (costAnalysisPageState.granularity === GRANULARITY.YEARLY) dateFormat = 'YYYY';
        const groupBy = state.isIncludedUsageTypeInGroupBy
            ? [...costAnalysisPageState.groupBy, 'usage_unit']
            : costAnalysisPageState.groupBy;
        const fields = {
            value_sum: {
                key: getValueSumKey(costAnalysisPageState.displayDataType),
                operator: 'sum',
            },
        };
        return {
            granularity: costAnalysisPageState.granularity,
            group_by: groupBy,
            start: dayjs.utc(costAnalysisPageState.period?.start).format(dateFormat),
            end: dayjs.utc(costAnalysisPageState.period?.end).format(dateFormat),
            fields,
            sort: [{ key: '_total_value_sum', desc: true }],
            field_group: ['date'],
        };
    }),
    analyzeFetcher: computed(() => (costAnalysisPageGetters.isUnifiedCost
        ? unifiedCostAnalyze
        : fetchCostAnalyze)),
    visibleGroupByItems: computed<MenuItem[]>(() => costAnalysisPageGetters.visibleGroupByItems),
});
const tableState = reactive({
    loading: true,
    excelFields: computed<ExcelDataField[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (costAnalysisPageState.groupBy.length) fields.push(...tableState.groupByFields);
        if (
            state.isIncludedUsageTypeInGroupBy
      && costAnalysisPageState.displayDataType === 'usage'
        ) {
            fields.push({
                name: 'usage_unit',
                label: 'Usage Unit',
                textAlign: 'right',
                sortable: false,
            });
        }
        fields.push(...tableState.costFields);
        return fields.map((d) => {
            const field: ExcelDataField = { key: d.name, name: d.label ?? '' };
            if (d.name === GROUP_BY.WORKSPACE) {
                field.reference = {
                    reference_key: 'workspace_id',
                    resource_type: 'identity.Workspace',
                };
            }
            if (d.name === GROUP_BY.PROJECT) {
                field.reference = {
                    reference_key: 'project_id',
                    resource_type: 'identity.Project',
                };
            }
            if (d.name === GROUP_BY.SERVICE_ACCOUNT) {
                field.reference = {
                    reference_key: 'service_account_id',
                    resource_type: 'identity.ServiceAccount',
                };
            }
            if (d.name === GROUP_BY.REGION) {
                field.reference = {
                    reference_key: 'region_code',
                    resource_type: 'inventory.Region',
                };
            }
            if (d.name === GROUP_BY.PROVIDER) {
                field.reference = {
                    reference_key: 'provider',
                    resource_type: 'identity.Provider',
                };
            }
            return field;
        });
    }),
    groupByFields: computed<DataTableFieldType[]>(() => costAnalysisPageState.groupBy.map((d) => {
        if (GROUP_BY_ITEM_MAP[d]) {
            return {
                ...GROUP_BY_ITEM_MAP[d],
                sortable: false,
            };
        }
        return {
            name: d.split('.')[1],
            label: d.split('.')[1], // tags.Name -> Name
            isTagField: true,
            sortable: false,
        };
    })),
    costFields: [] as DataTableFieldType[],
    fields: computed<DataTableFieldType[]>(() => {
        const fields: DataTableFieldType[] = [];
        if (costAnalysisPageState.groupBy.length) fields.push(...tableState.groupByFields);
        if (
            state.isIncludedUsageTypeInGroupBy
      && costAnalysisPageState.displayDataType === 'usage'
        ) {
            fields.push({
                name: 'usage_unit',
                label: 'Usage Unit',
                textAlign: 'right',
                sortable: false,
            });
        }
        fields.push(...tableState.costFields);
        return fields;
    }),
    items: undefined as CostAnalyzeRawData[] | undefined,
    thisPage: 1,
    pageSize: 15,
    more: false,
    showFormattedData: true,
});

/* util */
const isIncreasedByHalfOrMore = (
    item: CostAnalyzeRawData,
    fieldName: string,
): boolean => {
    const currIndex = Number(fieldName.split('.')[1]); // value_sum.0.value -> 0
    if (currIndex === 0) return false;

    const prevIndex = currIndex - 1;
    const currValue = item.value_sum?.[currIndex]?.value ?? 0;
    const prevValue = item.value_sum?.[prevIndex]?.value ?? 0;

    if (currValue < prevValue) return false;
    if (currValue > 0) {
        if (prevValue < 0) return true;
        if (currValue - prevValue > 0) return ((currValue - prevValue) / currValue) * 100 >= 50;
    }
    if (currValue < 0 && currValue > prevValue) {
        return currValue * 2 >= prevValue;
    }
    return false;
};
const fieldDescriptionFormatter = (field: DataTableFieldType): string => {
    if (field.name?.startsWith(`${ADDITIONAL_GROUP_BY.TAGS}_`)) {
        return ` (${ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.TAGS].label})`;
    }
    if (field.name?.startsWith(`${ADDITIONAL_GROUP_BY.ADDITIONAL_INFO}_`)) {
        return ` (${
            ADDITIONAL_GROUP_BY_ITEM_MAP[ADDITIONAL_GROUP_BY.ADDITIONAL_INFO].label
        })`;
    }
    return '';
};
const getRefinedChartTableData = (
    results: CostAnalyzeRawData[] = [],
    granularity: Granularity,
    period: Period,
) => {
    const timeUnit = getTimeUnitByGranularity(granularity);
    let dateFormat = 'YYYY-MM-DD';
    if (timeUnit === 'month') dateFormat = 'YYYY-MM';
    else if (timeUnit === 'year') dateFormat = 'YYYY';

    // HACK: will be removed after refactoring period
    const _period = cloneDeep(period);
    if (granularity === GRANULARITY.DAILY) {
        _period.start = dayjs.utc(period.start).format('YYYY-MM-01');
        _period.end = dayjs.utc(period.end).endOf('month').format('YYYY-MM-DD');
    }

    const _results: CostAnalyzeRawData[] = cloneDeep(results);
    const refinedTableData: CostAnalyzeRawData[] = [];
    const today = dayjs.utc();
    _results.forEach((d) => {
        let target = cloneDeep(d.value_sum);
        let now = dayjs.utc(_period.start).clone();
        while (now.isSameOrBefore(dayjs.utc(_period.end), timeUnit)) {
            if (
                !now.isAfter(today, timeUnit)
        && !find(target, { date: now.format(dateFormat) })
            ) {
                target?.push({ date: now.format(dateFormat), value: 0 });
            }
            now = now.add(1, timeUnit);
        }
        target = sortBy(target, ['date']);
        refinedTableData.push({
            ...d,
            value_sum: target,
        });
    });
    return refinedTableData;
};
const getTableValue = (
    displayDataType: DisplayDataType,
    showFormattedData: boolean,
    value?: number,
    usageUnit?: string,
): string | undefined => {
    if (value === undefined) return value;
    if (displayDataType === 'usage') {
        return usageUnitFormatter(value, { unit: usageUnit }, showFormattedData);
    }
    if (showFormattedData) {
        return numberFormatter(value, { notation: 'compact' });
    }
    return numberFormatter(value, { minimumFractionDigits: 2 });
};

/* api */
const fetchCostAnalyze = getCancellableFetcher<
  object,
  AnalyzeResponse<CostAnalyzeRawData>
>(SpaceConnector.clientV2.costAnalysis.cost.analyze);
const unifiedCostAnalyze = getCancellableFetcher<
  object,
  AnalyzeResponse<CostAnalyzeRawData>
>(SpaceConnector.clientV2.costAnalysis.unifiedCost.analyze);
const analyzeApiQueryHelper = new ApiQueryHelper().setPage(1, 15);
const listCostAnalysisTableData = async (): Promise<
  AnalyzeResponse<CostAnalyzeRawData>
> => {
    try {
        tableState.loading = true;
        analyzeApiQueryHelper
            .setFilters(costAnalysisPageGetters.consoleFilters)
            .setPage(
                getPageStart(tableState.thisPage, tableState.pageSize),
                tableState.pageSize,
            );
        const { status, response } = await state.analyzeFetcher({
            data_source_id: costAnalysisPageGetters.isUnifiedCost
                ? undefined
                : costAnalysisPageGetters.selectedDataSourceId,
            query: {
                ...state.analyzeQuery,
                ...analyzeApiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return { more: false, results: [] };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    } finally {
        tableState.loading = false;
    }
};
const costAnalyzeExportQueryHelper = new QueryHelper();
const listCostAnalysisExcelData = async (): Promise<CostAnalyzeRawData[]> => {
    try {
        costAnalyzeExportQueryHelper.setFilters(
            costAnalysisPageGetters.consoleFilters,
        );
        const { status, response } = await state.analyzeFetcher({
            data_source_id: costAnalysisPageGetters.isUnifiedCost
                ? undefined
                : costAnalysisPageGetters.selectedDataSourceId,
            query: {
                ...state.analyzeQuery,
                filter: costAnalyzeExportQueryHelper.apiQuery.filter,
            },
        });
        if (status === 'succeed') return response.results ?? [];
        return [];
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

/* event */
const handleClickRowData = (fieldName: string, value: string) => {
    if (!fieldName || !value) return;

    let _routeName: string;
    let _params = {};

    if (storeState.isAdminMode) return;
    if (fieldName === GROUP_BY.PROJECT) {
        const { name, params } = getReferenceLocation(value, { resource_type: 'identity.Project' });
        _routeName = name || PROJECT_ROUTE_V2._NAME;
        _params = params || {};
    }
    if (fieldName === GROUP_BY.SERVICE_ACCOUNT) {
        _routeName = SERVICE_ACCOUNT_ROUTE.DETAIL._NAME;
        _params = { serviceAccountId: value, workspaceId: storeState.currentWorkspaceId };
    }

    if (!_routeName) return;

    window.open(router.resolve({
        name: _routeName,
        params: _params,
    }).href, '_blank');
};
const handleChange = async (options: any = {}) => {
    setApiQueryWithToolboxOptions(analyzeApiQueryHelper, options, {
        queryTags: true,
    });
    const { results, more } = await listCostAnalysisTableData();
    if (costAnalysisPageState.period) {
        tableState.items = getRefinedChartTableData(
            results,
            costAnalysisPageState.granularity,
            costAnalysisPageState.period,
        );
    }
    tableState.more = more ?? false;
};
const handleExcelDownload = async () => {
    try {
        const results = await listCostAnalysisExcelData();
        const refinedData = getRefinedChartTableData(
            results,
            costAnalysisPageState.granularity,
            costAnalysisPageState.period ?? {},
        );
        await downloadExcel({
            data: refinedData,
            fields: tableState.excelFields,
            file_name_prefix: FILE_NAME_PREFIX.costAnalysis,
            version: 'v2',
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.visibleExcelNotiModal = false;
    }
};
const handleExport = async () => {
    await handleExcelDownload();
};
const handleUpdateThisPage = async () => {
    const { results, more } = await listCostAnalysisTableData();
    tableState.items = getRefinedChartTableData(
        results,
        costAnalysisPageState.granularity,
        costAnalysisPageState.period ?? {},
    );
    tableState.more = more ?? false;
};

const reduce = (arr: (number & undefined)[] | any) => arr.reduce((acc, value) => acc + (value ?? 0), 0);

watch(
    [
        () => costAnalysisPageState,
        () => costAnalysisPageGetters.selectedDataSourceId,
        () => costAnalysisPageGetters.selectedQueryId,
        () => costAnalysisPageGetters.isUnifiedCost,
    ],
    async ([, selectedDataSourceId]) => {
        if (!selectedDataSourceId) return;
        tableState.thisPage = 1;
        const { results, more } = await listCostAnalysisTableData();
        if (costAnalysisPageState.period) {
            tableState.items = getRefinedChartTableData(
                results,
                costAnalysisPageState.granularity,
                costAnalysisPageState.period,
            );
            tableState.more = more ?? false;
            tableState.costFields = getDataTableCostFields(
                costAnalysisPageState.granularity,
                costAnalysisPageState.period,
                !!tableState.groupByFields.length,
            );
        }
    },
    { immediate: true, deep: true },
);
</script>

<template>
    <fragment>
        <p-toolbox-table
            class="cost-analysis-data-table"
            :loading="tableState.loading"
            :fields="tableState.fields"
            :items="tableState.items"
            :searchable="false"
            :show-footer="true"
            :page-size.sync="tableState.pageSize"
            row-height-fixed
            exportable
            @change="handleChange"
            @refresh="handleChange()"
            @export="handleExport"
        >
            <template #pagination-area>
                <p-text-pagination
                    :this-page.sync="tableState.thisPage"
                    :disable-next-page="tableState.loading"
                    :has-next-page="tableState.more"
                    @update:thisPage="handleUpdateThisPage"
                />
            </template>
            <template #toolbox-left>
                <div class="toggle-wrapper">
                    <span class="label">{{
                        $t("BILLING.COST_MANAGEMENT.COST_ANALYSIS.ORIGINAL_DATA")
                    }}</span>
                    <p-collapsible-toggle
                        :toggle-type="'switch'"
                        :is-collapsed.sync="tableState.showFormattedData"
                        class="collapsible-toggle"
                    />
                </div>
            </template>
            <template #th-format="{ field }">
                {{ field.label }}
                <span class="field-description">{{
                    fieldDescriptionFormatter(field)
                }}</span>
            </template>
            <template #col-format="{ field, value, item }">
                <span v-if="tableState.loading" />
                <span
                    v-else-if="Object.values(GROUP_BY).includes(field.name) && !value"
                >
                    Unknown
                </span>
                <span v-else-if="field.name === GROUP_BY.WORKSPACE">
                    {{
                        storeState.workspaces[value]
                            ? storeState.workspaces[value].label
                            : value
                    }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROJECT_GROUP">
                    {{
                        storeState.projectGroups[value]
                            ? storeState.projectGroups[value].label
                            : value
                    }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROJECT"
                      class="cursor-pointer"
                      @click="handleClickRowData(field.name, value)"
                >
                    {{
                        storeState.projects[value]
                            ? storeState.projects[value].label
                            : value
                    }}
                </span>
                <span v-else-if="field.name === GROUP_BY.PROVIDER">
                    {{
                        storeState.providers[value]
                            ? storeState.providers[value].name
                            : value
                    }}
                </span>
                <span v-else-if="field.name === GROUP_BY.REGION">
                    {{
                        storeState.regions[value] ? storeState.regions[value].name : value
                    }}
                </span>
                <span v-else-if="field.name === GROUP_BY.SERVICE_ACCOUNT"
                      class="cursor-pointer"
                      @click="handleClickRowData(field.name, value)"
                >
                    {{
                        storeState.serviceAccounts[value]
                            ? storeState.serviceAccounts[value].name
                            : value
                    }}
                </span>
                <span v-else-if="field.name === 'Instance Type'">
                    {{ value ?? "Unknown" }}
                </span>
                <span v-else-if="field.name === 'totalCost'">
                    {{ $t("BILLING.COST_MANAGEMENT.COST_ANALYSIS.TOTAL_COST") }}
                </span>
                <span v-else-if="field.isTagField">
                    {{ value ?? "Unknown" }}
                </span>
                <span v-else-if="field.name === 'usage_unit'">
                    {{ value ?? "--" }}
                </span>
                <span v-else-if="typeof value !== 'string'"
                      class="text-center"
                >

                    <span class="usage-wrapper">
                        <span
                            :class="
                                isIncreasedByHalfOrMore(item, field.name)
                                    ? 'cell-text raised'
                                    : undefined
                            "
                        >
                            {{
                                getTableValue(
                                    costAnalysisPageState.displayDataType,
                                    tableState.showFormattedData,
                                    value,
                                    item.usage_unit
                                )
                            }}
                        </span>
                        <p-i
                            v-if="isIncreasedByHalfOrMore(item, field.name)"
                            name="ic_arrow-up-bold-alt"
                            width="0.75rem"
                            height="0.75rem"
                        />
                    </span>
                </span>
            </template>
            <template
                #tf-col-format="{field, colIndex, values}"
            >
                <span v-if="colIndex === 0">Total</span>
                <span v-else-if="tableState.showFormattedData && field.name !== 'usage_unit'
                    && (!tableState.groupByFields.map(item => lowerCase(item.name)).includes(lowerCase(field.name)))
                    && (!tableState.groupByFields.map(item => lowerCase(item.label)).includes(lowerCase(field.name)))"
                >
                    {{ Array.isArray(values) && values.length > 0 ? numberFormatter(reduce(values), {notation: 'compact'}) : 0 }}
                </span>
                <span v-else-if="!tableState.showFormattedData && field.name !== 'usage_unit'
                    && (!tableState.groupByFields.map(item => lowerCase(item.name)).includes(lowerCase(field.name))
                        && !tableState.groupByFields.map(item => lowerCase(item.label)).includes(lowerCase(field.name)))"
                >
                    {{ Array.isArray(values) && values.length > 0 ? numberFormatter(reduce(values), {minimumFractionDigits: 2}) : 0 }}
                </span>
                <span v-else />
            </template>
        </p-toolbox-table>
        <p-button-modal
            :visible.sync="state.visibleExcelNotiModal"
            hide-header
            size="sm"
            @confirm="handleExcelDownload"
        >
            <template #body>
                <p class="mt-4">
                    {{
                        $t(
                            "BILLING.COST_MANAGEMENT.COST_ANALYSIS.ALT_EXCEL_DOWNLOAD_STACKED"
                        )
                    }}
                </p>
            </template>
            <template #confirm-button>
                {{ $t("BILLING.COST_MANAGEMENT.COST_ANALYSIS.DOWNLOAD") }}
            </template>
        </p-button-modal>
    </fragment>
</template>

<style lang="postcss" scoped>
.cost-analysis-data-table {
    .field-description {
        @apply text-gray-400;
        white-space: pre;
        display: flex;
    }
    .cell-text {
        &.raised {
            @apply text-alert;
        }
    }
    .toggle-wrapper {
        display: flex;
        align-items: center;
        .label {
            @apply text-label-md;
            font-weight: 700;
            padding-right: 0.5rem;
        }
    }
    .usage-wrapper {
        display: inline-flex;
        align-items: center;
    }
    .no-link {
        /* custom design-system component - p-link */
        :deep(.p-link) {
            @apply cursor-auto;
        }
    }
}
</style>
