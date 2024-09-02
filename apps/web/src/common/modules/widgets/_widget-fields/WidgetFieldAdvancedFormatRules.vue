<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButton, PFieldGroup, PIconButton, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import { ADVANCED_FORMAT_RULE_TYPE } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getDefaultMenuItemIndex,
    getInitialSelectedMenuItem,
} from '@/common/modules/widgets/_helpers/widget-field-helper';
import type {
    AdvancedFormatRulesOptions, AdvancedFormatRulesType,
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { FormatRulesValue, AdvancedFormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


/* NOTE: Base rule is saved only as a `baseColor` field, not `rules`. */

const DEFAULT_BASE_COLOR = gray[200];
const props = defineProps<WidgetFieldComponentProps<AdvancedFormatRulesOptions, AdvancedFormatRulesValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<AdvancedFormatRulesValue>>();
const { labelsMenuItem } = useGranularityMenuItem(props, 'advancedFormatRules');
const state = reactive({
    proxyValue: useProxyValue<AdvancedFormatRulesValue>('value', props, emit),
    baseColor: computed<string>(() => state.proxyValue?.baseColor ?? props.widgetFieldSchema?.options?.baseColor ?? DEFAULT_BASE_COLOR),
    type: computed<AdvancedFormatRulesType>(() => props.widgetFieldSchema?.options?.formatRulesType as AdvancedFormatRulesType),
    isValid: computed<boolean>(() => {
        if (!state.proxyValue) return false;
        if (state.type === ADVANCED_FORMAT_RULE_TYPE.textThreshold) {
            return state.proxyValue.value.every((d) => !!d.text && !!d.threshold && !!d.color);
        }
        if (!state.proxyValue.field) return false;
        if (state.proxyValue?.value) return state.proxyValue.value.every((d) => !!d.text && !!d.color);
        return true;
    }),
});

/* Event */
const handleClickAddRule = () => {
    const _newRule: FormatRulesValue = { text: undefined, color: state.baseColor };
    if (state.type === ADVANCED_FORMAT_RULE_TYPE.textThreshold) {
        _newRule.threshold = undefined;
    }
    state.proxyValue = {
        ...state.proxyValue,
        value: [...state.proxyValue.value, _newRule],
    };
};
const handleDelete = (idx: number) => {
    const _value = cloneDeep(state.proxyValue.value);
    _value.splice(idx, 1);
    state.proxyValue = { ...state.proxyValue, value: _value };
};
const handleFormatRuleInput = (idx: number|string, key: 'text'|'threshold'|'color', val: string) => {
    const _value = cloneDeep(state.proxyValue.value);
    _value[idx][key] = val;
    state.proxyValue = { ...state.proxyValue, value: _value };
};
const handleBaseColor = (val: string) => {
    state.proxyValue = { ...state.proxyValue, baseColor: val };
};
const handleUpdateField = (val: string) => {
    state.proxyValue = { ...state.proxyValue, field: val };
};

/* Watcher */
watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
}, { immediate: true });
watch(() => labelsMenuItem.value, (menuItem) => {
    if (menuItem?.length && state.type === ADVANCED_FORMAT_RULE_TYPE.field && !state.proxyValue?.field) {
        const _defaultIndex = getDefaultMenuItemIndex(menuItem, state.proxyValue?.field, true);
        const _selectedValue = getInitialSelectedMenuItem(menuItem, state.proxyValue?.field, _defaultIndex);
        state.proxyValue = { ...state.proxyValue, field: _selectedValue };
    }
}, { immediate: true });
onMounted(() => {
    state.proxyValue = {
        ...state.proxyValue,
        value: props.value?.value ?? [],
        baseColor: props.value?.baseColor ?? props.widgetFieldSchema?.options?.baseColor ?? DEFAULT_BASE_COLOR,
    };
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
            <p-field-group v-if="state.type === 'field'"
                           :label="$t('COMMON.WIDGETS.FIELD')"
                           style-type="secondary"
                           required
                           class="pb-1"
            >
                <p-select-dropdown :menu="labelsMenuItem"
                                   class="w-full"
                                   :selected="state.proxyValue?.field"
                                   use-fixed-menu-style
                                   :invalid="state.proxyValue?.field === undefined"
                                   @update:selected="handleUpdateField"
                />
            </p-field-group>
            <div class="format-rules-wrapper">
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
                          class="add-button"
                          @click="handleClickAddRule"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                </p-button>
                <div class="custom-menu-box">
                    <div v-for="(rule, idx) in state.proxyValue?.value"
                         :key="`advanced-format-rule-${rule.color}-${idx}`"
                         class="format-rules-input-wrapper"
                    >
                        <div class="left-part"
                             :class="[state.type === ADVANCED_FORMAT_RULE_TYPE.textThreshold ? 'grid-cols-2' : 'grid-cols-1']"
                        >
                            <p-field-group required>
                                <p-text-input :value="rule.text"
                                              :invalid="!rule.text?.length"
                                              placeholder="text"
                                              @update:value="handleFormatRuleInput(idx, 'text', $event)"
                                />
                            </p-field-group>
                            <p-field-group v-if="state.type === ADVANCED_FORMAT_RULE_TYPE.textThreshold"
                                           required
                            >
                                <p-text-input :value="rule.threshold"
                                              type="number"
                                              :min="0"
                                              placeholder="3000"
                                              :invalid="!rule.threshold?.length"
                                              @update:value="handleFormatRuleInput(idx, 'threshold', $event)"
                                />
                            </p-field-group>
                        </div>
                        <div class="right-part">
                            <color-input :value="rule.color"
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
        }

        .left-part {
            @apply grid gap-2;
            width: 100%;
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
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
    width: 100%;
    flex-shrink: 1;
    .p-text-input > .input-container input {
        width: 100%;
    }
}
</style>
