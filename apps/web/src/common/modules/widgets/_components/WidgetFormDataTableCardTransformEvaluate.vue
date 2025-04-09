<script setup lang="ts">
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { cloneDeep } from 'lodash';

import {
    PIconButton, PI, PFieldGroup, PSelectButton, PTextInput, PButton, PTextarea, PButtonModal, PToggleButton, PLink, PFieldTitle,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableCardTransformFormWrapper
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardTransformFormWrapper.vue';
import WidgetFormDataTableGlobalVariableViewButton
    from '@/common/modules/widgets/_components/WidgetFormDataTableGlobalVariableViewButton.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_FIELD_TYPE, DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { TransformDataTableInfo, TransformDataTableProps } from '@/common/modules/widgets/types/widget-data-table-type';
import type { EvalOptions } from '@/common/modules/widgets/types/widget-model';




type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const props = defineProps<TransformDataTableProps<EvalOptions>>();
const emit = defineEmits<{(e: 'update:operator-options', value: EvalOptions): void;
    (e: 'update:invalid', value: boolean): void;
}>();

const dataTableInfo = ref<TransformDataTableInfo>({
    dataTableId: props.originData?.data_table_id,
});
const expressionsInfo = ref<EvalOptions['expressions']>(cloneDeep(props.originData.expressions) || []);

const CONDITION_PLACEHOLDER = '{{ Product }} == \'A\' & {{ Provider }} == \'B\'';
const FORMULA_PLACEHOLDER = '{{ Product }}';

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});


const storeState = reactive({
    currentDataTable: computed<Partial<DataTableModel>|undefined>(() => dataTableList.value.find((d) => d.data_table_id === dataTableInfo.value.dataTableId)),
});
const state = reactive({
    proxyOperatorOptions: useProxyValue<EvalOptions>('operator-options', props, emit),
    collapsedIndexList: [] as number[],
    fieldTypeMenuItems: computed<MenuItem[]>(() => [
        {
            name: DATA_TABLE_FIELD_TYPE.LABEL,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.TYPE_LABEL_FIELD'),
        },
        {
            name: DATA_TABLE_FIELD_TYPE.DATA,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.TYPE_DATA_FIELD'),
        },
    ]),
    globalVariablePopperVisible: false,
    invalid: computed<boolean>(() => {
        if (!state.proxyOperatorOptions.data_table_id) return true;
        // const fieldNames = expressionsInfo.value.map((d) => d.name);
        // if (fieldNames.length !== new Set(fieldNames).size) return true;
        if (!expressionsInfo.value.every((d) => !!d.name && !!d.expression)) return true;
        if (expressionsInfo.value.some((d) => !isFieldNameValid(d.name, storeState.currentDataTable))) return true;
        return false;
    }),
});

const modalState = reactive({
    visible: false,
    currentSelectionName: undefined as string|undefined,
});

/* Helper */
const getInvalidFieldNameText = (fieldName?: string): TranslateResult|undefined => {
    if (!fieldName) return undefined;
    if (!isFieldNameValid(fieldName, storeState.currentDataTable)) return i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.DUPLICATED_FIELD_NAME');
    return undefined;
};
const isFieldNameValid = (fieldName: string, dataTable?: PublicDataTableModel|PrivateDataTableModel): boolean => {
    if (!dataTable) return true;
    const _dataInfoKeys = Object.keys(dataTable.data_info || {});
    return !_dataInfoKeys.includes(fieldName);
};


/* Events */
const handleToggleExpressionCard = (idx: number) => {
    if (state.collapsedIndexList.includes(idx)) {
        state.collapsedIndexList = state.collapsedIndexList.filter((d) => d !== idx);
    } else {
        state.collapsedIndexList.push(idx);
    }
};
const handleClickDeleteExpression = (idx: number) => {
    const targetExpression = expressionsInfo.value[idx];
    if (!targetExpression?.name && !targetExpression?.expression) {
        expressionsInfo.value = expressionsInfo.value.filter((d, i) => i !== idx);
        return;
    }
    modalState.visible = true;
    modalState.currentSelectionName = targetExpression?.name;
};
const handleConfirmDeleteExpression = () => {
    if (!modalState.currentSelectionName) return;
    expressionsInfo.value = expressionsInfo.value.filter((expression) => expression.name !== modalState.currentSelectionName);
    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_SUCCESS_TOOLTIP', { field_name: modalState.currentSelectionName }), '');
    modalState.visible = false;
    modalState.currentSelectionName = undefined;
};
const handleCancelModal = () => {
    modalState.visible = false;
    modalState.currentSelectionName = undefined;
};
const handleChangeFieldValue = (idx: number, fieldName: string, value: string) => {
    const targetExpression = expressionsInfo.value[idx];
    if (!targetExpression) return;
    expressionsInfo.value = expressionsInfo.value.map((expression, i) => {
        if (i === idx) {
            return {
                ...expression,
                [fieldName]: value,
            };
        }
        return expression;
    });
};
const handleClickAddField = () => {
    expressionsInfo.value = [
        ...expressionsInfo.value,
        {
            field_type: DATA_TABLE_FIELD_TYPE.DATA,
            name: '',
            expression: '',
        },
    ];
};
const handleToggleCondition = (idx: number) => {
    const targetExpression = expressionsInfo.value[idx];
    if ('condition' in targetExpression) {
        delete targetExpression.condition;
    } else {
        targetExpression.condition = '';
    }
    expressionsInfo.value = [...expressionsInfo.value];
};

/* Watcher */
watch([dataTableInfo, expressionsInfo], ([_dataTableInfo, _expressionsInfo]) => {
    state.proxyOperatorOptions = {
        data_table_id: _dataTableInfo.dataTableId,
        expressions: _expressionsInfo,
    };
}, { deep: true, immediate: true });
watch(() => state.invalid, (_invalid) => {
    emit('update:invalid', _invalid);
}, { immediate: true });
</script>

<template>
    <div class="widget-form-data-table-card-transform-evaluate">
        <widget-form-data-table-card-transform-form-wrapper :data-table-id="props.baseDataTableId"
                                                            :operator="DATA_TABLE_OPERATOR.EVAL"
                                                            :data-table-info.sync="dataTableInfo"
        >
            <div v-for="(expression, eIdx) in expressionsInfo"
                 :key="`expression-${eIdx}`"
                 :class="{'expression-form-card': true, collapsed: state.collapsedIndexList.includes(eIdx)}"
            >
                <div class="form-header"
                     @click="handleToggleExpressionCard(eIdx)"
                >
                    <div class="title">
                        <p-i name="ic_chevron-down"
                             width="1.5rem"
                             height="1.5rem"
                             class="arrow-button"
                        />
                        <span v-if="expression.name"
                              class="expression-name"
                        >{{ expression.name }}</span>
                        <span v-else
                              class="expression-name placeholder"
                        >
                            {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.TITLE_PLACEHOLDER') }}
                        </span>
                    </div>
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   :disabled="expressionsInfo.length === 1"
                                   @click.stop="handleClickDeleteExpression(eIdx)"
                    />
                </div>
                <div class="form-body">
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_TYPE')"
                                   required
                                   style-type="secondary"
                    >
                        <div class="flex gap-2">
                            <p-select-button v-for="selectItem in state.fieldTypeMenuItems"
                                             :key="`select-button-${selectItem.name}`"
                                             :value="selectItem.name"
                                             style-type="secondary"
                                             :selected="expression.field_type"
                                             @change="handleChangeFieldValue(eIdx, 'field_type', $event)"
                            >
                                {{ selectItem.label }}
                            </p-select-button>
                        </div>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.FIELD_NAME')"
                                   required
                                   style-type="secondary"
                                   :invalid-text="getInvalidFieldNameText(expression.name)"
                                   :invalid="!!getInvalidFieldNameText(expression.name)"
                    >
                        <template #default="{invalid}">
                            <p-text-input v-model="expression.name"
                                          block
                                          :invalid="invalid"
                            />
                        </template>
                    </p-field-group>
                    <div>
                        <div class="field-expression-title-wrapper">
                            <p-field-title class="field-title"
                                           size="sm"
                                           color="gray"
                            >
                                <div class="field-title-wrapper">
                                    <span>{{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FIELD_EXPRESSION') }}</span>
                                    <div class="left-area">
                                        <widget-form-data-table-global-variable-view-button />
                                    </div>
                                </div>
                            </p-field-title>
                        </div>
                        <div class="field-expression-wrapper">
                            <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.CONDITION')"
                                           style-type="secondary"
                                           required
                                           class="expression-form"
                            >
                                <template #label-extra>
                                    <div class="condition-form-extra justify-between inline-flex">
                                        <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.query.html"
                                                action-icon="external-link"
                                                highlight
                                                class="external-link"
                                        >
                                            Pandas Query
                                        </p-link>
                                        <p-toggle-button :value="'condition' in expression"
                                                         class="condition-toggle-button"
                                                         @change-toggle="handleToggleCondition(eIdx)"
                                        />
                                    </div>
                                </template>
                                <p-textarea v-if="'condition' in expression"
                                            :value.sync="expression.condition"
                                            :placeholder="CONDITION_PLACEHOLDER"
                                            @update:value="handleChangeFieldValue(eIdx, 'condition', $event)"
                                />
                            </p-field-group>
                            <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FORMULA')"
                                           style-type="secondary"
                                           required
                                           class="expression-form"
                            >
                                <template #label-extra>
                                    <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.eval.html"
                                            action-icon="external-link"
                                            highlight
                                            class="external-link"
                                    >
                                        Pandas Eval
                                    </p-link>
                                </template>
                                <p-textarea v-model="expression.expression"
                                            :placeholder="FORMULA_PLACEHOLDER"
                                />
                            </p-field-group>
                        </div>
                    </div>
                </div>
            </div>
            <p-button class="add-field-button"
                      style-type="tertiary"
                      icon-left="ic_plus_bold"
                      @click="handleClickAddField"
            >
                {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.ADD_FIELD') }}
            </p-button>
        </widget-form-data-table-card-transform-form-wrapper>
        <p-button-modal :header-title="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_MODAL_TITLE', { field_name: modalState.currentSelectionName })"
                        :visible.sync="modalState.visible"
                        size="sm"
                        theme-color="alert"
                        @confirm="handleConfirmDeleteExpression"
                        @cancel="handleCancelModal"
        >
            <template #body>
                <p>
                    {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_MODAL_DESC') }}
                </p>
            </template>
        </p-button-modal>
    </div>
</template>

<style scoped lang="postcss">
.widget-form-data-table-card-transform-evaluate {
    .expression-form-card {
        @apply border border-gray-200 rounded-lg;
        padding: 0.625rem 0.5rem;
        margin-bottom: 0.5rem;

        .form-header {
            @apply w-full flex items-center justify-between cursor-pointer;
            height: 1.5rem;
            .title {
                @apply flex items-center gap-1;
                .expression-name {
                    @apply text-label-md text-gray-900 font-bold;

                    &.placeholder {
                        @apply text-gray-400 font-normal;
                    }
                }
            }
        }
        &.collapsed {
            .form-body {
                display: none;
            }
            .arrow-button {
                transform: rotate(-90deg);
            }
        }

        .form-body {
            padding: 0.5rem 0.5rem 0;

            .field-expression-title-wrapper {
                margin-bottom: 0.25rem;

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

            .field-expression-wrapper {
                @apply bg-gray-100 rounded;
                position: relative;
                padding: 0.5rem;
                .expression-form {
                    @apply bg-white rounded;
                    position: relative;
                    padding: 0.5rem;
                    .external-link {
                        font-weight: normal;
                    }
                }
                .use-condition-title {
                    margin-bottom: 0.5rem;
                }
                .condition-toggle-button {
                    right: 0.5rem;
                    position: absolute;
                }
            }
        }
    }
    .add-field-button {
        margin-top: 0.5rem;
        width: 6.8125rem;
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0.5rem;
}

/* custom design-system component - p-textarea */
:deep(.p-textarea) {
    @apply text-code-md font-normal;
    font-family: Inconsolata, monospace;
}
</style>
