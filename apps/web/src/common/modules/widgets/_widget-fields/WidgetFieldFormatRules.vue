<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton, PFieldGroup, PIconButton, PTextInput,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/configs/widget-field-config';
import type {
    FormatRulesOptions,
    FormatRulesType,
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { FormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { violet } from '@/styles/colors';


const props = withDefaults(defineProps<WidgetFieldComponentProps<FormatRulesOptions>>(), {
    widgetFieldSchema: () => ({}),
});
const emit = defineEmits<WidgetFieldComponentEmit<FormatRulesValue[]>>();
const state = reactive({
    customValue: props.widgetFieldSchema.options?.default ?? [],
    baseColor: props.widgetFieldSchema.options?.baseColor ?? violet[400],
    value: computed(() => [{ threshold: 0, color: state.baseColor }, ...state.customValue]),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    type: computed<FormatRulesType>(() => props.widgetFieldSchema.options?.formatRulesType ?? FORMAT_RULE_TYPE.threshold),
    isFieldNameValid: [undefined],
    isAllValid: computed(() => state.isFieldNameValid.every((valid:boolean) => valid)),
});

/* Util */
const getInitialFormatRulesValue = (): FormatRulesValue => ({
    threshold: undefined,
    color: props.widgetFieldSchema?.options?.baseColor ?? violet[400],
});

/* Event */
const handleClickAddRule = () => {
    state.customValue = [...state.customValue, getInitialFormatRulesValue()];
    state.isFieldNameValid = [...state.isFieldNameValid, undefined];
};
const handleDelete = (idx: number) => {
    const _customValue = cloneDeep(state.customValue);
    _customValue.splice(idx, 1);
    state.customValue = _customValue;
    const updatedCustomValue = cloneDeep(state.isFieldNameValid);
    updatedCustomValue.splice(idx, 1);
    state.isFieldNameValid = updatedCustomValue;
};
const handleFormatRuleInput = (idx: number|string, key: 'threshold'|'color', val: string) => {
    const _customValue = cloneDeep(state.customValue);
    _customValue[idx][key] = val;
    state.customValue = _customValue;
};

const handleBaseColor = (val: string) => {
    state.baseColor = val;
};

/* Watcher */
watch(() => state.isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
});

watch(() => state.value, (value) => {
    emit('update:value', value);
});
</script>

<template>
    <div class="widget-field-format-rules">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
                       required
        >
            <template #help>
                <span>{{ $t(props.widgetFieldSchema?.options?.description) }}</span>
            </template>
            <div class="format-rules-wrapper">
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
                          class="add-button"
                          @click="handleClickAddRule"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                </p-button>
                <div class="custom-menu-box">
                    <div v-for="(formatRule, idx) in state.customValue"
                         :key="idx"
                         class="format-rules-input-wrapper"
                    >
                        <p-field-group required>
                            <p-text-input :value="formatRule.threshold"
                                          type="number"
                                          :name="`format-rule-threshold-${idx}`"
                                          :min="0"
                                          @update:value="handleFormatRuleInput(idx, 'threshold', $event)"
                            >
                                <template v-if="state.type === FORMAT_RULE_TYPE.percentThreshold"
                                          #input-right
                                >
                                    %
                                </template>
                            </p-text-input>
                        </p-field-group>
                        <div class="right-part">
                            <color-input :value="formatRule.color"
                                         class="color-input"
                                         @update:value="handleFormatRuleInput(idx, 'color', $event)"
                            />
                            <p-icon-button name="ic_delete"
                                           style-type="negative-transparent"
                                           size="sm"
                                           class="delete-button"
                                           @click="handleDelete(idx)"
                            />
                        </div>
                    </div>
                </div>
                <div class="format-rules-input-wrapper">
                    <p-text-input :value="0"
                                  type="number"
                                  disabled
                    >
                        <span class="base-label">{{ $t('COMMON.WIDGETS.FORMAT_RULES.BASE') }}</span>
                    </p-text-input>
                    <div class="right-part">
                        <color-input :value="state.baseColor"
                                     class="color-input"
                                     @update:value="handleBaseColor"
                        />
                        <div class="block" />
                    </div>
                </div>
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0.75rem;
    padding: 0;
}

.format-rules-wrapper {
    @apply bg-gray-100 rounded-md;
    padding: 0.5rem;
    .add-button {
        margin-bottom: 0.5rem;
    }

    .custom-menu-box {
        @apply flex flex-col-reverse;
    }

    .format-rules-input-wrapper {
        @apply flex gap-2 items-start;
        padding-bottom: 0.5rem;

        .base-label {
            @apply text-label-md;
            line-height: 1.09375rem;
        }

        .right-part {
            @apply flex gap-2 items-center;
            .color-input {
                flex-shrink: 0;
            }

            .delete-button {
                flex-shrink: 0;
                width: 2rem;
            }

            .block {
                flex-shrink: 0;
                width: 1.5rem;
            }
        }

        /* custom design-system component - p-text-input */
        :deep(.p-text-input) {
            width: 100%;
        }

        :deep(.p-field-group) {
            margin-bottom: 0;
            width: 100%;
            flex-shrink: 1;
        }
    }
}
</style>
