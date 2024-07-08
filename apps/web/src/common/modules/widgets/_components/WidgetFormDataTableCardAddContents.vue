<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';
import { isEqual } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { DataTableUpdateParameters } from '@/schema/dashboard/public-data-table/api-verbs/update';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardAddForm from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddForm.vue';
import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardSourceForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardSourceForm.vue';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_OPERATOR,
    DATA_TABLE_TYPE, DEFAULT_DATE_SORT, DEFAULT_SEPARATED_DATE_SORT,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { AdditionalLabel, DataTableAlertModalMode } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    AdditionalLabels, DateFormat, DataTableAddOptions, DataTableTransformOptions,
} from '@/common/modules/widgets/types/widget-model';

interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
}
const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    selectedDataTable: computed(() => widgetGenerateStore.getters.selectedDataTable),
    dataTables: computed(() => widgetGenerateState.dataTables),
});

const state = reactive({
    dataTableId: computed(() => props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as { name: string; label: string; }[],
    filter: {} as Record<string, string[]>,
    consoleFilters: computed<ConsoleFilter[]>(() => {
        const results: ConsoleFilter[] = [];
        Object.entries(state.filter ?? {}).forEach(([category, filterItems]) => {
            if (filterItems.length) {
                results.push({
                    k: category,
                    v: filterItems,
                    o: '=',
                });
            }
        });
        return results;
    }),
    dataFieldName: '',
    dataUnit: '',
    selectableSourceItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return state.costDataTypeItems;
        }
        if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return Object.values(storeState.metrics)
                .filter((metric) => metric.data.namespace_id === state.namespaceId)
                .map((metric) => ({
                    label: metric.label,
                    name: metric.key,
                }));
        }
        return [];
    }),
    costDataTypeItems: computed(() => {
        const targetCostDataSource = storeState.costDataSources[state.dataSourceId];
        const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost || targetCostDataSource?.data?.plugin_info?.metadata?.cost_info?.name;
        const additionalMenuItems: MenuItem[] = targetCostDataSource.data?.cost_data_keys?.map((key) => ({
            name: `data.${key}`, label: key,
        }));
        return [
            { name: 'cost', label: costAlias ? `Cost (${costAlias})` : 'Cost' },
            { name: 'usage_quantity', label: 'Usage' },
            ...(additionalMenuItems || []),
        ];
    }),
    filterFormKey: getRandomId(),
    optionsChanged: computed(() => {
        const sourceKeyChanged = state.selectedSourceEndItem !== originDataState.sourceKey;
        const groupByChanged = !isEqual(state.selectedGroupByItems, originDataState.groupBy);
        const filterChanged = !isEqual(state.filter, originDataState.filter);
        const dataTableNameChanged = state.dataFieldName !== originDataState.dataName;
        const dataUnitChanged = state.dataUnit !== originDataState.dataUnit;
        const additionalLabelChanged = !isEqual(advancedOptionsState.additionalLabels.map(({ name, value }) => ({ name, value })), originDataState.additionalLabels);
        const seperateDateChanged = advancedOptionsState.separateDate !== originDataState.separateDate;
        const timeDiffChanged = advancedOptionsState.selectedTimeDiff !== originDataState.timeDiff;
        const timeDiffDateChanged = advancedOptionsState.selectedTimeDiffDate !== originDataState.timeDiffDate;

        return sourceKeyChanged || groupByChanged || filterChanged || dataTableNameChanged || dataUnitChanged
            || additionalLabelChanged || seperateDateChanged || timeDiffChanged || timeDiffDateChanged;
    }),
});

const dataTableNameState = reactive({
    dataTableName: props.item.name ?? '',
});

const advancedOptionsState = reactive({
    additionalLabels: [] as AdditionalLabel[],
    separateDate: false,
    selectedTimeDiff: 'none',
    selectedTimeDiffDate: undefined as string|undefined,
});

const validationState = reactive({
    dataTableApplyInvalid: false,
});

const originDataState = reactive({
    sourceKey: computed(() => (state.sourceType === DATA_SOURCE_DOMAIN.COST ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id)),
    groupBy: computed(() => ((props.item.options as DataTableAddOptions).group_by ?? []).map((group) => ({
        name: group.key,
        label: group.name,
    }))),
    filter: computed(() => {
        const _filter = {} as Record<string, string[]>;
        ((props.item.options as DataTableAddOptions).filter ?? []).forEach((filter) => {
            _filter[filter.k] = filter.v;
        });
        return _filter;
    }),
    dataName: computed(() => (props.item.options as DataTableAddOptions).data_name ?? ''),
    dataUnit: computed(() => (props.item.options as DataTableAddOptions).data_unit ?? ''),
    additionalLabels: computed(() => Object.entries(((props.item.options as DataTableAddOptions).additional_labels ?? {})).map(([key, value]) => ({
        name: key,
        value: value as string,
    }))),
    separateDate: computed(() => (props.item.options as DataTableAddOptions).date_format === 'SEPARATE'),
    timeDiff: computed(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        const timeDiffKeys = Object.keys(timeDiff || {});
        return timeDiffKeys.length ? timeDiffKeys[0] : 'none';
    }),
    timeDiffDate: computed(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        const timeDiffKeys = Object.keys(timeDiff || {});
        return timeDiffKeys.length ? `${-timeDiff[timeDiffKeys[0]]}` : undefined;
    }),
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
    referenceDataTableName: '',
});



/* Events */
const handleSelectSourceItem = (selectedItem: string) => {
    state.selectedSourceEndItem = selectedItem;
    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.SELECT_DATA_SOURCE_SUCCESS'), '');
};

const handleClickDeleteDataTable = async () => {
    const isExistingDataTableInTransformed = storeState.dataTables.find((dataTable) => {
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
        const beforeSelectedDataTableId = storeState.selectedDataTableId;
        const deleteParams = {
            data_table_id: state.dataTableId,
        };
        await widgetGenerateStore.deleteDataTable(deleteParams);
        if (beforeSelectedDataTableId === state.dataTableId) {
            const dataTableId = storeState.dataTables.length ? storeState.dataTables[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
        }
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
    if (!state.dataFieldName.length) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_WARNING'), '');
        return;
    }
    const additionalLabelsRequest = {} as AdditionalLabels;
    advancedOptionsState.additionalLabels.filter((label) => label.name.length && label.value.length).forEach((label) => {
        additionalLabelsRequest[label.name] = label.value;
    });
    const domainOptions = state.sourceType === DATA_SOURCE_DOMAIN.COST
        ? { data_source_id: state.dataSourceId, data_key: state.selectedSourceEndItem }
        : { metric_id: state.selectedSourceEndItem };

    const costGroupBy = state.selectedGroupByItems.map((group) => ({
        key: group.name,
        name: group.label,
    }));
    const metricLabelsInfo = storeState.metrics[state.metricId ?? '']?.data?.labels_info;
    const assetGroupBy = (metricLabelsInfo ?? []).filter((label) => state.selectedGroupByItems.map((group) => group.name).includes(label.key));
    const groupBy = state.sourceType === DATA_SOURCE_DOMAIN.COST ? costGroupBy : assetGroupBy;
    const dataTableApiQueryHelper = new ApiQueryHelper();
    dataTableApiQueryHelper.setFilters(state.consoleFilters);

    const updateParams: DataTableUpdateParameters = {
        data_table_id: state.dataTableId,
        options: {
            [state.sourceType]: domainOptions,
            group_by: groupBy,
            filter: dataTableApiQueryHelper.data.filter,
            data_name: state.dataFieldName,
            data_unit: state.dataUnit,
            additional_labels: additionalLabelsRequest,
            date_format: (advancedOptionsState.separateDate ? 'SEPARATE' : 'SINGLE') as DateFormat,
            timediff: advancedOptionsState.selectedTimeDiff !== 'none' && Number(advancedOptionsState.selectedTimeDiffDate)
                ? { [advancedOptionsState.selectedTimeDiff]: -Number(advancedOptionsState.selectedTimeDiffDate) }
                : undefined,
        },
    };
    await widgetGenerateStore.updateDataTable(updateParams);
    widgetGenerateStore.setSelectedDataTableId(state.dataTableId);
    widgetGenerateStore.setDataTableUpdating(true);
    await widgetGenerateStore.loadDataTable({
        data_table_id: state.dataTableId,
        sort: advancedOptionsState.separateDate ? DEFAULT_SEPARATED_DATE_SORT : DEFAULT_DATE_SORT,
    });

    // Update Referenced Transformed DataTable
    const referencedDataTableIds = [] as string[];
    storeState.dataTables.forEach((dataTable) => {
        const transformDataTalbeOptions = dataTable.options as DataTableTransformOptions;
        const isReferenced = dataTable.data_type === 'TRANSFORMED'
            && !dataTable?.data_table_id?.startsWith('UNSAVED-')
            && (
                transformDataTalbeOptions?.JOIN?.data_tables?.includes(state.dataTableId)
                || transformDataTalbeOptions?.CONCAT?.data_tables?.includes(state.dataTableId)
                || transformDataTalbeOptions?.QUERY?.data_table_id === state.dataTableId
                || transformDataTalbeOptions?.EVAL?.data_table_id === state.dataTableId
            );
        if (isReferenced) referencedDataTableIds.push(dataTable.data_table_id as string);
    });
    if (referencedDataTableIds.length) {
        await Promise.all(referencedDataTableIds.map((dataTableId) => {
            const dataTable = storeState.dataTables.find((_dataTable) => _dataTable.data_table_id === dataTableId) as PublicDataTableModel|PrivateDataTableModel;
            widgetGenerateStore.updateDataTable({
                data_table_id: dataTable.data_table_id,
                name: dataTable.name,
                options: {
                    ...dataTable.options,
                },
            });
            return null;
        }));
    }

    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_SUCCESS'), '');
    setInitialDataTableForm();
    state.filterFormKey = getRandomId();
};

/* Utils */
const setInitialDataTableForm = () => {
    // Initial Form Setting
    // Basic Options
    state.selectedGroupByItems = [...originDataState.groupBy];
    state.filter = originDataState.filter;
    state.dataFieldName = originDataState.dataName;
    state.dataUnit = originDataState.dataUnit;

    // Advanced Options
    advancedOptionsState.additionalLabels = originDataState.additionalLabels.map((label) => ({
        ...label,
        key: getRandomId(),
    }));
    advancedOptionsState.separateDate = originDataState.separateDate;
    advancedOptionsState.selectedTimeDiff = originDataState.timeDiff;
    advancedOptionsState.selectedTimeDiffDate = originDataState.timeDiffDate;
};

onMounted(() => {
    // Initial Form Setting
    setInitialDataTableForm();
});

watch(() => state.selectedSourceEndItem, (_selectedSourceItem) => {
    // Base Options
    state.selectedGroupByItems = [];
    state.dataFieldName = state.selectableSourceItems.find((source) => source.name === _selectedSourceItem)?.label;
    state.dataUnit = state.sourceType === DATA_SOURCE_DOMAIN.ASSET ? storeState.metrics[_selectedSourceItem]?.data?.unit || '' : '';
    state.filter = {};


    // Advanced Options
    advancedOptionsState.additionalLabels = [];
    advancedOptionsState.separateDate = false;
    advancedOptionsState.selectedTimeDiff = 'none';
});

</script>

<template>
    <div class="widget-form-data-table-card-add-contents"
         :class="{ 'selected': props.selected }"
    >
        <div class="card-header">
            <widget-form-data-table-card-header-title :data-table-id="state.dataTableId"
                                                      :data-type="DATA_TABLE_TYPE.ADDED"
                                                      :selected="props.selected"
                                                      :data-table-name.sync="dataTableNameState.dataTableName"
            />
            <widget-form-data-table-card-source-form :source-type="state.sourceType"
                                                     :parent-source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.namespaceId"
                                                     :menu="state.selectableSourceItems"
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
                                              :filter.sync="state.filter"
                                              :data-field-name.sync="state.dataFieldName"
                                              :data-unit.sync="state.dataUnit"
                                              :additional-labels.sync="advancedOptionsState.additionalLabels"
                                              :separate-date.sync="advancedOptionsState.separateDate"
                                              :selected-time-diff.sync="advancedOptionsState.selectedTimeDiff"
                                              :selected-time-diff-date.sync="advancedOptionsState.selectedTimeDiffDate"
                                              :form-invalid.sync="validationState.dataTableApplyInvalid"
        />
        <widget-form-data-table-card-footer :disabled="validationState.dataTableApplyInvalid"
                                            :changed="state.optionsChanged"
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
    width: 24rem;
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

    .card-header {
        @apply bg-gray-100 rounded-lg border border-gray-200;
        width: 23.5rem;
        padding: 0.75rem;
        margin: auto;
    }
}
</style>
