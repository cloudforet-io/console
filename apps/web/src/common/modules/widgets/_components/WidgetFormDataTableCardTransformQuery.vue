<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButton, PIconButton, PTextInput, PFieldTitle, PLink,
} from '@cloudforet/mirinae';


import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import WidgetFormDataTableGlobalVariableViewButton
    from '@/common/modules/widgets/_components/WidgetFormDataTableGlobalVariableViewButton.vue';
import {
    DATA_TABLE_OPERATOR,
} from '@/common/modules/widgets/_constants/data-table-constant';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { QueryOptions } from '@/common/modules/widgets/types/widget-model';



const CONDITION_PLACEHOLDER = '{{ Product }} == \'A\'';
const RANDOM_KEY = Math.random();

const props = defineProps<TransformDataTableProps<QueryOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: QueryOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const conditionsInfo = ref<QueryOptions['conditions']>(cloneDeep(props.originData.conditions));
// HACK: remove comments after backend development
// const operatorInfo = ref<QueryOptions['operator']>(props.originData.operator);
const state = reactive({
    proxyOperatorOptions: useProxyValue<QueryOptions>('operator-options', props, emit),
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions?.data_table_id) return true;
        if (state.proxyOperatorOptions.conditions.some((condition) => !condition)) return true;
        return false;
    }),
    // queryOperatorItems: computed<SelectDropdownMenuItem[]>(() => [
    //     { label: 'And', name: 'AND' },
    //     { label: 'Or', name: 'OR' },
    // ]),
});

/* Event */
// const handleUpdateOperator = (val: QueryOptions['operator']) => {
//     operatorInfo.value = val;
// };
const handleChangeCondition = (idx: number, value: string) => {
    conditionsInfo.value[idx] = value;
    conditionsInfo.value = [...conditionsInfo.value];
};
const handleRemoveCondition = (idx: number) => {
    conditionsInfo.value.splice(idx, 1);
    conditionsInfo.value = [...conditionsInfo.value];
};
const handleClickAddCondition = () => {
    conditionsInfo.value = [...conditionsInfo.value, ''];
};

/* Watcher */
watch([dataTableInfo, conditionsInfo], ([_dataTableInfo, _conditionsInfo]) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        conditions: _conditionsInfo,
    };
}, { deep: true, immediate: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-transform-query">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.QUERY"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <div class="title-wrapper">
                <p-field-title class="field-title"
                               size="md"
                               color="dark"
                >
                    <div class="field-title-wrapper">
                        <span>{{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.CONDITION') }}</span>
                        <div class="left-area">
                            <widget-form-data-table-global-variable-view-button />
                        </div>
                    </div>
                </p-field-title>
            </div>
            <div class="query-type-conditions-wrapper">
                <!--                <p-select-dropdown class="query-operator-dropdown"-->
                <!--                                   size="sm"-->
                <!--                                   :menu="state.queryOperatorItems"-->
                <!--                                   :selected="operatorInfo"-->
                <!--                                   @update:selected="handleUpdateOperator"-->
                <!--                />-->
                <div v-for="(condition, cIdx) in conditionsInfo"
                     :key="`condition-${RANDOM_KEY}-${cIdx}`"
                     class="conditions-wrapper"
                >
                    <p-text-input class="label-input"
                                  block
                                  :value="condition"
                                  :placeholder="CONDITION_PLACEHOLDER"
                                  @update:value="handleChangeCondition(cIdx, $event)"
                    />
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   :disabled="conditionsInfo.length === 1"
                                   @click="handleRemoveCondition(cIdx)"
                    />
                </div>
                <div class="add-condition-wrapper">
                    <p-button style-type="tertiary"
                              icon-left="ic_plus_bold"
                              @click="handleClickAddCondition"
                    >
                        {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.ADD_CONDITION') }}
                    </p-button>
                    <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.query.html"
                            action-icon="external-link"
                            highlight
                            size="sm"
                            class="external-link"
                    >
                        Pandas Query
                    </p-link>
                </div>
            </div>
        </widget-form-data-table-card-transform-form-wrapper>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card-transform-query {
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
    .query-type-conditions-wrapper {
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem;
        margin-top: 0.25rem;
        .query-operator-dropdown {
            margin-bottom: 0.5rem;
        }
        .conditions-wrapper {
            @apply flex gap-1 items-center;
            margin-bottom: 0.5rem;
        }
        .add-condition-wrapper {
            @apply flex;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>
