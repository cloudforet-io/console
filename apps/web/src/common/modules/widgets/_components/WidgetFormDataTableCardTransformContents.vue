<script setup lang="ts">
import {
    computed, defineExpose, onMounted, reactive, watch,
} from 'vue';

import { cloneDeep, intersection, isEqual } from 'lodash';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardTransformForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformForm.vue';
import {
    DATA_TABLE_TYPE, DATA_TABLE_FIELD_TYPE,
} from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataTableAlertModalMode, QueryCondition, EvalExpressions, TransformDataTableInfo, AdditionalLabel,
} from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, JoinType, ConcatOptions, JoinOptions, QueryOptions, EvalOptions,
    DataTableTransformOptions,
    EvaluateExpression, AddLabelsOptions, AdditionalLabels,
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
    dataTableId: computed(() => props.item.data_table_id),
    dataTableName: props.item.name ? props.item.name : `${props.item.operator} Data`,
    applyDisabled: computed(() => {
        const haveSavedName = !!originState.name;
        const haveRequiredConcatOptions = haveSavedName && state.dataTableInfo.dataTables.length === 2 && !state.dataTableInfo.dataTables.includes(undefined);
        const haveRequiredJoinOptions = haveSavedName && state.dataTableInfo.dataTables.length === 2 && !state.dataTableInfo.dataTables.includes(undefined) && joinState.joinType;
        const haveRequiredQueryOptions = haveSavedName && !!state.dataTableInfo.dataTableId && queryState.conditions.filter((cond) => !!cond.value.trim()).length > 0;
        const haveRequiredEvalOptions = haveSavedName && !!state.dataTableInfo.dataTableId && evalState.expressions.filter((expression) => !!expression.name && !!expression.expression).length > 0;
        const haveRequiredAddLabels = haveSavedName && !!state.dataTableInfo.dataTableId && addLabelsState.labels.every((label) => !!label.name && !!label.value);
        if (state.operator === 'CONCAT') return !haveRequiredConcatOptions;
        if (state.operator === 'JOIN') return !haveRequiredJoinOptions;
        if (state.operator === 'QUERY') return !haveRequiredQueryOptions;
        if (state.operator === 'EVAL') return !haveRequiredEvalOptions;
        if (state.operator === 'ADD_LABELS') return !haveRequiredAddLabels;
        return true;
    }),
    optionsChanged: computed(() => {
        const dataTablesChanged = !isEqual(state.dataTableInfo.dataTables, originState.dataTableInfo.dataTables);
        const dataTableIdChanged = state.dataTableInfo.dataTableId !== originState.dataTableInfo.dataTableId;
        const joinTypeChanged = joinState.joinType !== originState.joinType;
        const conditionsChanged = !isEqual(queryState.conditions.map((cond) => ({ value: cond.value })).filter((cond) => !!cond.value.trim().length), originState.conditions);
        const expressionsChanged = !isEqual(evalState.expressions.map((expression) => ({
            name: expression.name,
            field_type: expression.fieldType,
            expression: expression.expression,
            ...(expression?.condition ? { condition: expression?.condition } : {}),
            ...(expression?.else ? { else: expression?.else } : {}),
        })).filter((expression) => !!expression.name && !!expression.expression), originState.expressions);
        const addLabelsChanged = !isEqual(addLabelsState.labels, originState.labels);
        if (state.operator === 'CONCAT') return dataTablesChanged;
        if (state.operator === 'JOIN') return dataTablesChanged || joinTypeChanged;
        if (state.operator === 'QUERY') return dataTableIdChanged || conditionsChanged;
        if (state.operator === 'EVAL') return dataTableIdChanged || expressionsChanged;
        if (state.operator === 'ADD_LABELS') return addLabelsChanged;
        return false;
    }),
    isUnsaved: computed(() => state.dataTableId.startsWith('UNSAVED-')),
    operator: computed(() => props.item.operator as DataTableOperator),
    dataTableInfo: {
        dataTables: [] as string[],
        dataTableId: undefined,
    } as TransformDataTableInfo,
    failStatus: false,
    isLegacyDataTable: computed(() => {
        if (state.operator === 'EVAL') return false;
        const evalExpressions = (props.item.options as DataTableTransformOptions).EVAL?.expressions;
        if (!evalExpressions?.length) return false;
        const isLegacyEval = typeof evalExpressions[0] === 'string';
        if (isLegacyEval) return true;
        return false;
    }),
    isUnavailable: computed<boolean>(() => props.item.state === 'UNAVAILABLE'),
});

const modalState = reactive({
    visible: false,
    mode: '' as DataTableAlertModalMode,
});

const joinState = reactive({
    joinType: undefined as JoinType | undefined,
});

const queryState = reactive({
    conditions: [{ key: getRandomId(), value: '' }] as QueryCondition[],
});

const evalState = reactive({
    expressions: [{
        key: getRandomId(), fieldType: DATA_TABLE_FIELD_TYPE.DATA, name: '', expression: '', isCollapsed: false,
    }] as EvalExpressions[],
});

const addLabelsState = reactive({
    labels: [{
        name: '', value: '',
    }] as AdditionalLabel[],
});

const originState = reactive({
    name: computed(() => props.item.name),
    dataTableInfo: computed<TransformDataTableInfo>(() => ({
        dataTables: props.item.options[state.operator]?.data_tables ?? [] as string[],
        dataTableId: props.item.options[state.operator]?.data_table_id as string,
    })),
    joinType: computed(() => (props.item.options as DataTableTransformOptions).JOIN?.how as JoinType),
    conditions: computed(() => ((props.item.options as DataTableTransformOptions).QUERY?.conditions ?? []).map((condition) => ({
        value: condition,
    }))),
    expressions: computed<EvaluateExpression[]|string[]>(() => (props.item.options as DataTableTransformOptions).EVAL?.expressions ?? []),
    labels: computed<AdditionalLabel[]>(() => {
        const _labels = (props.item.options as DataTableTransformOptions).ADD_LABELS?.labels ?? {};
        return Object.entries(_labels).map(([name, value]) => ({ name, value }));
    }),
});

const setFailStatus = (status: boolean) => {
    state.failStatus = status;
};
const updateDataTable = async (): Promise<DataTableModel|undefined> => {
    const isValidDataTableId = state.dataTableInfo.dataTableId && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTableId);
    const isValidDataTables = state.dataTableInfo.dataTables.length === 2
        && !state.dataTableInfo.dataTables.includes(undefined)
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[0])
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[1]);
    if (!isValidDataTableId && !isValidDataTables) {
        showErrorMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.UPDATE_DATA_TALBE_INVALID_WARNING'), '');
        setFailStatus(true);
        return undefined;
    }

    // Duplicated Data Field Handling in 'JOIN'
    if (state.operator === 'JOIN') {
        const firstDataTable = storeState.dataTables.find((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[0]);
        const secondDataTable = storeState.dataTables.find((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[1]);
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
    const concatOptions: ConcatOptions = {
        data_tables: state.dataTableInfo.dataTables,
    };
    const joinOptions: JoinOptions = {
        data_tables: state.dataTableInfo.dataTables,
        how: joinState.joinType as JoinType,
    };
    const queryOptions: QueryOptions = {
        data_table_id: state.dataTableInfo.dataTableId,
        conditions: queryState.conditions.map((conditionInfo) => conditionInfo.value),
    };
    const evalOptions: EvalOptions = {
        data_table_id: state.dataTableInfo.dataTableId,
        expressions: evalState.expressions.map((expressionInfo) => ({
            name: expressionInfo.name,
            field_type: expressionInfo.fieldType,
            expression: expressionInfo.expression,
            ...(expressionInfo.condition && { condition: expressionInfo.condition }) || {},
            ...(expressionInfo.else && { else: expressionInfo.else }) || {},
        })).filter((expressionInfo) => !!expressionInfo.name && !!expressionInfo.expression),
    };
    const _labels: AdditionalLabels = addLabelsState.labels.reduce((acc, label) => {
        if (label.name && label.value) {
            acc[label.name] = label.value;
        }
        return acc;
    }, {});
    const addLabelsOptions: AddLabelsOptions = {
        data_table_id: state.dataTableInfo.dataTableId,
        labels: _labels,
    };
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
        case 'ADD_LABELS':
            return addLabelsOptions;
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
    // Initial Form Setting
    state.dataTableInfo = originState.dataTableInfo;
    joinState.joinType = originState.joinType;
    queryState.conditions = originState.conditions.length ? originState.conditions.map((cond) => ({ ...cond, key: getRandomId() })) : [{ key: getRandomId(), value: '' }];
    evalState.expressions = originState.expressions.length ? originState.expressions.map((expression) => ({
        ...expression,
        isCollapsed: false,
        fieldType: expression.field_type,
        key: getRandomId(),
    })) : [{
        key: getRandomId(), name: '', fieldType: DATA_TABLE_FIELD_TYPE.DATA, expression: '', isCollapsed: false,
    }];
    addLabelsState.labels = originState.labels.length ? cloneDeep(originState.labels) : [{ name: '', value: '' }];
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
                                                      :is-legacy-data-table="state.isLegacyDataTable"
            />
        </div>

        <widget-form-data-table-card-transform-form :data-table-id="state.dataTableId"
                                                    :operator="state.operator"
                                                    :data-table-info.sync="state.dataTableInfo"
                                                    :join-type.sync="joinState.joinType"
                                                    :conditions.sync="queryState.conditions"
                                                    :expressions.sync="evalState.expressions"
                                                    :labels.sync="addLabelsState.labels"
                                                    :is-legacy-data-table="state.isLegacyDataTable"
        />
        <widget-form-data-table-card-footer :disabled="state.applyDisabled"
                                            :is-legacy-data-table="state.isLegacyDataTable"
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
