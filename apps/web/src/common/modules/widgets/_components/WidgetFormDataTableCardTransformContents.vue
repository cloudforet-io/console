<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
    cloneDeep, intersection, isEmpty, isEqual,
} from 'lodash';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WidgetModel } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { DataTableDeleteParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/delete';
import type { DataTableTransformParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/transform';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardTransformAddLabels
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformAddLabels.vue';
import WidgetFormDataTableCardTransformAggregate
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformAggregate.vue';
import WidgetFormDataTableCardTransformConcatenate
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformConcatenate.vue';
import WidgetFormDataTableCardTransformEvaluate
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformEvaluate.vue';
import WidgetFormDataTableCardTransformJoin
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformJoin.vue';
import WidgetFormDataTableCardTransformPivotForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformPivotForm.vue';
import WidgetFormDataTableCardTransformQuery
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformQuery.vue';
import WidgetFormDataTableCardTransformValueMapping
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformValueMapping.vue';
import {
    useDataTableCascadeUpdate,
} from '@/common/modules/widgets/_composables/use-data-table-cascade-update';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { useWidgetQuery } from '@/common/modules/widgets/_composables/use-widget-query';
import {
    DATA_TABLE_TYPE, DATA_TABLE_OPERATOR, DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { sanitizeWidgetOptions } from '@/common/modules/widgets/_helpers/widget-options-helper';
import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataTableAlertModalMode, TransformDataTableInfo,
} from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, QueryOptions, EvalOptions,
    DataTableTransformOptions,
    AddLabelsOptions, PivotOptions,
    JoinOptions, ValueMappingOptions, ConcatOptions, AggregateOptions, AggregateFunction,
} from '@/common/modules/widgets/types/widget-model';




interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
    loading?: boolean;
}
type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const props = defineProps<Props>();
const widgetContextStore = useWidgetContextStore();
const widgetContextState = widgetContextStore.state;

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
/* Querys */
const {
    widget,
    keys: widgetKeys,
    fetcher: widgetFetcher,
} = useWidgetQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});
const {
    api,
    keys: dataTableKeys,
    fetcher: dataTableFetcher,
    dataTableList,
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
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    allDataTableInvalidMap: computed(() => widgetGenerateState.allDataTableInvalidMap),
});

const state = reactive({
    loading: false,
    resetKey: Math.random(),
    dataTableId: computed(() => props.item.data_table_id),
    dataTableName: props.item.name ? props.item.name : `${props.item.operator} Data`,
    applyDisabled: computed<boolean>(() => {
        if (!originState.name) return true;
        return invalidState[state.operator];
    }),
    optionsChanged: computed<boolean>(() => !isEqual(valueState[state.operator], originState[state.operator])),
    isUnsaved: computed(() => state.dataTableId.startsWith('UNSAVED-')),
    operator: computed(() => props.item.operator as DataTableOperator),
    failStatus: false,
    isUnavailable: computed<boolean>(() => props.item.state === 'UNAVAILABLE'),
    isPrivate: computed(() => widgetGenerateState.widgetId?.startsWith('private')),
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
});

const valueState = reactive({
    PIVOT: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT,
    CONCAT: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.CONCAT,
    JOIN: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.JOIN,
    EVAL: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.EVAL,
    QUERY: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.QUERY,
    AGGREGATE: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.AGGREGATE,
    ADD_LABELS: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS,
    VALUE_MAPPING: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING,
});
const invalidState = reactive({
    PIVOT: false,
    CONCAT: false,
    JOIN: false,
    EVAL: false,
    QUERY: false,
    AGGREGATE: false,
    ADD_LABELS: false,
    VALUE_MAPPING: false,
});

const originState = reactive({
    name: computed(() => props.item.name),
    dataTableInfo: computed<TransformDataTableInfo>(() => ({
        dataTables: props.item.options[state.operator]?.data_tables ?? [] as string[],
        dataTableId: props.item.options[state.operator]?.data_table_id as string,
    })),
    CONCAT: computed<ConcatOptions|undefined>(() => props.item.options.CONCAT),
    JOIN: computed<JoinOptions|undefined>(() => props.item.options.JOIN),
    QUERY: computed<QueryOptions|undefined>(() => props.item.options.QUERY),
    EVAL: computed<EvalOptions|undefined>(() => props.item.options.EVAL),
    AGGREGATE: computed<AggregateOptions|undefined>(() => props.item.options.AGGREGATE),
    ADD_LABELS: computed<AddLabelsOptions|undefined>(() => props.item.options.ADD_LABELS),
    VALUE_MAPPING: computed<ValueMappingOptions|undefined>(() => props.item.options.VALUE_MAPPING),
    PIVOT: computed<PivotOptions|undefined>(() => {
        const _pivot = (props.item.options as DataTableTransformOptions).PIVOT as PivotOptions|undefined;
        if (!_pivot) return cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT);
        return {
            data_table_id: _pivot.data_table_id,
            fields: _pivot.fields,
            select: _pivot.select,
            limit: _pivot.limit,
            function: _pivot.function,
            order_by: _pivot.order_by,
        };
    }),
});

/* Utils */
const setFailStatus = (status: boolean) => {
    state.failStatus = status;
};
const getAggregateFunctionMap = () => {
    const referenceDataTable = dataTableList.value.find((dataTable) => dataTable.data_table_id === valueState.AGGREGATE.data_table_id);
    if (!referenceDataTable) return {};
    const dataFields = Object.keys(referenceDataTable.data_info ?? {});
    return dataFields.reduce((acc, dataField) => {
        acc[dataField] = 'sum';
        return acc;
    }, {} as AggregateFunction);
};


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
const syncDataTableList = async (data: DataTableModel, unsavedId?: string) => {
    const dataTableListQueryKey = state.isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
    await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
        if (oldData.results) {
            return {
                ...oldData,
                results: oldData.results.map((dataTable) => {
                    if (dataTable.data_table_id === data.data_table_id || dataTable.data_table_id === unsavedId) {
                        return data;
                    }
                    return dataTable;
                }),
            };
        }
        return oldData;
    });
};
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
        await syncDataTableList(data);
        await queryClient.invalidateQueries({ queryKey: state.isPrivate ? privateDataTableGetQueryKey(data.data_table_id) : publicDataTableGetQueryKey(data.data_table_id) });
        await invalidateLoadQueries(data);

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
const transformDataTableFn = (params: DataTableTransformParameters): Promise<DataTableModel> => {
    if (state.isPrivate) {
        return api.privateDataTableAPI.transform(params);
    }
    return api.publicDataTableAPI.transform(params);
};

const updateDataTable = async (): Promise<DataTableModel|undefined> => {
    const _targetDataTableId: string|undefined = valueState[state.operator].data_table_id;
    const _targetDataTables: string[]|undefined = valueState[state.operator].data_tables;
    const isValidDataTableId = _targetDataTableId && dataTableList.value.some((dataTable) => dataTable.data_table_id === _targetDataTableId);
    const isValidDataTables = _targetDataTables?.length === 2
        && dataTableList.value.some((dataTable) => dataTable.data_table_id === _targetDataTables[0])
        && dataTableList.value.some((dataTable) => dataTable.data_table_id === _targetDataTables[1]);
    if (!isValidDataTableId && !isValidDataTables) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_WARNING'), '');
        setFailStatus(true);
        return undefined;
    }

    // Duplicated Data Field Handling in 'JOIN'
    if (state.operator === 'JOIN') {
        const firstDataTable = dataTableList.value.find((dataTable) => dataTable.data_table_id === valueState.JOIN.data_tables[0]);
        const secondDataTable = dataTableList.value.find((dataTable) => dataTable.data_table_id === valueState.JOIN.data_tables[1]);
        const firstDataFields = Object.keys(firstDataTable?.data_info ?? {});
        const secondDataFields = Object.keys(secondDataTable?.data_info ?? {});
        const duplicatedDataFields = intersection(firstDataFields, secondDataFields);
        if (duplicatedDataFields.length) {
            widgetGenerateStore.setJoinRestrictedMap({
                ...widgetGenerateState.joinRestrictedMap,
                [state.dataTableId]: true,
            });
            showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_JOIN_FAIL_WARNING', { first_data: firstDataTable?.name || '', second_data: secondDataTable?.name || '' }), '');
            setFailStatus(true);
            return undefined;
        }
    }
    const firstUpdating = state.isUnsaved;
    const concatOptions = cloneDeep(valueState.CONCAT);
    const joinOptions = cloneDeep(valueState.JOIN);
    const queryOptions = cloneDeep(valueState.QUERY);
    const aggregateOptions = cloneDeep(valueState.AGGREGATE);
    const valueMappingOptions = cloneDeep(valueState.VALUE_MAPPING);
    const evalOptions: EvalOptions = {
        data_table_id: valueState.EVAL.data_table_id,
        expressions: valueState.EVAL.expressions.map((expressionInfo) => ({
            ...expressionInfo,
            ...(expressionInfo.condition && { condition: expressionInfo.condition }) || {},
        })).filter((expressionInfo) => !!expressionInfo.name && !!expressionInfo.expression),
    };
    const pivotOptions: PivotOptions = {
        data_table_id: valueState.PIVOT.data_table_id ?? '',
        fields: valueState.PIVOT.fields,
        select: valueState.PIVOT.select,
        limit: valueState.PIVOT.limit,
        function: valueState.PIVOT.function,
        order_by: valueState.PIVOT.order_by,
    };
    const addLabelsOptions = cloneDeep(valueState.ADD_LABELS);
    const options = () => {
        switch (state.operator) {
        case 'CONCAT':
            return concatOptions;
        case 'JOIN':
            return joinOptions;
        case 'QUERY':
            return queryOptions;
        case 'EVAL':
            return evalOptions;
        case 'AGGREGATE':
            return {
                ...aggregateOptions,
                function: getAggregateFunctionMap(),
            };
        case 'PIVOT':
            return pivotOptions;
        case 'ADD_LABELS':
            return addLabelsOptions;
        case 'VALUE_MAPPING':
            return valueMappingOptions;
        default:
            return {};
        }
    };
    if (firstUpdating) {
        if (!widgetGenerateState.widgetId) {
            throw new Error('Widget ID is required');
        }
        const createParams = {
            name: state.dataTableName,
            widget_id: widgetGenerateState.widgetId,
            operator: state.operator,
            vars: widgetContextState.dashboard?.vars || {},
            options: { [state.operator]: options() },
        };
        const dataTable = await transformDataTableFn(createParams);
        if (dataTable) {
            await syncDataTableList(dataTable, state.dataTableId);

            const _allDataTableInvalidMap = {
                ...storeState.allDataTableInvalidMap,
            };
            delete _allDataTableInvalidMap[state.dataTableId];
            widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);
            setFailStatus(false);
            return dataTable;
        }
        setFailStatus(true);
        return undefined;
    }
    const updateParams = {
        data_table_id: state.dataTableId,
        name: state.dataTableName,
        options: { [state.operator]: options() },
    };

    return updateDataTableMutation(updateParams);
};
const deleteDataTableFn = (params: DataTableDeleteParameters): Promise<void> => {
    if (params.data_table_id.startsWith('private')) {
        return api.privateDataTableAPI.delete(params);
    } return api.publicDataTableAPI.delete(params);
};
const { mutateAsync: deleteDataTable } = useMutation({
    mutationFn: deleteDataTableFn,
    onSuccess: (_, variables) => {
        clearDataTableInvalidStatus(variables.data_table_id);
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
const handleClickDeleteDataTable = async () => {
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
        if (state.isUnsaved) {
            await clearDataTableInvalidStatus(state.dataTableId);
        } else {
            await deleteDataTable(deleteParams);
        }
    }
    if (modalState.mode === 'RESET') {
        setInitialDataTableForm();
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
        widgetGenerateStore.setSelectedDataTableId(result.data_table_id);
        await cascadeUpdateDataTable(result.data_table_id);
    }
    setTimeout(() => {
        state.loading = false;
    }, 1000);
};

/* Utils */
const clearDataTableInvalidStatus = async (dataTableId: string) => {
    const _allDataTableInvalidMap = {
        ...storeState.allDataTableInvalidMap,
    };
    delete _allDataTableInvalidMap[dataTableId];
    widgetGenerateStore.setAllDataTableInvalidMap(_allDataTableInvalidMap);

    const dataTableListQueryKey = state.isPrivate ? dataTableKeys.privateDataTableListQueryKey : dataTableKeys.publicDataTableListQueryKey;
    await queryClient.setQueryData(dataTableListQueryKey.value, (oldData: ListResponse<WidgetModel>) => {
        if (oldData.results) {
            return {
                ...oldData,
                results: oldData.results.filter((dataTable) => dataTable.data_table_id !== dataTableId),
            };
        }
        return oldData;
    });
};
const setInitialDataTableForm = () => {
    valueState.CONCAT = !isEmpty(originState.CONCAT) ? cloneDeep(originState.CONCAT) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.CONCAT);
    valueState.JOIN = !isEmpty(originState.JOIN) ? cloneDeep(originState.JOIN) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.JOIN);
    valueState.QUERY = !isEmpty(originState.QUERY) ? cloneDeep(originState.QUERY) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.QUERY);
    valueState.EVAL = !isEmpty(originState.EVAL) ? cloneDeep(originState.EVAL) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.EVAL);
    valueState.AGGREGATE = !isEmpty(originState.AGGREGATE) ? cloneDeep(originState.AGGREGATE) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.AGGREGATE);
    valueState.ADD_LABELS = !isEmpty(originState.ADD_LABELS) ? cloneDeep(originState.ADD_LABELS) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS);
    valueState.PIVOT = originState.PIVOT ? cloneDeep(originState.PIVOT) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT);
    valueState.VALUE_MAPPING = !isEmpty(originState.VALUE_MAPPING) ? cloneDeep(originState.VALUE_MAPPING) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING);

    state.resetKey = Math.random();
};

onMounted(() => {
    // Initial Form Setting
    setInitialDataTableForm();
});

// Validation
watch(() => state.applyDisabled, (invalid) => {
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
    <div class="widget-form-data-table-card-transform-contents"
         :class="{ 'selected': props.selected, 'failed': state.failStatus, 'unavailable': state.isUnavailable }"
    >
        <div class="card-header">
            <widget-form-data-table-card-header-title :data-table-id="state.dataTableId"
                                                      :data-type="DATA_TABLE_TYPE.TRANSFORMED"
                                                      :selected="props.selected"
                                                      :data-table-name.sync="state.dataTableName"
            />
        </div>
        <widget-form-data-table-card-transform-pivot-form v-if="state.operator === DATA_TABLE_OPERATOR.PIVOT"
                                                          :key="`pivot-${state.resetKey}`"
                                                          :base-data-table-id="state.dataTableId"
                                                          :operator-options.sync="valueState.PIVOT"
                                                          :invalid.sync="invalidState.PIVOT"
                                                          :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-concatenate v-if="state.operator === DATA_TABLE_OPERATOR.CONCAT"
                                                           :key="`concat-${state.resetKey}`"
                                                           :base-data-table-id="state.dataTableId"
                                                           :operator-options.sync="valueState.CONCAT"
                                                           :invalid.sync="invalidState.CONCAT"
                                                           :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-join v-else-if="state.operator === DATA_TABLE_OPERATOR.JOIN"
                                                    :key="`join-${state.resetKey}`"
                                                    :base-data-table-id="state.dataTableId"
                                                    :operator-options.sync="valueState.JOIN"
                                                    :invalid.sync="invalidState.JOIN"
                                                    :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-evaluate v-else-if="state.operator === DATA_TABLE_OPERATOR.EVAL"
                                                        :key="`eval-${state.resetKey}`"
                                                        :base-data-table-id="state.dataTableId"
                                                        :operator-options.sync="valueState.EVAL"
                                                        :invalid.sync="invalidState.EVAL"
                                                        :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-query v-else-if="state.operator === DATA_TABLE_OPERATOR.QUERY"
                                                     :key="`query-${state.resetKey}`"
                                                     :base-data-table-id="state.dataTableId"
                                                     :operator-options.sync="valueState.QUERY"
                                                     :invalid.sync="invalidState.QUERY"
                                                     :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-aggregate v-else-if="state.operator === DATA_TABLE_OPERATOR.AGGREGATE"
                                                         :key="`aggregate-${state.resetKey}`"
                                                         :base-data-table-id="state.dataTableId"
                                                         :operator-options.sync="valueState.AGGREGATE"
                                                         :invalid.sync="invalidState.AGGREGATE"
                                                         :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-add-labels v-if="state.operator === DATA_TABLE_OPERATOR.ADD_LABELS"
                                                          :key="`add-labels-${state.resetKey}`"
                                                          :base-data-table-id="state.dataTableId"
                                                          :operator-options.sync="valueState.ADD_LABELS"
                                                          :invalid.sync="invalidState.ADD_LABELS"
                                                          :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-transform-value-mapping v-if="state.operator === DATA_TABLE_OPERATOR.VALUE_MAPPING"
                                                             :key="`value-mapping-${state.resetKey}`"
                                                             :base-data-table-id="state.dataTableId"
                                                             :operator-options.sync="valueState.VALUE_MAPPING"
                                                             :invalid.sync="invalidState.VALUE_MAPPING"
                                                             :origin-data="props.item.options[state.operator]"
        />
        <widget-form-data-table-card-footer :disabled="state.applyDisabled"
                                            :changed="state.optionsChanged"
                                            :loading="state.loading || props.loading || !!widgetGenerateState.dataTableCasCadeUpdateLoadingMap?.[props.item.data_table_id]"
                                            @delete="handleClickDeleteDataTable"
                                            @reset="handleClickResetDataTable"
                                            @update="handleUpdateDataTable"
        />
        <widget-form-data-table-card-alert-modal :mode="modalState.mode"
                                                 :visible="modalState.visible"
                                                 @cancel="handleCancelModal"
                                                 @confirm="handleConfirmModal"
        />
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-contents {
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
        @apply border-dashed border-red-400;
        box-shadow: 0 0 0 0.1875rem rgba(255, 193, 193, 1);
    }

    .card-header {
        @apply bg-gray-100 rounded-lg border border-gray-200;
        width: calc(100% - 0.5rem);
        padding: 0.75rem;
        margin: auto;
    }
}
</style>
