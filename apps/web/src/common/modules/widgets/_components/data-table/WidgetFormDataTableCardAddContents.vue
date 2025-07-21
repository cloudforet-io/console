<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import {
    cloneDeep, isArray, isEqual, uniq,
} from 'lodash';

import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import type { MetricLabelKey } from '@/api-clients/inventory/metric/schema/type';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormDataTableCardAddForm from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardAddForm.vue';
import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardSourceForm
    from '@/common/modules/widgets/_components/data-table/WidgetFormDataTableCardSourceForm.vue';
import { useDataTableDeleteMutation } from '@/common/modules/widgets/_composables/data-table/mutations/use-data-table-delete-mutation';
import { useDataTableUpdateMutation } from '@/common/modules/widgets/_composables/data-table/mutations/use-data-table-update-mutation';
import {
    useDataTableCascadeUpdate,
} from '@/common/modules/widgets/_composables/data-table/use-data-table-cascade-update';
import { useDataTableRelatedLoadQueryInvalidator } from '@/common/modules/widgets/_composables/data-table/use-data-table-related-invalidator';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/data-table/use-widget-data-table-list-query';
import { useMetricQueryFetcher } from '@/common/modules/widgets/_composables/use-metric-query-fetcher';
import { useWidgetUpdateMutation } from '@/common/modules/widgets/_composables/widget/mutations/use-widget-update-mutation';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/widget/use-widget-query';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_OPERATOR,
    DATA_TABLE_TYPE, GROUP_BY_INFO_ITEMS_FOR_TAGS,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableAlertModalMode, DataTableFormContentsExpose, DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableAddOptions,
    DataTableQueryFilter, TimeDiff, CostOptions,
    DataTableGroupByInfo,
    UnifiedCostOptions,
    AssetOptions,
} from '@/common/modules/widgets/types/widget-model';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';




interface Props {
    selected: boolean;
    item: DataTableModel;
    loading?: boolean;
}
type GroupByItem = { name: string; label: string; tags?: string[] };

const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const referenceMap = useAllReferenceDataModel();
const metricMap = referenceMap.metric;

/* Query */
const {
    widget,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    cascadeUpdateDataTable,
} = useDataTableCascadeUpdate({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    isPrivate: computed(() => widgetGenerateState.widgetId?.startsWith('private')),
    loading: false,
    dataTableId: computed(() => props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => metricMap[state.metricId]?.data?.namespace_id ?? ''), // ASSET only
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as GroupByItem[],
    selectedGroupByTagsMap: {
        [GROUP_BY.PROJECT]: [],
        [GROUP_BY.REGION]: [],
    } as Record<string, { name: string; label: string }[]>,
    filter: {} as Record<string, DataTableQueryFilter>,
    dataFieldName: '',
    dataUnit: '',
    filterFormKey: getRandomId(),
    failStatus: false,
    isUnavailable: computed<boolean>(() => props.item.state === 'UNAVAILABLE'),
});

const dataTableNameState = reactive({
    dataTableName: props.item.name ?? '',
});

const advancedOptionsState = reactive({
    selectedTimeDiff: 'none',
    selectedTimeDiffDate: undefined as string|undefined,
    timeDiffDataName: '' as string,
});

const validationState = reactive({
    dataTableApplyInvalid: false,
});

const originDataState = reactive({
    sourceKey: computed(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) return props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key;
        if (state.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) return 'cost';
        return props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id;
    }),
    groupBy: computed(() => ((props.item.options as DataTableAddOptions).group_by ?? []).map((group) => ({
        name: group.key,
        label: group.name,
        tags: group.tags,
    }))),
    groupByTagsMap: computed(() => {
        const _groupByTagsMap = {
            [GROUP_BY.PROJECT]: [],
            [GROUP_BY.REGION]: [],
        } as Record<string, { name: string; label: string }[]>;
        ((props.item.options as DataTableAddOptions).group_by ?? []).forEach((group) => {
            const isGroupByTags = GROUP_BY_INFO_ITEMS_FOR_TAGS.some((tag) => tag.key === group.key);
            if (isGroupByTags) {
                const tagsMenu = group.tags?.map((tag) => ({ name: tag, label: tag }));
                _groupByTagsMap[group.key as string] = tagsMenu || [];
            }
        });
        return _groupByTagsMap;
    }),
    filter: computed<Record<string, DataTableQueryFilter>>(() => {
        const _filter = {} as Record<string, DataTableQueryFilter>;
        ((props.item.options as DataTableAddOptions).filter ?? []).forEach((filter) => {
            _filter[filter.k] = filter;
        });
        return _filter;
    }),
    dataName: computed(() => (props.item.options as DataTableAddOptions).data_name ?? ''),
    dataUnit: computed(() => (props.item.options as DataTableAddOptions).data_unit ?? ''),
    timeDiff: computed<string>(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        const timeDiffKeys = Object.keys(timeDiff || {}).filter((key) => key !== 'data_name');
        return timeDiffKeys.length ? timeDiffKeys[0] : 'none';
    }),
    timeDiffDate: computed<string|undefined>(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff || {};
        const timeDiffKeys = Object.keys(timeDiff || {}).filter((key) => key !== 'data_name');
        return timeDiffKeys.length ? `${-timeDiff[timeDiffKeys[0]]}` : undefined;
    }),
    timeDiffDataName: computed<string>(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        return timeDiff?.data_name || '';
    }),
});

const optionChanged = computed<boolean>(() => {
    const sourceKeyChanged = state.sourceType !== DATA_SOURCE_DOMAIN.UNIFIED_COST && state.selectedSourceEndItem !== originDataState.sourceKey;
    const groupByChanged = !isEqual(state.selectedGroupByItems, originDataState.groupBy);
    const groupByTagsChanged = !isEqual(state.selectedGroupByTagsMap, originDataState.groupByTagsMap);
    const filterChanged = !isEqual(state.filter, originDataState.filter);
    const dataTableNameChanged = state.dataFieldName !== originDataState.dataName;
    const dataUnitChanged = state.dataUnit !== originDataState.dataUnit;
    const timeDiffChanged = advancedOptionsState.selectedTimeDiff !== originDataState.timeDiff;
    const timeDiffDateChanged = advancedOptionsState.selectedTimeDiffDate !== originDataState.timeDiffDate;

    return sourceKeyChanged || groupByChanged || groupByTagsChanged || filterChanged
            || dataTableNameChanged || dataUnitChanged
            || timeDiffChanged || timeDiffDateChanged;
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
    referenceDataTableName: '',
});


/* APIs */
const { invalidateLoadQueries: invalidateLoadQueriesForRelatedQueries } = useDataTableRelatedLoadQueryInvalidator({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const { mutateAsync: updateDataTableMutation } = useDataTableUpdateMutation({
    widgetId: computed(() => widgetGenerateState.widgetId),
    onSuccess: async (data) => {
        await invalidateLoadQueriesForRelatedQueries(data);
        setInitialDataTableForm();
        state.filterFormKey = getRandomId();
        setFailStatus(false);
    },
    onError: (error) => {
        setFailStatus(true);
        showErrorMessage(error.message, error);
        ErrorHandler.handleError(error);
    },

});

const { mutateAsync: deleteDataTable } = useDataTableDeleteMutation({
    widgetId: computed(() => widgetGenerateState.widgetId),
    onSuccess: async (_, variables) => {
        const _allDataTableInvalidMap = {
            ...widgetGenerateState.allDataTableInvalidMap,
        };
        delete _allDataTableInvalidMap[variables.data_table_id];
        widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);
        if (widgetGenerateState.selectedDataTableId === variables.data_table_id) {
            const dataTableId = dataTableList.value.length ? dataTableList.value[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
        }
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
});

const { mutateAsync: updateWidget } = useWidgetUpdateMutation({
    onError: (error) => {
        showErrorMessage(error.message, error);
        ErrorHandler.handleError(error);
    },
});

/* Utils */
/* Generate DataTable Update Params */
const getCostSpecificParams = (): { domainOptions: CostOptions; groupBy: DataTableGroupByInfo[] } => {
    const domainOptions = { data_source_id: state.dataSourceId, data_key: state.selectedSourceEndItem };
    const groupBy = state.selectedGroupByItems.map((group: GroupByItem) => ({
        key: group.name,
        name: group.label,
        tags: group.tags,
    }));
    return { domainOptions, groupBy };
};
const getUnifiedCostSpecificParams = (): { domainOptions: UnifiedCostOptions; groupBy: DataTableGroupByInfo[] } => {
    const domainOptions = { data_key: 'cost' };
    const groupBy = state.selectedGroupByItems.map((group: GroupByItem) => ({
        key: group.name,
        name: group.label,
        tags: group.tags,
    }));
    return { domainOptions, groupBy };
};
const { getMetric } = useMetricQueryFetcher();
const getAssetSpecificParams = async (): Promise<{ domainOptions: AssetOptions; groupBy: DataTableGroupByInfo[] }> => {
    const domainOptions = { metric_id: state.selectedSourceEndItem };
    if (!state.metricId) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TABLE_INVALID_WARNING'), '');
        throw new Error('Metric ID is required');
    }
    const metric = await getMetric(state.metricId);

    const metricLabelsInfo: MetricLabelKey[] = metric?.labels_info || [];
    const filteredAssetGroupBy = metricLabelsInfo.filter((labelInfo) => state.selectedGroupByItems.map((group) => group.name).includes(labelInfo.key));
    const assetGroupBy: DataTableGroupByInfo[] = filteredAssetGroupBy.map((labelInfo) => ({
        key: labelInfo.key,
        name: labelInfo.name,
        reference: labelInfo.reference,
        search_key: labelInfo.search_key,
    }));
    return { domainOptions, groupBy: assetGroupBy };
};

const getDataTableUpdateParams = async (): Promise<DataTableUpdateParameters> => {
    let { domainOptions, groupBy } = { domainOptions: {} as CostOptions|UnifiedCostOptions|AssetOptions, groupBy: [] as DataTableGroupByInfo[] };
    if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
        ({ domainOptions, groupBy } = getCostSpecificParams());
    } else if (state.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) {
        ({ domainOptions, groupBy } = getUnifiedCostSpecificParams());
    } else if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
        ({ domainOptions, groupBy } = await getAssetSpecificParams());
    }

    /* Group By Tags */
    GROUP_BY_INFO_ITEMS_FOR_TAGS.forEach((tag) => {
        const groupByTags = groupBy.find((group) => group.key === tag.key);
        if (groupByTags) {
            groupBy.map((group) => {
                if (tag.key === group.key) {
                    group.tags = state.selectedGroupByTagsMap[tag.key]?.map((item) => item.name) || [];
                }
                return group;
            });
        }
    });

    /* Filter */
    const refinedFilter = Object.values(state.filter as Record<string, DataTableQueryFilter>)
        .filter((filter) => {
            if (isArray(filter.v)) return filter?.v?.length;
            return !!filter?.v;
        })
        .map((filter) => {
            if (isArray(filter.v)) {
                return {
                    ...filter,
                    v: uniq(filter.v),
                };
            }
            return {
                ...filter,
                v: filter.v,
            };
        });


    /* Update Params */
    return {
        data_table_id: state.dataTableId,
        options: {
            [state.sourceType]: domainOptions,
            group_by: groupBy,
            filter: refinedFilter,
            data_name: state.dataFieldName,
            data_unit: state.dataUnit,
            timediff: getTimeDiffValue(),
        },
    };
};

/* Update DataTable */
const updateDataTable = async (): Promise<DataTableModel|undefined> => {
    if (!state.dataFieldName.length) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TABLE_INVALID_WARNING'), '');
        setFailStatus(true);
        return undefined;
    }
    const updateParams = await getDataTableUpdateParams();
    return updateDataTableMutation(updateParams);
};

/* Events */
const handleSelectSourceItem = (selectedItem: string) => {
    state.selectedSourceEndItem = selectedItem;
    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.SELECT_DATA_SOURCE_SUCCESS'), '');
};

const handleClickDeleteDataTable = async () => {
    const isExistingDataTableInTransformed = dataTableList.value.find((dataTable) => {
        const isTransformedData = dataTable.data_type === DATA_TABLE_TYPE.TRANSFORMED;
        if (!isTransformedData) return undefined;
        const isDualDataTableOperator = dataTable.operator === DATA_TABLE_OPERATOR.CONCAT || dataTable.operator === DATA_TABLE_OPERATOR.JOIN;
        const operatorOptions = (dataTable.options ?? {})[dataTable.operator ?? ''];
        return isDualDataTableOperator ? operatorOptions?.data_tables.includes(state.dataTableId) : operatorOptions?.data_table_id === state.dataTableId;
    });
    if (isExistingDataTableInTransformed) {
        modalState.referenceDataTableName = isExistingDataTableInTransformed.name || '';
        modalState.mode = 'DELETE_UNABLED';
        modalState.visible = true;
        return;
    }
    modalState.mode = 'DELETE';
    modalState.visible = true;
};
const handleClickResetDataTable = () => {
    modalState.mode = 'RESET';
    modalState.visible = true;
};
const handleConfirmModal = async () => {
    if (modalState.mode === 'DELETE') {
        const deleteParams = {
            data_table_id: state.dataTableId,
        };
        await deleteDataTable(deleteParams);
    }
    if (modalState.mode === 'RESET') {
        setInitialDataTableForm();
        state.filterFormKey = getRandomId();
    }
    modalState.visible = false;
};
const handleCancelModal = () => {
    modalState.visible = false;
};
const handleUpdateDataTable = async () => {
    if (!widgetGenerateState.widgetId) {
        throw new Error('Widget ID is required');
    }
    state.loading = true;
    const result = await updateDataTable();
    if (result) {
        const _widgetOptions = cloneDeep(widget.value?.options);
        const sanitizedOptions = sanitizeWidgetOptions(_widgetOptions, widget.value?.widget_type, result);
        await updateWidget({
            widget_id: widgetGenerateState.widgetId,
            state: 'INACTIVE',
            options: sanitizedOptions,
        });
        showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_SUCCESS'), '');
        widgetGenerateStore.setSelectedDataTableId(state.dataTableId);
        await cascadeUpdateDataTable(result.data_table_id);
    }
    setTimeout(() => {
        state.loading = false;
    }, 1000);
};

/* Utils */
const setInitialDataTableForm = () => {
    // Initial Form Setting
    // Basic Options
    state.selectedGroupByItems = [...originDataState.groupBy];
    state.selectedGroupByTagsMap = { ...originDataState.groupByTagsMap };
    state.filter = originDataState.filter;
    state.dataFieldName = originDataState.dataName;
    state.dataUnit = originDataState.dataUnit;

    // Advanced Options
    advancedOptionsState.selectedTimeDiff = originDataState.timeDiff;
    advancedOptionsState.selectedTimeDiffDate = originDataState.timeDiffDate;
    advancedOptionsState.timeDiffDataName = originDataState.timeDiffDataName;
};
const setFailStatus = (status: boolean) => {
    state.failStatus = status;
};
const getTimeDiffValue = (): TimeDiff|undefined => {
    if (advancedOptionsState.selectedTimeDiff === 'none' || !Number(advancedOptionsState.selectedTimeDiffDate)) return undefined;
    // const defaultFieldName = state.selectableSourceItems.find((source) => source.name === state.selectedSourceEndItem)?.label || '';
    const timeDiffOptions = {
        none: '',
        months: 'month',
        years: 'year',
    };
    return {
        [advancedOptionsState.selectedTimeDiff]: -Number(advancedOptionsState.selectedTimeDiffDate),
        data_name: advancedOptionsState.timeDiffDataName || `${state.dataFieldName} (- ${advancedOptionsState.selectedTimeDiffDate} ${timeDiffOptions[advancedOptionsState.selectedTimeDiff]})`,
    };
};


onMounted(() => {
    // Initial Form Setting
    setInitialDataTableForm();
});

watch(() => state.selectedSourceEndItem, async (_selectedSourceItem) => {
    // Base Options
    state.selectedGroupByItems = [];
    // state.dataFieldName = state.selectableSourceItems.find((source) => source.name === _selectedSourceItem)?.label;
    if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
        const metric = await getMetric(_selectedSourceItem);
        state.dataUnit = metric?.unit || '';
    } else {
        state.dataUnit = '';
    }
    state.filter = {};


    // Advanced Options
    advancedOptionsState.selectedTimeDiff = 'none';
    advancedOptionsState.selectedTimeDiffDate = undefined;
    advancedOptionsState.timeDiffDataName = '';
});

// Validation
watch(() => validationState.dataTableApplyInvalid, (invalid) => {
    const _allDataTableInvalidMap = {
        ...widgetGenerateState.allDataTableInvalidMap,
        [state.dataTableId]: invalid,
    };
    widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);
}, { immediate: true });

defineExpose<DataTableFormContentsExpose>({
    updateDataTable,
});

</script>

<template>
    <div class="widget-form-data-table-card-add-contents"
         :class="{ 'selected': props.selected, 'failed': state.failStatus, 'unavailable': state.isUnavailable }"
    >
        <div class="card-header">
            <widget-form-data-table-card-header-title :data-table-id="state.dataTableId"
                                                      :data-type="DATA_TABLE_TYPE.ADDED"
                                                      :selected="props.selected"
                                                      :data-table-name.sync="dataTableNameState.dataTableName"
            />
            <widget-form-data-table-card-source-form v-if="state.sourceType !== DATA_SOURCE_DOMAIN.UNIFIED_COST"
                                                     :source-type="state.sourceType"
                                                     :parent-source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.namespaceId"
                                                     :selected="state.selectedSourceEndItem"
                                                     @select="handleSelectSourceItem"
            />
        </div>
        <widget-form-data-table-card-add-form :filter-form-key="state.filterFormKey"
                                              :data-table-id="state.dataTableId"
                                              :source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.selectedSourceEndItem"
                                              :source-key="state.selectedSourceEndItem"
                                              :source-type="state.sourceType"
                                              :selected-group-by-items.sync="state.selectedGroupByItems"
                                              :selected-group-by-tags-map.sync="state.selectedGroupByTagsMap"
                                              :filter.sync="state.filter"
                                              :data-field-name.sync="state.dataFieldName"
                                              :data-unit.sync="state.dataUnit"
                                              :selected-time-diff.sync="advancedOptionsState.selectedTimeDiff"
                                              :selected-time-diff-date.sync="advancedOptionsState.selectedTimeDiffDate"
                                              :time-diff-data-name.sync="advancedOptionsState.timeDiffDataName"
                                              :form-invalid.sync="validationState.dataTableApplyInvalid"
        />
        <widget-form-data-table-card-footer :disabled="validationState.dataTableApplyInvalid"
                                            :changed="optionChanged"
                                            :loading="state.loading || props.loading"
                                            @delete="handleClickDeleteDataTable"
                                            @reset="handleClickResetDataTable"
                                            @update="handleUpdateDataTable"
        />
        <widget-form-data-table-card-alert-modal :mode="modalState.mode"
                                                 :visible="modalState.visible"
                                                 :reference-data-table-name="modalState.referenceDataTableName"
                                                 @cancel="handleCancelModal"
                                                 @confirm="handleConfirmModal"
        />
    </div>
</template>

<style lang="scss" scoped>
.widget-form-data-table-card-add-contents {
    @apply border border-gray-200 rounded-lg w-full bg-white;
    width: 25vw;
    min-width: 21rem;
    max-width: 24rem;
    padding-top: 0.125rem;
    margin-bottom: 2rem;

    &:hover {
        @apply border border-primary2;
        box-shadow: 0 0 0 3px theme('colors.violet.200');
    }
    &.selected {
        @apply border-violet-600;
        box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        .card-header {
            @apply bg-violet-100 border border-violet-200;
        }
    }

    &.failed {
        @apply border-red-400;
        box-shadow: 0 0 0 0.1875rem rgba(255, 193, 193, 1);
    }

    &.unavailable {
        @apply border-dashed;
    }

    .card-header {
        @apply bg-gray-100 rounded-lg border border-gray-200;
        width: calc(100% - 0.5rem);
        padding: 0.75rem;
        margin: auto;
    }
}
</style>
