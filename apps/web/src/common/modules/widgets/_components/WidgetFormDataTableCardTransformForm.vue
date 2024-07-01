<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PFieldGroup, PSelectDropdown, PTextInput, PButton, PIconButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformDataTableDropdown
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformDataTableDropdown.vue';
import { DATA_TABLE_OPERATOR, JOIN_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { QueryCondition, EvalFormula, TransformDataTableInfo } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, JoinType,
} from '@/common/modules/widgets/types/widget-model';

interface Props {
    dataTableId: string;
    operator: DataTableOperator;
    dataTableInfo: TransformDataTableInfo;
    joinType: JoinType|undefined;
    conditions: QueryCondition[];
    functions: EvalFormula[];
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:data-table-info', value: TransformDataTableInfo): void;
    (e: 'update:join-type', value: JoinType): void;
    (e: 'update:conditions', value: QueryCondition[]): void;
    (e: 'update:functions', value: EvalFormula[]): void;
}>();

const state = reactive({
    operatorMap: computed(() => {
        if (props.operator === 'CONCAT') return { name: 'Concatenate', icon: 'ic_db-concat' };
        if (props.operator === 'JOIN') return { name: 'Join', icon: 'ic_join' };
        if (props.operator === 'QUERY') return { name: 'Query', icon: 'ic_db-where' };
        if (props.operator === 'EVAL') return { name: 'Evaluate', icon: 'ic_db-evaluation' };
        return { name: '', icon: '' };
    }),
    proxyDataTableInfo: useProxyValue('dataTableInfo', props, emit),
});

const joinState = reactive({
    proxyJoinType: useProxyValue('joinType', props, emit),
    joinTypeitems: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'Left Join', name: JOIN_TYPE.LEFT, icon: 'ic_join-left' },
        { label: 'Right Join', name: JOIN_TYPE.RIGHT, icon: 'ic_join-right' },
        { label: 'Outer Join', name: JOIN_TYPE.OUTER, icon: 'ic_join-outer' },
        { label: 'Inner Join', name: JOIN_TYPE.INNER, icon: 'ic_join-inner' },
    ]),
});

const queryState = reactive({
    proxyConditions: useProxyValue('conditions', props, emit),
});

const evalState = reactive({
    proxyFunctions: useProxyValue('functions', props, emit),
});

/* Events */
const handleChangeCondition = (key: string, value: string) => {
    const index = queryState.proxyConditions.findIndex((condition) => condition.key === key);
    if (index !== -1) {
        queryState.proxyConditions[index].value = value;
    }
};
const handleRemoveCondition = (key: string) => {
    const index = queryState.proxyConditions.findIndex((condition) => condition.key === key);
    if (index !== -1) {
        queryState.proxyConditions.splice(index, 1);
    }
};
const handleClickAddCondition = () => {
    queryState.proxyConditions = [...queryState.proxyConditions, { key: getRandomId(), value: '' }];
};

const handleClickAddFunction = () => {
    const newFunction = {
        key: getRandomId(),
        value: '',
    };
    evalState.proxyFunctions = [...evalState.proxyFunctions, newFunction];
};

const handleChangeFunction = (key: string, value: string) => {
    const targetIndex = evalState.proxyFunctions.findIndex((functionInfo) => functionInfo.key === key);
    if (targetIndex !== -1) {
        evalState.proxyFunctions[targetIndex].value = value;
    }
};

const handleRemoveFunction = (key: string) => {
    const targetIndex = evalState.proxyFunctions.findIndex((functionInfo) => functionInfo.key === key);
    if (targetIndex !== -1) {
        evalState.proxyFunctions.splice(targetIndex, 1);
    }
};


</script>

<template>
    <div class="widget-form-data-table-card-transform-form">
        <div class="data-table-select-form">
            <div class="operator">
                <p-i :name="state.operatorMap.icon"
                     width="1rem"
                     height="1rem"
                />
                <span>{{ state.operatorMap.name }}</span>
            </div>
            <div class="data-table-dropdown-wrapper">
                <widget-form-data-table-card-transform-data-table-dropdown :data-table-id="props.dataTableId"
                                                                           :operator="props.operator"
                                                                           :data-table-info.sync="state.proxyDataTableInfo"
                />
            </div>
            <p-field-group v-if="props.operator === DATA_TABLE_OPERATOR.JOIN"
                           :label="'How'"
                           required
            >
                <p-select-dropdown class="join-type-dropdown"
                                   :menu="joinState.joinTypeitems"
                                   :selected.sync="joinState.proxyJoinType"
                                   block
                >
                    <template v-if="joinState.proxyJoinType"
                              #dropdown-left-area
                    >
                        <p-i class="selected-join-type-icon"
                             :name="joinState.joinTypeitems.find((item) => item.name === joinState.proxyJoinType)?.icon"
                             width="1rem"
                             height="1rem"
                        />
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group v-if="props.operator === DATA_TABLE_OPERATOR.QUERY"
                           :label="'Condition'"
                           required
            >
                <div class="query-type-conditions-wrapper">
                    <div v-for="(conditionInfo, idx) in queryState.proxyConditions"
                         :key="conditionInfo.key"
                         class="conditions-wrapper"
                    >
                        <p-text-input class="label-input"
                                      block
                                      :value="conditionInfo.value"
                                      @update:value="handleChangeCondition(conditionInfo.key, $event,)"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       :disabled="idx === 0 && queryState.proxyConditions.length === 1"
                                       @click="handleRemoveCondition(conditionInfo.key)"
                        />
                    </div>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleClickAddCondition"
                    >
                        Add Condition
                    </p-button>
                </div>
            </p-field-group>
            <p-field-group v-if="props.operator === DATA_TABLE_OPERATOR.EVAL"
                           label="Expression"
                           required
            >
                <div class="eval-type-functions-wrapper">
                    <div v-for="(functionInfo, idx) in evalState.proxyFunctions"
                         :key="functionInfo.key"
                         class="functions-wrapper"
                    >
                        <p-text-input class="formula-input"
                                      block
                                      :value="functionInfo.value"
                                      @update:value="handleChangeFunction(functionInfo.key, $event)"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       :disabled="idx === 0 && evalState.proxyFunctions.length === 1"
                                       @click="handleRemoveFunction(functionInfo.key)"
                        />
                    </div>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleClickAddFunction"
                    >
                        Add Expression
                    </p-button>
                </div>
            </p-field-group>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-form {
    padding: 0.75rem 1rem;

    .data-table-select-form {
        .operator {
            @apply inline-flex items-center gap-1 rounded-md border border-gray-150 bg-gray-100 text-label-sm font-bold text-gray-700;
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.5rem;
        }
    }
    .data-table-dropdown-wrapper {
        margin-bottom: 1rem;
    }
    .join-type-dropdown {
        @apply w-full;
        .selected-join-type-icon {
            min-width: 1rem;
        }
    }
    .query-type-conditions-wrapper {
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem;
        margin-top: 0.25rem;
        .conditions-wrapper {
            @apply flex gap-1 items-center;
            margin-bottom: 0.5rem;
        }
    }
    .eval-type-functions-wrapper {
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem;
        margin-top: 0.25rem;
        .functions-wrapper {
            @apply flex gap-1 items-center;
            margin-bottom: 0.5rem;
        }
    }
}
</style>
