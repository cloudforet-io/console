<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import { cloneDeep, intersection, isEqual } from 'lodash';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardTransformAddLabels
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformAddLabels.vue';
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
    DATA_TABLE_TYPE, type DATA_TABLE_OPERATOR, DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataTableAlertModalMode, TransformDataTableInfo,
} from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, JoinType, QueryOptions, EvalOptions,
    DataTableTransformOptions,
    EvaluateExpression, AddLabelsOptions, PivotOptions,
} from '@/common/modules/widgets/types/widget-model';




interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
}
type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    allDataTableInvalidMap: computed(() => widgetGenerateState.allDataTableInvalidMap),
});

const state = reactive({
    loading: false,
    resetKey: Math.random(),
    dataTableId: computed(() => props.item.data_table_id),
    dataTableName: props.item.name ? props.item.name : `${props.item.operator} Data`,
    applyDisabled: computed(() => {
        const haveSavedName = !!originState.name;
        if (!haveSavedName) return true;
        if (state.operator === 'CONCAT') return invalidState.CONCAT;
        if (state.operator === 'JOIN') return invalidState.JOIN;
        if (state.operator === 'QUERY') return invalidState.QUERY;
        if (state.operator === 'EVAL') return invalidState.EVAL;
        if (state.operator === 'PIVOT') return invalidState.PIVOT;
        if (state.operator === 'ADD_LABELS') return invalidState.ADD_LABELS;
        if (state.operator === 'VALUE_MAPPING') return invalidState.VALUE_MAPPING;
        return true;
    }),
    optionsChanged: computed(() => {
        const concatDataTablesChanged = !isEqual(valueState.CONCAT.data_tables, originState.dataTableInfo.dataTables);
        const joinDataTablesChanged = !isEqual(valueState.JOIN.data_tables, originState.dataTableInfo.dataTables);
        const joinTypeChanged = valueState.JOIN.how !== originState.joinType;
        const queryDataTableIdChanged = valueState.QUERY.data_table_id !== originState.dataTableInfo.dataTableId;
        const queryConditionsChanged = !isEqual(valueState.QUERY.conditions, originState.queryConditions);
        const evalDataTableIdChanged = valueState.EVAL.data_table_id !== originState.dataTableInfo.dataTableId;
        const evalChanged = !isEqual(valueState.EVAL.expressions.map((expression) => ({
            ...expression,
            ...(expression?.condition ? { condition: expression?.condition } : {}),
        })).filter((expression) => !!expression.name && !!expression.expression), originState.expressions);
        const addLabelsChanged = !isEqual(valueState.ADD_LABELS.labels, originState.labels);
        const valueMappingChanged = !isEqual(valueState.VALUE_MAPPING, originState.valueMapping);
        if (state.operator === 'CONCAT') return concatDataTablesChanged;
        if (state.operator === 'JOIN') return joinDataTablesChanged || joinTypeChanged;
        if (state.operator === 'QUERY') return queryDataTableIdChanged || queryConditionsChanged;
        if (state.operator === 'EVAL') return evalDataTableIdChanged || evalChanged;
        if (state.operator === 'ADD_LABELS') return addLabelsChanged;
        if (state.operator === 'VALUE_MAPPING') return valueMappingChanged;
        return false;
    }),
    isUnsaved: computed(() => state.dataTableId.startsWith('UNSAVED-')),
    operator: computed(() => props.item.operator as DataTableOperator),
    failStatus: false,
    isUnavailable: computed<boolean>(() => props.item.state === 'UNAVAILABLE'),
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
    ADD_LABELS: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS,
    VALUE_MAPPING: DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING,
});
const invalidState = reactive({
    PIVOT: false,
    CONCAT: false,
    JOIN: false,
    EVAL: false,
    QUERY: false,
    ADD_LABELS: false,
    VALUE_MAPPING: false,
});

const originState = reactive({
    name: computed(() => props.item.name),
    dataTableInfo: computed<TransformDataTableInfo>(() => ({
        dataTables: props.item.options[state.operator]?.data_tables ?? [] as string[],
        dataTableId: props.item.options[state.operator]?.data_table_id as string,
    })),
    joinType: computed<JoinType|undefined>(() => (props.item.options as DataTableTransformOptions).JOIN?.how),
    queryConditions: computed<QueryOptions['conditions']>(() => (props.item.options as DataTableTransformOptions).QUERY?.conditions ?? []),
    expressions: computed<EvaluateExpression[]|string[]>(() => (props.item.options as DataTableTransformOptions).EVAL?.expressions ?? []),
    labels: computed<AddLabelsOptions['labels']>(() => (props.item.options as DataTableTransformOptions).ADD_LABELS?.labels ?? {}),
    pivot: computed<PivotOptions|undefined>(() => {
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
    valueMapping: computed(() => (props.item.options as DataTableTransformOptions).VALUE_MAPPING ?? {}),
});

const setFailStatus = (status: boolean) => {
    state.failStatus = status;
};
const updateDataTable = async (): Promise<DataTableModel|undefined> => {
    const _targetDataTableId: string|undefined = valueState[state.operator].data_table_id;
    const _targetDataTables: string[]|undefined = valueState[state.operator].data_tables;
    const isValidDataTableId = _targetDataTableId && storeState.dataTables.some((dataTable) => dataTable.data_table_id === _targetDataTableId);
    const isValidDataTables = _targetDataTables?.length === 2
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === _targetDataTables[0])
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === _targetDataTables[1]);
    if (!isValidDataTableId && !isValidDataTables) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_WARNING'), '');
        setFailStatus(true);
        return undefined;
    }

    // Duplicated Data Field Handling in 'JOIN'
    if (state.operator === 'JOIN') {
        const firstDataTable = storeState.dataTables.find((dataTable) => dataTable.data_table_id === valueState.JOIN.data_tables[0]);
        const secondDataTable = storeState.dataTables.find((dataTable) => dataTable.data_table_id === valueState.JOIN.data_tables[1]);
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
        const createParams = {
            name: state.dataTableName,
            operator: state.operator,
            options: { [state.operator]: options() },
        };
        const dataTable = await widgetGenerateStore.createTransformDataTable(createParams, state.dataTableId);
        if (dataTable) {
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
    const result = await widgetGenerateStore.updateDataTable(updateParams);
    if (!result) setFailStatus(true);
    else setFailStatus(false);
    return result;
};
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
        const beforeSelectedDataTableId = storeState.selectedDataTableId;
        const deleteParams = {
            data_table_id: state.dataTableId,
        };
        await widgetGenerateStore.deleteDataTable(deleteParams, state.isUnsaved);
        if (beforeSelectedDataTableId === state.dataTableId) {
            const dataTableId = storeState.dataTables.length ? storeState.dataTables[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
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
    state.loading = true;
    const result = await updateDataTable();
    if (result) {
        showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_SUCCESS'), '');
        widgetGenerateStore.setSelectedDataTableId(result.data_table_id);
        widgetGenerateStore.setDataTableUpdating(true);
        await widgetGenerateStore.loadDataTable({});
    }
    setTimeout(() => {
        state.loading = false;
    }, 1000);
};

/* Utils */
const setInitialDataTableForm = () => {
    const _originDataTables = originState.dataTableInfo.dataTables.length ? cloneDeep(originState.dataTableInfo.dataTables) : [];
    const _originDataTableId = originState.dataTableInfo.dataTableId;
    // CONCAT
    valueState.CONCAT = {
        data_tables: _originDataTables,
    };
    // JOIN
    valueState.JOIN.data_tables = _originDataTables;
    valueState.JOIN.how = originState.joinType;
    // QUERY
    valueState.QUERY.data_table_id = _originDataTableId;
    valueState.QUERY.conditions = originState.queryConditions.length ? cloneDeep(originState.queryConditions) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.QUERY.conditions);
    // EVAL
    valueState.EVAL.data_table_id = _originDataTableId;
    valueState.EVAL.expressions = originState.expressions.length ? cloneDeep(originState.expressions) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.EVAL.expressions);
    // ADD_LABELS
    valueState.ADD_LABELS.labels = originState.labels.length ? cloneDeep(originState.labels) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.ADD_LABELS.labels);
    // PIVOT
    valueState.PIVOT = originState.pivot ? cloneDeep(originState.pivot) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.PIVOT);
    state.resetKey = Math.random();
    // VALUE_MAPPING
    valueState.VALUE_MAPPING = originState.valueMapping ? cloneDeep(originState.valueMapping) : cloneDeep(DEFAULT_TRANSFORM_DATA_TABLE_VALUE_MAP.VALUE_MAPPING);
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
                                            :loading="state.loading"
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
