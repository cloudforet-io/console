<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PTextInput, PToggleButton, PSelectDropdown, PButton, PIconButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import ColorInput from '@/common/components/inputs/ColorInput.vue';
import { useProxyValue } from '@/common/composables/proxy-state';
import type {
    ProgressBarOptions,
    WidgetFieldComponentEmit,
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';
import type { ProgressBarValue, FormatRulesValue } from '@/common/modules/widgets/types/widget-field-value-type';

import { indigo } from '@/styles/colors';

const emit = defineEmits<WidgetFieldComponentEmit<ProgressBarValue|undefined>>();

const props = withDefaults(defineProps<WidgetFieldComponentProps<ProgressBarOptions, ProgressBarValue>>(), {
    widgetFieldSchema: () => ({}),
});

const state = reactive({
    toggleValue: !!props.value,
    proxyValue: useProxyValue<Partial<ProgressBarValue>|undefined>('value', props, emit),
    menuItems: computed<MenuItem[]>(() => {
        if (!props.dataTable) return [];
        const dataInfoList = Object.keys(props.dataTable.data_info ?? {}) ?? [];
        return dataInfoList.map((d) => ({
            name: d,
            label: d,
        }));
    }),
    formatRulesValidationList: [] as (boolean|undefined)[],
    isAllValid: computed<boolean>(() => {
        if (!state.toggleValue) return true;
        return (state.formatRulesValidationList.every((valid:boolean) => valid) && !!state.proxyValue?.fieldName && !!state.proxyValue?.basisField && !!state.proxyValue?.totalField);
    }),
});

/* Event */
const handleChangeToggleButton = (val: boolean) => {
    state.toggleValue = val;
    if (!val) state.proxyValue = undefined;
    else {
        initValue();
    }
};

const handleUpdateSelect = (val: string, target: 'basisField'|'totalField') => {
    if (val === state.proxyValue?.[target]) return;
    state.proxyValue = { ...state.proxyValue, [target]: val };
};

const handleUpdateFieldName = (val: string) => {
    if (val === state.proxyValue?.fieldName) return;
    state.proxyValue = { ...state.proxyValue, fieldName: val };
};

// Format Rules
const getInitialFormatRulesValue = (): FormatRulesValue => ({
    threshold: undefined,
    color: props.widgetFieldSchema?.options?.baseColor ?? indigo[500],
});
const handleBaseColor = (val: string) => {
    state.proxyValue = {
        ...state.proxyValue,
        baseColor: val,
    };
};
const handleClickAddFormatRule = () => {
    state.proxyValue = {
        ...state.proxyValue,
        formatRules: [
            ...state.proxyValue?.formatRules ?? [],
            getInitialFormatRulesValue(),
        ],
    };
    state.formatRulesValidationList = [...state.formatRulesValidationList, undefined];
};
const handleFormatRuleInput = (idx: number|string, key: 'threshold'|'color', val: string) => {
    if (state.proxyValue === undefined) return;
    const _customValue = cloneDeep(state.proxyValue.formatRules);
    if (_customValue === undefined) return;
    _customValue[idx][key] = val;
    state.proxyValue = {
        ...state.proxyValue,
        formatRules: _customValue,
    };
    const updatedFormatRulesValidationList = cloneDeep(state.formatRulesValidationList);
    updatedFormatRulesValidationList[idx] = !!val;
    state.formatRulesValidationList = updatedFormatRulesValidationList;
};

const handleDelete = (idx: number) => {
    const _customValue = cloneDeep(state.proxyValue?.formatRules ?? []);
    _customValue.splice(idx, 1);
    state.proxyValue = {
        ...state.proxyValue,
        formatRules: _customValue,
    };
    const updatedCustomValue = cloneDeep(state.formatRulesValidationList);
    updatedCustomValue.splice(idx, 1);
    state.formatRulesValidationList = updatedCustomValue;
};

const initValue = () => {
    if (props.value !== undefined) {
        state.proxyValue = cloneDeep(props.value);
    } else if (state.toggleValue) {
        state.proxyValue = {
            fieldName: 'Rate',
            basisField: state.menuItems[0]?.name ?? '',
            totalField: state.menuItems[0]?.name ?? '',
            formatRules: cloneDeep(props.widgetFieldSchema.options?.defaultFormatRules),
            baseColor: props.widgetFieldSchema.options?.baseColor ?? indigo[500],
        };
        state.formatRulesValidationList = (state.proxyValue.formatRules ?? []).map((fm) => {
            if (fm.threshold === undefined) return undefined;
            return !!fm.threshold;
        }) ?? [];
    } else {
        state.proxyValue = undefined;
    }
};

watch([() => state.isAllValid, () => state.proxyValue], ([isAllValid, value]) => {
    if (value === undefined) state.toggleValue = false;
    emit('update:is-valid', isAllValid);
}, { immediate: true });

onMounted(() => {
    if (!state.toggleValue) state.proxyValue = undefined;
    else {
        initValue();
    }
});
</script>

<template>
    <div class="widget-field-progress-bar">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.PROGRESS_BAR')"
                       required
        >
            <template #label-extra>
                <p-toggle-button :value="state.toggleValue"
                                 class="toggle-button"
                                 @change-toggle="handleChangeToggleButton"
                />
            </template>
            <div class="form-content-wrapper"
                 :class="{ 'display': state.toggleValue }"
            >
                <div class="description">
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.PROGRESS_BAR_DESCRIPTION_1') }}</span>
                    <code class="formula-text">{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.PROGRESS_BAR_DESCRIPTION_2') }}</code>
                </div>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FIELD_NAME')"
                               style-type="secondary"
                               required
                >
                    <p-text-input :value="state.proxyValue?.fieldName"
                                  @update:value="handleUpdateFieldName"
                    />
                </p-field-group>
                <div class="field-wrapper">
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.BASIS_FIELD')"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="state.menuItems"
                                           :selected="state.proxyValue?.basisField"
                                           @update:selected="handleUpdateSelect($event, 'basisField')"
                        />
                    </p-field-group>
                    <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.TOTAL_FIELD')"
                                   style-type="secondary"
                                   required
                    >
                        <p-select-dropdown :menu="state.menuItems"
                                           :selected="state.proxyValue?.totalField"
                                           @update:selected="handleUpdateSelect($event, 'totalField')"
                        />
                    </p-field-group>
                </div>
                <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.FORMAT_RULES')"
                               style-type="secondary"
                               required
                >
                    <div class="format-rules-wrapper">
                        <p-button icon-left="ic_plus_bold"
                                  style-type="tertiary"
                                  class="add-button"
                                  @click="handleClickAddFormatRule"
                        >
                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.ADD_RULE') }}
                        </p-button>
                        <div class="custom-menu-box">
                            <div v-for="(formatRule, idx) in state.proxyValue?.formatRules ?? []"
                                 :key="idx"
                                 class="format-rules-input-wrapper"
                            >
                                <p-field-group required>
                                    <p-text-input :value="formatRule.threshold"
                                                  type="number"
                                                  :name="`format-rule-threshold-${idx}`"
                                                  :min="0"
                                                  :invalid="state.formatRulesValidationList[idx] === false"
                                                  @update:value="handleFormatRuleInput(idx, 'threshold', $event)"
                                    >
                                        <template #input-right>
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
                                <color-input :value="state.proxyValue?.baseColor"
                                             class="color-input"
                                             @update:value="handleBaseColor"
                                />
                                <div class="block" />
                            </div>
                        </div>
                    </div>
                </p-field-group>
            </div>
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.p-select-dropdown {
    width: 100%;
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    .p-field-title {
        .title-wrapper {
            width: 100%;
            .title {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        }
        .toggle-button {
            margin-left: 0.25rem;
        }
    }
}
.form-content-wrapper {
    display: none;
    &.display {
        display: block;
    }
    .description {
        @apply text-paragraph-sm;
        padding-bottom: 0.5rem;
        .formula-text {
            @apply bg-gray-100 text-gray-700;
            padding-left: 0.25rem;
        }
    }
    .add-button {
        margin-bottom: 0.5rem;
    }
    .field-wrapper {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        .p-field-group {
            width: 50%;
        }
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
}
</style>
