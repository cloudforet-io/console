<script setup lang="ts">

import { computed, reactive } from 'vue';

import {
    PIconButton, PI, PFieldGroup, PSelectButton, PTextInput, PButton, PTextarea, PButtonModal,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import getRandomId from '@/lib/random-id-generator';

import { useProxyValue } from '@/common/composables/proxy-state';
import { EVAL_EXPRESSION_TYPE } from '@/common/modules/widgets/_constants/data-table-constant';
import type { EvalExpressions } from '@/common/modules/widgets/types/widget-data-table-type';
import type { EvaluateExpressionType } from '@/common/modules/widgets/types/widget-model';

interface Props {
    expressions: EvalExpressions[];
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
});

const modalState = reactive({
    visible: false,
    currentSelectionKey: undefined as string|undefined,
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
    modalState.visible = true;
    modalState.currentSelectionKey = key;
};
const handleConfirmDeleteExpression = () => {
    if (!modalState.currentSelectionKey) return;
    state.proxyExpressions = state.proxyExpressions.filter((expression) => expression.key !== modalState.currentSelectionKey);
    modalState.visible = false;
    modalState.currentSelectionKey = undefined;
    showSuccessMessage(i18n.t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_SUCCESS_TOOLTIP'));
};
const handleCancelModal = () => {
    modalState.visible = false;
    modalState.currentSelectionKey = undefined;
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
</script>

<template>
    <div class="widget-form-data-table-card-transform-form-evaluate">
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
                <p-field-group :label="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FIELD_FORMULA')"
                               required
                               style-type="secondary"
                >
                    <p-textarea v-model="expression.expression"
                                :placeholder="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.FORMULA_PLACEHOLDER')"
                    />
                </p-field-group>
            </div>
        </div>
        <p-button class="add-field-button"
                  style-type="tertiary"
                  icon-left="ic_plus_bold"
                  @click="handleClickAddLabel"
        >
            {{ $t('Add Field') }}
        </p-button>
        <p-button-modal :header-title="$t('COMMON.WIDGETS.DATA_TABLE.FORM.EVAL.DELETE_MODAL_TITLE')"
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
