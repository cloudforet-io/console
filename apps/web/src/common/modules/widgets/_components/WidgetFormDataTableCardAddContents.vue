<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
    cloneDeep, isArray, isEqual, uniq,
} from 'lodash';

import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormDataTableCardAddForm from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddForm.vue';
import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardSourceForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardSourceForm.vue';
import {
    useDataTableCascadeUpdate,
} from '@/common/modules/widgets/_composables/use-data-table-cascade-update';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/use-widget-query';
import {
    DATA_SOURCE_DOMAIN,
    DATA_TABLE_OPERATOR,
    DATA_TABLE_TYPE, GROUP_BY_INFO_ITEMS_FOR_TAGS,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataTableAlertModalMode } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableAddOptions,
    DataTableQueryFilter, TimeDiff,
} from '@/common/modules/widgets/types/widget-model';

import { GROUP_BY } from '@/services/cost-explorer/constants/cost-explorer-constant';

interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
    loading?: boolean;
}

type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();

/* Query */
const {
    widget,
    keys: widgetKeys,
    fetcher: widgetFetcher,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    dataTableList,
    keys: dataTableKeys,
    api: dataTableApi,
    fetcher: dataTableFetcher,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const queryClient = useQueryClient();
const {
    cascadeUpdateDataTable,
} = useDataTableCascadeUpdate({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    allDataTableInvalidMap: computed(() => widgetGenerateState.allDataTableInvalidMap),
});

const state = reactive({
    isPrivate: computed(() => widgetGenerateState.widgetId?.startsWith('private')),
    loading: false,
    dataTableId: computed(() => props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as { name: string; label: string; tags?: [] }[],
    selectedGroupByTagsMap: {
        [GROUP_BY.PROJECT]: [],
        [GROUP_BY.REGION]: [],
    } as Record<string, string[]>,
    filter: {} as Record<string, DataTableQueryFilter>,
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
        const additionalMenuItems: MenuItem[] = targetCostDataSource?.data?.cost_data_keys?.map((key) => ({
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
    }),
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
        } as Record<string, string[]>;
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
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        const timeDiffKeys = Object.keys(timeDiff || {}).filter((key) => key !== 'data_name');
        return timeDiffKeys.length ? `${-timeDiff[timeDiffKeys[0]]}` : undefined;
    }),
    timeDiffDataName: computed<string>(() => {
        const timeDiff = (props.item.options as DataTableAddOptions).timediff;
        return timeDiff?.data_name || '';
    }),
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
    referenceDataTableName: '',
});

/* Query Keys */
const { withSuffix: privateDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'get');
const { withSuffix: publicDataTableGetQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'get');
const { withSuffix: privateDataTableLoadQueryKey } = useServiceQueryKey('dashboard', 'private-data-table', 'load');
const { withSuffix: publicDataTableLoadQueryKey } = useServiceQueryKey('dashboard', 'public-data-table', 'load');
const { withSuffix: privateWidgetLoadQueryKey } = useServiceQueryKey('dashboard', 'private-widget', 'load');
const { withSuffix: publicWidgetLoadQueryKey } = useServiceQueryKey('dashboard', 'public-widget', 'load');
const { withSuffix: privateWidgetLoadSumQueryKey } = useServiceQueryKey('dashboard', 'private-widget', 'load-sum');
const { withSuffix: publicWidgetLoadSumQueryKey } = useServiceQueryKey('dashboard', 'public-widget', 'load-sum');

/* APIs */
const invalidateLoadQueries = async (data: DataTableModel) => {
    if (!widgetGenerateState.widgetId) return;
    if (data.data_table_id.startsWith('private')) {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: privateDataTableLoadQueryKey(state.dataTableId) }),
            queryClient.invalidateQueries({ queryKey: privateWidgetLoadQueryKey(widgetGenerateState.widgetId) }),
            queryClient.invalidateQueries({ queryKey: privateWidgetLoadSumQueryKey(widgetGenerateState.widgetId) }),
        ]);
    } else {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: publicDataTableLoadQueryKey(state.dataTableId) }),
            queryClient.invalidateQueries({ queryKey: publicWidgetLoadQueryKey(widgetGenerateState.widgetId) }),
            queryClient.invalidateQueries({ queryKey: publicWidgetLoadSumQueryKey(widgetGenerateState.widgetId) }),
        ]);
    }
};
const { mutateAsync: updateDataTableMutation } = useMutation({
    mutationFn: dataTableFetcher.updateDataTableFn,
    onSuccess: async (data) => {
        const dataTableListQueryKey = state.isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
        await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
            if (oldData.results) {
                return {
                    ...oldData,
                    results: oldData.results.map((dataTable) => {
                        if (dataTable.data_table_id === data.data_table_id) {
                            return data;
                        }
                        return dataTable;
                    }),
                };
            }
            return oldData;
        });
        await queryClient.invalidateQueries({ queryKey: state.isPrivate ? privateDataTableGetQueryKey(state.dataTableId) : publicDataTableGetQueryKey(state.dataTableId) });
        await invalidateLoadQueries(data);

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
const { mutateAsync: updateWidget } = useMutation({
    mutationFn: widgetFetcher.updateWidgetFn,
    onSuccess: (data) => {
        const widgetQueryKey = widgetGenerateState.widgetId?.startsWith('private')
            ? widgetKeys.privateWidgetGetQueryKey
            : widgetKeys.publicWidgetGetQueryKey;
        queryClient.setQueryData(widgetQueryKey.value, () => data);
    },
    onError: (e) => {
        showErrorMessage(e.message, e);
        ErrorHandler.handleError(e);
    },
});
const updateDataTable = async (): Promise<DataTableModel|undefined> => {
    if (!state.dataFieldName.length) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_WARNING'), '');
        setFailStatus(true);
        return undefined;
    }

    let domainOptions;
    if (state.sourceType === DATA_SOURCE_DOMAIN.COST) domainOptions = { data_source_id: state.dataSourceId, data_key: state.selectedSourceEndItem };
    if (state.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) domainOptions = { data_key: 'cost' };
    if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) domainOptions = { metric_id: state.selectedSourceEndItem };

    const costGroupBy = state.selectedGroupByItems.map((group) => ({
        key: group.name,
        name: group.label,
        tags: group.tags,
    }));
    const metricLabelsInfo = storeState.metrics[state.metricId ?? '']?.data?.labels_info;
    const assetGroupBy = (metricLabelsInfo ?? []).filter((label) => state.selectedGroupByItems.map((group) => group.name).includes(label.key));

    const groupBy = (state.sourceType === DATA_SOURCE_DOMAIN.COST || state.sourceType === DATA_SOURCE_DOMAIN.UNIFIED_COST) ? costGroupBy : assetGroupBy;

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

    const updateParams: DataTableUpdateParameters = {
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
    return updateDataTableMutation(updateParams);
};
const deleteDataTableFn = (params: DataTableDeleteParameters): Promise<void> => {
    if (params.data_table_id.startsWith('private')) {
        return dataTableApi.privateDataTableAPI.delete(params);
    } return dataTableApi.publicDataTableAPI.delete(params);
};
const { mutateAsync: deleteDataTable } = useMutation({
    mutationFn: deleteDataTableFn,
    onSuccess: async (_, variables) => {
        const _allDataTableInvalidMap = {
            ...storeState.allDataTableInvalidMap,
        };
        delete _allDataTableInvalidMap[variables.data_table_id];
        widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);

        const _isPrivate = widgetGenerateState.widgetId?.startsWith('private');
        const dataTableListQueryKey = _isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
        await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
            if (oldData.results) {
                return {
                    ...oldData,
                    results: oldData.results.filter((dataTable) => dataTable.data_table_id !== variables.data_table_id),
                };
            }
            return oldData;
        });

        if (storeState.selectedDataTableId === variables.data_table_id) {
            const dataTableId = dataTableList.value.length ? dataTableList.value[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
        }
    },
    onError: (error) => {
        ErrorHandler.handleError(error);
    },
});

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
    const defaultFieldName = state.selectableSourceItems.find((source) => source.name === state.selectedSourceEndItem)?.label || '';
    const timeDiffOptions = {
        none: '',
        months: 'month',
        years: 'year',
    };
    return {
        [advancedOptionsState.selectedTimeDiff]: -Number(advancedOptionsState.selectedTimeDiffDate),
        data_name: advancedOptionsState.timeDiffDataName || `${defaultFieldName} (- ${advancedOptionsState.selectedTimeDiffDate} ${timeDiffOptions[advancedOptionsState.selectedTimeDiff]})`,
    };
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
    advancedOptionsState.selectedTimeDiff = 'none';
    advancedOptionsState.selectedTimeDiffDate = undefined;
    advancedOptionsState.timeDiffDataName = '';
});

// Validation
watch(() => validationState.dataTableApplyInvalid, (invalid) => {
    const _allDataTableInvalidMap = {
        ...storeState.allDataTableInvalidMap,
        [state.dataTableId]: invalid,
    };
    widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);
}, { immediate: true });

defineExpose({
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
                                              :source-items="state.selectableSourceItems"
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
                                            :changed="state.optionsChanged"
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
