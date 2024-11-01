<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PI, PFieldGroup, PSelectDropdown, PTextInput, PButton, PIconButton, PFieldTitle,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/src/inputs/dropdown/select-dropdown/type';

import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformDataTableDropdown
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformDataTableDropdown.vue';
import WidgetFormDataTableCardTransformFormEvaluate
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormEvaluate.vue';
import WidgetFormDataTableGlobalVariableViewButton
    from '@/common/modules/widgets/_components/WidgetFormDataTableGlobalVariableViewButton.vue';
import { DATA_TABLE_OPERATOR, JOIN_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { QueryCondition, TransformDataTableInfo, EvalExpressions } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    DataTableOperator, JoinType,
} from '@/common/modules/widgets/types/widget-model';

import { yellow } from '@/styles/colors';

interface Props {
    dataTableId: string;
    operator: DataTableOperator;
    dataTableInfo: TransformDataTableInfo;
    joinType: JoinType|undefined;
    conditions: QueryCondition[];
    expressions: EvalExpressions[];
    isLegacyDataTable?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{(e: 'update:data-table-info', value: TransformDataTableInfo): void;
    (e: 'update:join-type', value: JoinType): void;
    (e: 'update:conditions', value: QueryCondition[]): void;
    (e: 'update:expressions', value: EvalExpressions[]): void;
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
    proxyExpressions: useProxyValue('expressions', props, emit),
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

// const handleClickAddFunction = () => {
//     const newFunction = {
//         key: getRandomId(),
//         value: '',
//     };
//     evalState.proxyFunctions = [...evalState.proxyFunctions, newFunction];
// };
//
// const handleChangeFunction = (key: string, value: string) => {
//     const targetIndex = evalState.proxyFunctions.findIndex((functionInfo) => functionInfo.key === key);
//     if (targetIndex !== -1) {
//         evalState.proxyFunctions[targetIndex].value = value;
//     }
// };
//
// const handleRemoveFunction = (key: string) => {
//     const targetIndex = evalState.proxyFunctions.findIndex((functionInfo) => functionInfo.key === key);
//     if (targetIndex !== -1) {
//         evalState.proxyFunctions.splice(targetIndex, 1);
//     }
// };


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
            <div v-if="props.isLegacyDataTable"
                 class="legacy-data-table-warning"
            >
                <div class="warning-title">
                    <p-i name="ic_warning-filled"
                         width="1.25rem"
                         height="1.25rem"
                         :color="yellow[500]"
                    />
                    <span>
                        <i18n path="COMMON.WIDGETS.DATA_TABLE.FORM.LEGACY_WARNING_TITLE">
                            <template #operator>{{ state.operatorMap.name }}</template>
                        </i18n>
                    </span>
                </div>
                <p class="warning-description">
                    <i18n path="COMMON.WIDGETS.DATA_TABLE.FORM.LEGACY_WARNING_DESC">
                        <template #operator>
                            {{ state.operatorMap.name }}
                        </template>
                    </i18n>
                </p>
            </div>
            <div class="data-table-dropdown-wrapper">
                <widget-form-data-table-card-transform-data-table-dropdown :data-table-id="props.dataTableId"
                                                                           :operator="props.operator"
                                                                           :data-table-info.sync="state.proxyDataTableInfo"
                                                                           :is-legacy-data-table="props.isLegacyDataTable"
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
            <div v-if="props.operator === DATA_TABLE_OPERATOR.QUERY"
                 class="query-wrapper"
            >
                <div class="query-type-conditions-title-wrapper">
                    <p-field-title class="field-title"
                                   size="md"
                                   color="dark"
                    >
                        <div class="field-title-wrapper">
                            <span>{{ $t('Condition') }}</span>
                            <div class="left-area">
                                <widget-form-data-table-global-variable-view-button />
                            </div>
                        </div>
                    </p-field-title>
                </div>
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
            </div>
            <widget-form-data-table-card-transform-form-evaluate v-if="props.operator === DATA_TABLE_OPERATOR.EVAL"
                                                                 :expressions.sync="evalState.proxyExpressions"
                                                                 :is-legacy-data-table="props.isLegacyDataTable"
            />
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
        .query-wrapper {
            .query-type-conditions-title-wrapper {
                /* custom design-system component - p-field-title */
                :deep(.p-field-title) {
                    .title {
                        @apply flex;
                        width: 100%;
                    }
                }
                .field-title {
                    @apply w-full;
                    .field-title-wrapper {
                        @apply flex w-full items-center;
                        .left-area {
                            @apply flex flex-1 items-center justify-end;
                            width: 100%;
                        }
                    }
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
        }
    }
    .data-table-dropdown-wrapper {
        margin-bottom: 1rem;
    }
    .join-type-dropdown {
        .selected-join-type-icon {
            min-width: 1rem;
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

    .legacy-data-table-warning {
        @apply w-full bg-yellow-100 rounded;
        padding: 0.5rem 1rem;
        margin-bottom: 0.5rem;
        .warning-title {
            @apply flex items-center gap-1 text-label-lg font-bold text-yellow-700;
            margin-bottom: 0.25rem;
        }
        .warning-description {
            @apply text-paragraph-md text-gray-900;
            padding-left: 1.5rem;
        }
    }
}
</style>
