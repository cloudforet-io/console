<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButton, PFieldGroup, PIconButton, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useGranularityMenuItem } from '@/common/modules/widgets/_composables/use-granularity-menu-items';
import {
    _FORMAT_RULE_TYPE,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getDefaultMenuItemIndex,
    getInitialSelectedMenuItem,
} from '@/common/modules/widgets/_helpers/widget-field-helper';
import { widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type {
    _FormatRulesValue, _FormatRulesOptions, ThresholdValue, _FormatRulesType,

} from '@/common/modules/widgets/_widget-fields/advanced-format-rules/type';
import type {
    _WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const FIELD_KEY = 'formatRules';

const props = defineProps<_WidgetFieldComponentProps<_FormatRulesOptions>>();
const { labelsMenuItem } = useGranularityMenuItem(props, FIELD_KEY);

const validator = widgetValidatorRegistry[FIELD_KEY];

const state = reactive({
    fieldValue: computed<_FormatRulesValue>(() => props.manager.data[FIELD_KEY].value),
    type: computed<_FormatRulesType>(() => props.widgetFieldSchema?.options?.formatRulesType as _FormatRulesType),
    invalid: computed(() => validator(state.fieldValue, props.widgetConfig)),
    selectedField: computed<string|undefined>(() => {
        if (props.widgetFieldSchema?.options?.useField) {
            return state.fieldValue.field;
        }
        return undefined;
    }),
});

/* Event */
const handleClickAddRule = () => {
    const _newRule: ThresholdValue = { number: undefined, text: undefined, color: state.fieldValue.baseColor };
    props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: [...state.fieldValue.rules, _newRule] });
};
const handleDelete = (idx: number) => {
    const _rules = cloneDeep(state.fieldValue.rules);
    _rules.splice(idx, 1);
    props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: _rules });
};
const handleFormatRuleInput = (idx: number|string, key: 'text'|'number'|'color', val: string) => {
    const _rules = cloneDeep(state.fieldValue.rules);
    _rules[idx][key] = key === 'number' ? parseFloat(val) : val;
    props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: _rules });
};
const handleBaseColor = (val: string) => {
    props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, baseColor: val });
};
const handleUpdateField = (val: string) => {
    props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, field: val });
};

/* Watcher */
// initial field value by labels info
watch(() => labelsMenuItem.value, (menuItem) => {
    if (menuItem?.length && props.widgetFieldSchema.options?.useField && !state.fieldValue.field) {
        const _defaultIndex = getDefaultMenuItemIndex(menuItem, state.fieldValue.field, true);
        const _selectedValue = getInitialSelectedMenuItem(menuItem, state.fieldValue.field, _defaultIndex);
        props.manager.setFieldValue(FIELD_KEY, { ...state.fieldValue, field: _selectedValue });
    }
}, { immediate: true });

</script>

<template>
    <div class="widget-field-format-rules">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
                       required
        >
            <template v-if="props.widgetFieldSchema?.options?.description"
                      #help
            >
                <span>{{ $t(props.widgetFieldSchema?.options?.description) }}</span>
            </template>
            <p-field-group v-if="props.widgetFieldSchema?.options?.useField"
                           :label="$t('COMMON.WIDGETS.FIELD')"
                           style-type="secondary"
                           required
                           class="pb-1"
            >
                <p-select-dropdown :menu="labelsMenuItem"
                                   :selected="state.selectedField"
                                   use-fixed-menu-style
                                   :invalid="state.selectedField === undefined"
                                   block
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
                    <div v-for="(rule, idx) in state.fieldValue.rules"
                         :key="`advanced-format-rule-${rule.color}-${idx}`"
                         class="format-rules-input-wrapper"
                    >
                        <div class="left-part"
                             :class="[state.type === _FORMAT_RULE_TYPE.textThreshold ? 'grid-cols-2' : 'grid-cols-1']"
                        >
                            <p-field-group v-if="state.type === _FORMAT_RULE_TYPE.textNumberTreshold || state.type === _FORMAT_RULE_TYPE.textThreshold"
                                           required
                            >
                                <p-text-input :value="rule.text"
                                              :invalid="!rule.text?.length"
                                              placeholder="text"
                                              @update:value="handleFormatRuleInput(idx, 'text', $event)"
                                />
                            </p-field-group>
                            <p-field-group v-if="state.type === _FORMAT_RULE_TYPE.textNumberTreshold
                                               || state.type === _FORMAT_RULE_TYPE.numberThreshold
                                               || state.type === _FORMAT_RULE_TYPE.percentThreshold"
                                           required
                            >
                                <p-text-input :value="rule.number"
                                              type="number"
                                              :min="0"
                                              placeholder="3000"
                                              :invalid="!rule.number?.length"
                                              @update:value="handleFormatRuleInput(idx, 'number', $event)"
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
                        <color-input :value="state.fieldValue.baseColor"
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
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
    width: 100%;
    flex-shrink: 1;
}
</style>
