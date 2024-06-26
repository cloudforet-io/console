<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { intersection, isEqual } from 'lodash';

import type { PrivateDataTableModel } from '@/schema/dashboard/private-data-table/model';
import type { PublicDataTableModel } from '@/schema/dashboard/public-data-table/model';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardAlertModal
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardAlertModal.vue';
import WidgetFormDataTableCardFooter from '@/common/modules/widgets/_components/WidgetFormDataTableCardFooter.vue';
import WidgetFormDataTableCardHeaderTitle
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardHeaderTitle.vue';
import WidgetFormDataTableCardTransformForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformForm.vue';
import { DATA_TABLE_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type {
    DataTableAlertModalMode, QueryCondition, EvalFormula, TransformDataTableInfo,
} from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, JoinType, ConcatOptions, JoinOptions, QueryOptions, EvalOptions,
} from '@/common/modules/widgets/types/widget-model';




interface Props {
    selected: boolean;
    item: PublicDataTableModel|PrivateDataTableModel;
}
const props = defineProps<Props>();

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const storeState = reactive({
    dataTables: computed(() => widgetGenerateState.dataTables),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
});

const state = reactive({
    dataTableId: computed(() => props.item.data_table_id),
    options: computed(() => props.item.options),
    dataTableName: props.item.name ? props.item.name : `${props.item.operator} Data`,
    applyDisabled: computed(() => {
        const haveSavedName = !!originState.name;
        const haveRequiredConcatOptions = haveSavedName && state.dataTableInfo.dataTables.length === 2 && !state.dataTableInfo.dataTables.includes(undefined);
        const haveRequiredJoinOptions = haveSavedName && state.dataTableInfo.dataTables.length === 2 && !state.dataTableInfo.dataTables.includes(undefined) && joinState.joinType;
        const haveRequiredQueryOptions = haveSavedName && !!state.dataTableInfo.dataTableId && queryState.conditions.filter((cond) => !!cond.value.trim()).length > 0;
        const haveRequiredEvalOptions = haveSavedName && !!state.dataTableInfo.dataTableId && evalState.functions.filter((func) => !!func.name.trim() && !!func.value.trim()).length > 0;
        if (state.operator === 'CONCAT') return !haveRequiredConcatOptions;
        if (state.operator === 'JOIN') return !haveRequiredJoinOptions;
        if (state.operator === 'QUERY') return !haveRequiredQueryOptions;
        if (state.operator === 'EVAL') return !haveRequiredEvalOptions;
        return true;
    }),
    optionsChanged: computed(() => {
        const dataTablesChanged = !isEqual(state.dataTableInfo.dataTables, originState.dataTableInfo.dataTables);
        const dataTableIdChanged = state.dataTableInfo.dataTableId !== originState.dataTableInfo.dataTableId;
        const joinTypeChanged = joinState.joinType !== originState.joinType;
        const conditionsChanged = !isEqual(queryState.conditions.map((cond) => ({ value: cond.value })).filter((cond) => !!cond.value.trim().length), originState.conditions);
        const functionsChanged = !isEqual(evalState.functions.map((func) => ({ name: func.name, value: func.value }))
            .filter((func) => !!func.value.trim().length && !!func.name.trim().length), originState.functions);
        if (state.operator === 'CONCAT') return dataTablesChanged;
        if (state.operator === 'JOIN') return dataTablesChanged || joinTypeChanged;
        if (state.operator === 'QUERY') return dataTableIdChanged || conditionsChanged;
        if (state.operator === 'EVAL') return dataTableIdChanged || functionsChanged;
        return false;
    }),
    isUnsaved: computed(() => state.dataTableId.startsWith('UNSAVED-')),
    operator: computed(() => props.item.operator as DataTableOperator),
    dataTableInfo: {
        dataTables: [] as string[],
        dataTableId: undefined,
    } as TransformDataTableInfo,
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
    functions: [{ key: getRandomId(), name: '', value: '' }] as EvalFormula[],
});

const originState = reactive({
    name: computed(() => props.item.name),
    dataTableInfo: computed<TransformDataTableInfo>(() => ({
        dataTables: props.item.options[state.operator]?.data_tables ?? [] as string[],
        dataTableId: props.item.options[state.operator]?.data_table_id as string,
    })),
    joinType: computed(() => props.item.options.JOIN?.how as JoinType),
    conditions: computed(() => (props.item.options.QUERY?.conditions ?? []).map((condition) => ({
        value: condition,
    }))),
    functions: computed(() => (props.item.options.EVAL?.formulas ?? []).map((func) => ({
        name: func.name,
        value: func.value,
    }))),
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
        const beforeSelectedDataTableId = storeState.selectedDataTableId;
        const deleteParams = {
            data_table_id: state.dataTableId,
        };
        await widgetGenerateStore.deleteDataTable(deleteParams, state.isUnsaved);
        if (beforeSelectedDataTableId === state.dataTableId) {
            const dataTableId = storeState.dataTables.length ? storeState.dataTables[0]?.data_table_id : undefined;
            widgetGenerateStore.setSelectedDataTableId(dataTableId?.startsWith('UNSAVED-') ? undefined : dataTableId);
            widgetGenerateStore.setWidgetFormValueMap({});
            widgetGenerateStore.setWidgetValidMap({});
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
    const isValidDataTableId = state.dataTableInfo.dataTableId && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTableId);
    const isValidDataTables = state.dataTableInfo.dataTables.length === 2
        && !state.dataTableInfo.dataTables.includes(undefined)
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[0])
        && storeState.dataTables.some((dataTable) => dataTable.data_table_id === state.dataTableInfo.dataTables[1]);
    if (!isValidDataTableId && !isValidDataTables) {
        showErrorMessage('Unable to apply changes. Please check the form.', '');
        return;
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
            showErrorMessage('{data02} cannot be joined with {data01} because the two data tables have one or more identical data fields.', '');
            return;
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
        expressions: evalState.functions.map((functionInfo) => ({
            name: functionInfo.name,
            value: functionInfo.value,
        })),
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
        await widgetGenerateStore.createTransformDataTable(createParams, state.dataTableId);
    } else {
        const updateParams = {
            data_table_id: state.dataTableId,
            name: state.dataTableName,
            options: { [state.operator]: options() },
        };
        await widgetGenerateStore.updateDataTable(updateParams);
    }
};

/* Utils */
const setInitialDataTableForm = () => {
    // Initial Form Setting
    state.dataTableInfo = originState.dataTableInfo;
    joinState.joinType = originState.joinType;
    queryState.conditions = originState.conditions.length ? originState.conditions.map((cond) => ({ ...cond, key: getRandomId() })) : [{ key: getRandomId(), value: '' }];
    evalState.functions = originState.functions.length ? originState.functions.map((func) => ({ ...func, key: getRandomId() })) : [{ key: getRandomId(), name: '', value: '' }];
};

onMounted(() => {
    // Initial Form Setting
    setInitialDataTableForm();
});

</script>

<template>
    <div class="widget-form-data-table-card-transform-contents"
         :class="{ 'selected': props.selected }"
    >
        <div class="card-header">
            <widget-form-data-table-card-header-title :data-table-id="state.dataTableId"
                                                      :data-type="DATA_TABLE_TYPE.TRANSFORMED"
                                                      :selected="props.selected"
                                                      :data-table-name.sync="state.dataTableName"
            />
        </div>
        <widget-form-data-table-card-transform-form :data-table-id="state.dataTableId"
                                                    :operator="state.operator"
                                                    :data-table-info.sync="state.dataTableInfo"
                                                    :join-type.sync="joinState.joinType"
                                                    :conditions.sync="queryState.conditions"
                                                    :functions.sync="evalState.functions"
        />
        <widget-form-data-table-card-footer :disabled="state.applyDisabled"
                                            :changed="state.optionsChanged"
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
    width: 24rem;
    padding-top: 0.125rem;
    margin-bottom: 2rem;

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
