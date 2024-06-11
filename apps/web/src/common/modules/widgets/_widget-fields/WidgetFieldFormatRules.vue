<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PIconButton, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import { FORMAT_RULE_TYPE } from '@/common/modules/widgets/configs/widget-field-config';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
    FormatRulesOptions, FormatRulesType,
} from '@/common/modules/widgets/types/widget-field-type';
import type { FormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


const props = withDefaults(defineProps<WidgetFieldComponentProps<FormatRulesOptions>>(), {
    widgetFieldSchema: () => ({}),
    value: () => [{
        threshold: 0,
        name: '',
        color: gray[200],
    }],
});
const emit = defineEmits<WidgetFieldComponentEmit<FormatRulesValue[]>>();
const state = reactive({
    proxyValue: useProxyValue<FormatRulesValue[]>('value', props, emit),
    menuItems: computed<MenuItem[]>(() => []), // TODO: generate menu items with options.dataTarget
    type: computed<FormatRulesType>(() => props.widgetFieldSchema.options?.formatRulesType ?? FORMAT_RULE_TYPE.nameAndThreshold),
    isFieldNameValid: [undefined],
    isAllValid: computed(() => state.isFieldNameValid.every((valid:boolean) => valid === true)),
});

/* Util */
const getInitialFormatRulesValue = (): FormatRulesValue => {
    const initialFormatRule: FormatRulesValue = {
        threshold: 0,
        color: gray[200],
    };
    if (state.type.includes(FORMAT_RULE_TYPE.nameAndThreshold)) {
        initialFormatRule.name = '';
    }
    return initialFormatRule;
};

/* Event */
const handleClickAddRule = () => {
    state.proxyValue = [...state.proxyValue, getInitialFormatRulesValue()];
    state.isFieldNameValid = [...state.isFieldNameValid, undefined];
};
const handleDelete = (idx: number) => {
    const _value = cloneDeep(state.proxyValue);
    _value.splice(idx, 1);
    state.proxyValue = _value;
    const updatedValue = cloneDeep(state.isFieldNameValid);
    updatedValue.splice(idx, 1);
    state.isFieldNameValid = updatedValue;
};
const handleFormatRuleInput = (idx: number|string, key: string, val: string) => {
    const _value = cloneDeep(state.proxyValue);
    _value[idx][key] = val;
    state.proxyValue = _value;
    if (key === 'name') {
        const updatedValue = cloneDeep(state.isFieldNameValid);
        updatedValue[idx] = val.length > 0;
        state.isFieldNameValid = updatedValue;
    }
};

/* Watcher */
watch(() => state.isAllValid, (isValid) => {
    emit('update:is-valid', isValid);
});

onMounted(() => {
    if (!state.proxyValue.length) {
        state.proxyValue = [getInitialFormatRulesValue()];
    }
});
</script>

<template>
    <div class="widget-field-format-rules">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
                       required
        >
            <div class="format-rules-wrapper">
                <p-button icon-left="ic_plus_bold"
                          style-type="tertiary"
                          class="add-button"
                          @click="handleClickAddRule"
                >
                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                </p-button>
                <div v-for="(formatRule, idx) in state.proxyValue"
                     :key="`format-rule-${formatRule.threshold}-${formatRule.color}-${idx}`"
                     class="format-rules-input-wrapper"
                >
                    <p-field-group v-if="state.type.includes(FORMAT_RULE_TYPE.nameAndThreshold)"
                                   :invalid="state.isFieldNameValid[idx] === false"
                                   :invalid-text="$t('COMMON.WIDGETS.COMPARISON.NAME_INVALID_TEXT')"
                                   required
                    >
                        <p-text-input :value="formatRule.name"
                                      :invalid="state.isFieldNameValid[idx] === false"
                                      placeholder="Name"
                                      multi-input
                                      @update:value="handleFormatRuleInput(idx, 'name', $event)"
                        />
                    </p-field-group>
                    <p-field-group required>
                        <p-text-input :value="formatRule.threshold"
                                      type="number"
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
                                       :disabled="state.proxyValue.length === 1"
                                       class="delete-button"
                                       @click="handleDelete(idx)"
                        />
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
    .format-rules-input-wrapper {
        @apply flex gap-2 items-start;
        padding-bottom: 0.5rem;

        .right-part {
            @apply flex gap-2 items-center;
            .color-input {
                flex-shrink: 0;
            }

            .delete-button {
                flex-shrink: 0;
                width: 2rem;
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
