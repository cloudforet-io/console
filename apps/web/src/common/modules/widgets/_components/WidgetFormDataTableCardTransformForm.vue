<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PFieldGroup, PSelectDropdown, PTextInput, PButton, PIconButton, PFieldTitle,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

import getRandomId from '@/lib/random-id-generator';

import WidgetFormDataTableCardTransformDataTableDropdown
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformDataTableDropdown.vue';
import { DATA_TABLE_OPERATOR, JOIN_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { DataTableOperator, JoinType } from '@/common/modules/widgets/types/widget-model';

interface Props {
    dataTableId: string;
    operator: DataTableOperator;
}

const props = defineProps<Props>();

const state = reactive({
    operatorMap: computed(() => {
        if (props.operator === 'CONCAT') return { name: 'Concatenate', icon: 'ic_db-concat' };
        if (props.operator === 'JOIN') return { name: 'Join', icon: 'ic_join' };
        if (props.operator === 'WHERE') return { name: 'Where', icon: 'ic_db-where' };
        if (props.operator === 'EVAL') return { name: 'Evaluate', icon: 'ic_db-evaluation' };
        return { name: '', icon: '' };
    }),
});

const joinState = reactive({
    joinType: undefined as JoinType|undefined,
    joinTypeitems: computed<SelectDropdownMenuItem[]>(() => [
        { label: 'Left Join', name: JOIN_TYPE.LEFT, icon: 'ic_join-left' },
        { label: 'Right Join', name: JOIN_TYPE.RIGHT, icon: 'ic_join-right' },
        { label: 'Outer Join', name: JOIN_TYPE.OUTER, icon: 'ic_join-outer' },
        { label: 'Inner Join', name: JOIN_TYPE.INNER, icon: 'ic_join-inner' },
    ]),
});

const whereState = reactive({
    conditions: [{ key: getRandomId(), value: '' }] as { key: string; value: string }[],
});

const evalState = reactive({
    functions: [{ key: getRandomId(), name: '', value: '' }] as { key: string; name: string; value: string }[],
});

/* Events */
const handleChangeCondition = (key: string, value: string) => {
    const index = whereState.conditions.findIndex((condition) => condition.key === key);
    if (index !== -1) {
        whereState.conditions[index].value = value;
    }
};
const handleRemoveCondition = (key: string) => {
    const index = whereState.conditions.findIndex((condition) => condition.key === key);
    if (index !== -1) {
        whereState.conditions.splice(index, 1);
    }
};
const handleClickAddCondition = () => {
    whereState.conditions = [...whereState.conditions, { key: getRandomId(), value: '' }];
};

const handleClickAddFunction = () => {
    const newFunction = {
        key: getRandomId(),
        name: '',
        value: '',
    };
    evalState.functions = [...evalState.functions, newFunction];
};

const handleChangeFunction = (key: string, value: string, type: 'name' | 'value') => {
    const targetIndex = evalState.functions.findIndex((functionInfo) => functionInfo.key === key);
    if (targetIndex !== -1) {
        evalState.functions[targetIndex][type] = value;
    }
};

const handleRemoveFunction = (key: string) => {
    const targetIndex = evalState.functions.findIndex((functionInfo) => functionInfo.key === key);
    if (targetIndex !== -1) {
        evalState.functions.splice(targetIndex, 1);
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
                />
            </div>
            <p-field-group v-if="props.operator === DATA_TABLE_OPERATOR.JOIN"
                           :label="'Join Type'"
                           required
            >
                <p-select-dropdown class="join-type-dropdown"
                                   :menu="joinState.joinTypeitems"
                                   :selected.sync="joinState.joinType"
                                   block
                >
                    <template v-if="joinState.joinType"
                              #dropdown-left-area
                    >
                        <p-i class="selected-join-type-icon"
                             :name="joinState.joinTypeitems.find((item) => item.name === joinState.joinType)?.icon"
                             width="1rem"
                             height="1rem"
                        />
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group v-if="props.operator === DATA_TABLE_OPERATOR.WHERE"
                           :label="'Condition'"
                           required
            >
                <div class="where-type-conditions-wrapper">
                    <div v-for="(conditionInfo, idx) in whereState.conditions"
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
                                       :disabled="idx === 0 && whereState.conditions.length === 1"
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
                           label="Function"
                           required
            >
                <div class="eval-type-functions-wrapper">
                    <div class="field-title-wrapper">
                        <p-field-title class="field-name-title"
                                       label="Field Name"
                                       size="sm"
                                       color="gray"
                                       inline
                        />
                        <p-field-title class="formula-title"
                                       label="Formula"
                                       size="sm"
                                       color="gray"
                                       inline
                        />
                    </div>
                    <div v-for="(functionInfo, idx) in evalState.functions"
                         :key="functionInfo.key"
                         class="functions-wrapper"
                    >
                        <p-text-input class="field-name-input"
                                      block
                                      :value="functionInfo.name"
                                      @update:value="handleChangeFunction(functionInfo.key, $event, 'name')"
                        />
                        <p-text-input class="formula-input"
                                      block
                                      :value="functionInfo.value"
                                      @update:value="handleChangeFunction(functionInfo.key, $event, 'value')"
                        />
                        <p-icon-button name="ic_delete"
                                       size="sm"
                                       :disabled="idx === 0 && evalState.functions.length === 1"
                                       @click="handleRemoveFunction(functionInfo.key)"
                        />
                    </div>
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleClickAddFunction"
                    >
                        Add Label
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
    .where-type-conditions-wrapper {
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
        .field-title-wrapper {
            margin-bottom: 0.25rem;
            .field-name-title {
                width: 7.25rem;
            }
        }
        .functions-wrapper {
            @apply flex gap-1 items-center;
            margin-bottom: 0.5rem;
            .field-name-input {
                width: 7rem;
            }
        }
    }
}
</style>
