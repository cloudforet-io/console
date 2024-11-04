<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PIconButton, PI, PFieldGroup, PSelectButton, PTextInput, PButton, PTextarea, PButtonModal, PToggleButton, PLink, PFieldTitle,
} from '@cloudforet/mirinae';
import { ACTION_ICON } from '@cloudforet/mirinae/src/inputs/link/type';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import WidgetFormDataTableGlobalVariableViewButton
    from '@/common/modules/widgets/_components/WidgetFormDataTableGlobalVariableViewButton.vue';
import { EVAL_EXPRESSION_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { EvalExpressions } from '@/common/modules/widgets/types/widget-data-table-type';
import type { EvaluateExpressionType } from '@/common/modules/widgets/types/widget-model';



interface Props {
    expressions: (EvalExpressions[]|string[]);
    isLegacyDataTable?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{ e: 'update:expressions'; value: EvalExpressions[]}>();

const state = reactive({
    proxyExpressions: useProxyValue<EvalExpressions[]>('expressions', props, emit),
    fieldTypeMenuItems: computed<MenuItem[]>(() => [
        {
            name: EVAL_EXPRESSION_TYPE.LABEL,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.TYPE_LABEL_FIELD'),
        },
        {
            name: EVAL_EXPRESSION_TYPE.DATA,
            label: i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.TYPE_DATA_FIELD'),
        },
    ]),
    globalVariablePopperVisible: false,
});

const modalState = reactive({
    visible: false,
    currentSelectionKey: undefined as string|undefined,
    currentSelectionName: undefined as string|undefined,
});

/* Events */
const handleToggleExpressionCard = (key: string) => {
    state.proxyExpressions = state.proxyExpressions.map((expression) => {
        if (expression.key === key) {
            return {
                ...expression,
                isCollapsed: !expression.isCollapsed,
            };
        }
        return expression;
    });
};
const handleClickDeleteExpression = (key: string) => {
    const targetExpression = state.proxyExpressions.find((d) => d.key === key);
    if (!targetExpression?.name && !targetExpression?.expression) {
        state.proxyExpressions = state.proxyExpressions.filter((expression) => expression.key !== key);
        return;
    }
    modalState.visible = true;
    modalState.currentSelectionKey = key;
    modalState.currentSelectionName = targetExpression?.name;
};
const handleConfirmDeleteExpression = () => {
    if (!modalState.currentSelectionKey) return;
    state.proxyExpressions = state.proxyExpressions.filter((expression) => expression.key !== modalState.currentSelectionKey);
    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_SUCCESS_TOOLTIP', { field_name: modalState.currentSelectionName }), '');
    modalState.visible = false;
    modalState.currentSelectionKey = undefined;
    modalState.currentSelectionName = undefined;
};
const handleCancelModal = () => {
    modalState.visible = false;
    modalState.currentSelectionKey = undefined;
    modalState.currentSelectionName = undefined;
};
const handleChangeFieldType = (key: string, selected: EvaluateExpressionType) => {
    state.proxyExpressions = state.proxyExpressions.map((expression) => {
        if (expression.key === key) {
            return {
                ...expression,
                fieldType: selected,
            };
        }
        return expression;
    });
};
const handleClickAddLabel = () => {
    state.proxyExpressions = [
        ...state.proxyExpressions,
        {
            key: getRandomId(),
            fieldType: EVAL_EXPRESSION_TYPE.DATA,
            name: '',
            expression: '',
            isCollapsed: false,
        },
    ];
};
const handleToggleCondition = (key: string) => {
    const targetExpression = state.proxyExpressions.find((d) => d.key === key);
    if (!targetExpression) return;
    if ('condition' in targetExpression) {
        delete targetExpression.condition;
        delete targetExpression.else;
    } else {
        targetExpression.condition = '';
        targetExpression.else = '';
    }
    state.proxyExpressions = [...state.proxyExpressions];
};
</script>

<template>
    <div class="widget-form-data-table-card-transform-form-evaluate">
        <template v-if="!props.isLegacyDataTable">
            <div v-for="(expression) in state.proxyExpressions"
                 :key="expression.key"
                 :class="{'expression-form-card': true, collapsed: expression.isCollapsed}"
            >
                <div class="form-header"
                     @click="handleToggleExpressionCard(expression.key)"
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
                                   :disabled="state.proxyExpressions.length === 1"
                                   @click.stop="handleClickDeleteExpression(expression.key)"
                    />
                </div>
                <div class="form-body">
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FIELD_TYPE')"
                                   required
                                   style-type="secondary"
                    >
                        <div class="flex gap-2">
                            <p-select-button v-for="selectItem in state.fieldTypeMenuItems"
                                             :key="`select-button-${selectItem.name}`"
                                             :value="selectItem.name"
                                             style-type="secondary"
                                             :selected="expression.fieldType"
                                             @change="handleChangeFieldType(expression.key, $event)"
                            >
                                {{ selectItem.label }}
                            </p-select-button>
                        </div>
                    </p-field-group>
                    <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FIELD_NAME')"
                                   required
                                   style-type="secondary"
                    >
                        <p-text-input v-model="expression.name"
                                      block
                        />
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
                            <p-field-title size="sm"
                                           color="gray"
                                           required
                                           class="use-condition-title"
                                           :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.USE_CONDITION')"
                            >
                                <template #right>
                                    <p-toggle-button :value="'condition' in expression"
                                                     class="condition-toggle-button"
                                                     @change-toggle="handleToggleCondition(expression.key)"
                                    />
                                </template>
                            </p-field-title>
                            <p-field-group v-if="'condition' in expression"
                                           :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.CONDITION')"
                                           style-type="secondary"
                                           required
                                           class="expression-form"
                            >
                                <template #label-extra>
                                    <div class="condition-form-extra justify-between inline-flex">
                                        <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.query.html"
                                                :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                                highlight
                                                class="external-link"
                                        >
                                            Pandas Query
                                        </p-link>
                                    </div>
                                </template>
                                <p-textarea v-model="expression.condition"
                                            :placeholder="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.CONDITION_PLACEHOLDER')"
                                />
                            </p-field-group>
                            <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FORMULA')"
                                           style-type="secondary"
                                           required
                                           class="expression-form"
                            >
                                <template #label-extra>
                                    <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.eval.html"
                                            :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                            highlight
                                            class="external-link"
                                    >
                                        Pandas Eval
                                    </p-link>
                                </template>
                                <p-textarea v-model="expression.expression"
                                            :placeholder="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FORMULA_PLACEHOLDER')"
                                />
                            </p-field-group>
                            <p-field-group v-if="'condition' in expression"
                                           :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.ELSE')"
                                           style-type="secondary"
                                           required
                                           class="expression-form"
                            >
                                <template #label-extra>
                                    <p-link href="https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.eval.html"
                                            :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                            highlight
                                            class="external-link"
                                    >
                                        Pandas Eval
                                    </p-link>
                                </template>
                                <p-textarea v-model="expression.else"
                                            :placeholder="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FORMULA_PLACEHOLDER')"
                                />
                            </p-field-group>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <p-field-group v-else
                       :label="'Expression'"
                       required
        >
            <div class="legacy-expression-wrapper">
                <div v-for="(expression) in props.expressions"
                     :key="expression"
                     class="expressions-wrapper"
                >
                    <p-text-input class="label-input"
                                  block
                                  :value="expression"
                                  disabled
                    />
                    <p-icon-button name="ic_delete"
                                   size="sm"
                                   disabled
                    />
                </div>
            </div>
        </p-field-group>

        <p-button v-if="!props.isLegacyDataTable"
                  class="add-field-button"
                  style-type="tertiary"
                  icon-left="ic_plus_bold"
                  @click="handleClickAddLabel"
        >
            {{ $t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.ADD_FIELD') }}
        </p-button>
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
.widget-form-data-table-card-transform-form-evaluate {
    @apply flex flex-col gap-2;
    .expression-form-card {
        @apply border border-gray-200 rounded-lg;
        padding: 0.625rem 0.5rem;

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
    .legacy-expression-wrapper {
        @apply bg-gray-100 rounded-lg;
        padding: 0.5rem;
        margin-top: 0.25rem;
        .expressions-wrapper {
            @apply flex gap-1 items-center;
            margin-bottom: 0.5rem;
        }
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
