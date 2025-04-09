<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButton, PFieldGroup, PIconButton, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import {
    FORMAT_RULE_TYPE,
} from '@/common/modules/widgets/_constants/widget-field-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import { widgetValidatorRegistry } from '@/common/modules/widgets/_widget-field-value-manager/constant/validator-registry';
import type {
    FormatRulesValue, FormatRulesOptions, ThresholdValue, FormatRulesType,

} from '@/common/modules/widgets/_widget-fields/format-rules/type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';



const FIELD_KEY = 'formatRules';

const props = defineProps<WidgetFieldComponentProps<FormatRulesOptions>>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;

const validator = widgetValidatorRegistry[FIELD_KEY];

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const state = reactive({
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === widgetGenerateState.selectedDataTableId)),
    fieldValue: computed<FormatRulesValue>(() => props.fieldManager.data[FIELD_KEY].value),
    type: computed<FormatRulesType>(() => props.widgetFieldSchema?.options?.formatRulesType as FormatRulesType),
    invalid: computed(() => !validator(state.fieldValue, props.widgetConfig, state.selectedDataTable)),
    fieldInvalid: computed(() => {
        if (!props.widgetFieldSchema?.options?.useField) return false;
        if (state.fieldValue.field === undefined) return true;
        const dependentField = props.widgetFieldSchema?.options?.dependentField;
        const dependentValue: string|string[]|undefined = props.fieldManager.data[dependentField]?.value?.data;
        if (dependentField && dependentValue) {
            if (Array.isArray(dependentValue)) {
                return dependentValue.includes(state.fieldValue.field);
            }
            return dependentValue === state.fieldValue.field;
        }
        return false;
    }),
    selectedField: computed<string|undefined>(() => {
        if (props.widgetFieldSchema?.options?.useField) {
            return state.fieldValue.field;
        }
        return undefined;
    }),
    menuItems: computed<MenuItem[]>(() => {
        const dataTarget = props.widgetFieldSchema?.options?.dataTarget;
        if (!state.selectedDataTable || !dataTarget) return [];
        const dataInfoList = sortWidgetTableFields(Object.keys(state.selectedDataTable?.[dataTarget] ?? {})) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
});

/* Event */
const handleClickAddRule = () => {
    const _newRule: ThresholdValue = { number: undefined, text: undefined, color: state.fieldValue.baseColor };
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: [...state.fieldValue.rules, _newRule] });
};
const handleDelete = (idx: number) => {
    const _rules = cloneDeep(state.fieldValue.rules);
    _rules.splice(idx, 1);
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: _rules });
};
const handleFormatRuleInput = (idx: number|string, key: 'text'|'number'|'color', val: string) => {
    const _rules = cloneDeep(state.fieldValue.rules);
    _rules[idx][key] = key === 'number' ? parseFloat(val) : val;
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, rules: _rules });
};
const handleBaseColor = (val: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, baseColor: val });
};
const handleUpdateField = (val: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, { ...state.fieldValue, field: val });
};

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
                <p-select-dropdown :menu="state.menuItems"
                                   :selected="state.selectedField"
                                   use-fixed-menu-style
                                   :invalid="state.fieldInvalid"
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
                             :class="[state.type === FORMAT_RULE_TYPE.textNumberThreshold ? 'grid-cols-2' : 'grid-cols-1']"
                        >
                            <p-field-group v-if="state.type === FORMAT_RULE_TYPE.textNumberThreshold || state.type === FORMAT_RULE_TYPE.textThreshold"
                                           required
                            >
                                <p-text-input :value="rule.text"
                                              :invalid="!rule.text?.length"
                                              placeholder="text"
                                              @update:value="handleFormatRuleInput(idx, 'text', $event)"
                                />
                            </p-field-group>
                            <p-field-group v-if="state.type === FORMAT_RULE_TYPE.textNumberThreshold
                                               || state.type === FORMAT_RULE_TYPE.numberThreshold
                                               || state.type === FORMAT_RULE_TYPE.percentThreshold"
                                           required
                            >
                                <p-text-input :value="rule.number"
                                              type="number"
                                              :min="0"
                                              placeholder="3000"
                                              :invalid="Number.isNaN(rule.number)"
                                              @update:value="handleFormatRuleInput(idx, 'number', $event)"
                                >
                                    <template v-if="state.type === FORMAT_RULE_TYPE.percentThreshold"
                                              #input-right
                                    >
                                        %
                                    </template>
                                </p-text-input>
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
