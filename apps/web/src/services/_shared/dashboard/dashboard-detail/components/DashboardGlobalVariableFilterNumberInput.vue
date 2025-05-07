<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEqual } from 'lodash';

import {
    PIconButton, PTextInput, PPopover, PButton, PI,
} from '@cloudforet/mirinae';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import type {
    DashboardGlobalVariable,
    NumberAnyVariable,
} from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';
import { i18n } from '@/translations';


import { useDashboardGetQuery } from '@/services/_shared/dashboard/dashboard-detail/composables/use-dashboard-get-query';
import { useDashboardVarsStore } from '@/services/_shared/dashboard/dashboard-detail/stores/dashboard-vars-store';

interface Props {
    variable: DashboardGlobalVariable;
}


const props = defineProps<Props>();
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);
const dashboardVarsStore = useDashboardVarsStore();
const dashboardVarsState = dashboardVarsStore.state;

const { dashboard } = useDashboardGetQuery({
    dashboardId,
});

const state = reactive({
    variable: computed(() => {
        const anyNumberVariable = props.variable as NumberAnyVariable;
        return anyNumberVariable;
    }),
    step: computed<number|undefined>(() => state.variable.options.step),
    min: computed<number>(() => parseFloat(state.variable.options.min)),
    max: computed<number>(() => parseFloat(state.variable.options.max)),
    invalid: false,
    invalidText: '',
    value: undefined as number|undefined,
    editMode: false,
    keyword: undefined as number|undefined,
});

const handleUpdateKeyword = (value: string) => {
    changeNumberKeyword(value);
};

const handleSelectValue = (selected: InputItem[]) => {
    if (state.invalid || !selected.length) return;
    state.value = selected[0]?.name;
    changeVariables(parseFloat(selected[0]?.name));
    state.editMode = false;
};
const handleClickDoneButton = () => {
    if (!state.keyword) return;
    state.value = state.keyword;
    changeVariables(parseFloat(state.keyword));
    state.editMode = false;
};
const handleClickMinusButton = () => {
    let _numericValue = parseFloat(state.keyword);
    const _min = state.min;
    const numericStep = state.step ? parseFloat(state.step) : 1;

    if (_numericValue < _min) {
        _numericValue = _min;
    } else if (state.step) {
        if (isValidNumberInfo(state.keyword, state.min, state.max, state.step).valid) {
            _numericValue = Math.max(_numericValue - numericStep, _min);
        } else {
            _numericValue = _min + Math.floor((_numericValue - _min) / numericStep) * numericStep;
            _numericValue = Math.max(_numericValue, _min);
        }
    } else {
        _numericValue = Math.max(_numericValue - 1, _min);
    }

    changeNumberKeyword(`${_numericValue}`);
};

const handleDeleteKeyword = () => {
    state.keyword = state.min;
};

const handleClickPlusButton = () => {
    let _numericValue = parseFloat(state.keyword);
    const _min = state.min;
    const _max = state.max;
    const numericStep = state.step ? parseFloat(state.step) : 1;

    if (_numericValue < _min) {
        _numericValue = _min;
    } else if (state.step) {
        if (isValidNumberInfo(state.keyword, state.min, state.max, state.step).valid) {
            _numericValue = Math.min(_numericValue + numericStep, _max);
        } else {
            _numericValue = _min + Math.ceil((_numericValue - _min) / numericStep) * numericStep;
            _numericValue = Math.min(_numericValue, _max);
        }
    } else {
        _numericValue = Math.min(_numericValue + 1, _max);
    }

    changeNumberKeyword(`${_numericValue}`);
};

const changeNumberKeyword = (value: string) => {
    state.invalid = !isValidNumberInfo(value, state.min, state.max, state.step).valid;
    if (state.invalid) {
        state.invalidText = isValidNumberInfo(value, state.min, state.max, state.step).invalidText;
    }
    state.keyword = value;
};

const isValidNumberInfo = (value: string, min: number, max: number, step?: string): { valid: boolean, invalidText?: string|TranslateResult } => {
    const numericValue = parseFloat(value);

    if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
        return { valid: false, invalidText: i18n.t('DASHBOARDS.DETAIL.VARIABLES.NUMBER_INPUT_OUT_OF_RANGE_VALUE', { min: state.min, max: state.max }) };
    }

    if (step) {
        const numericStep = parseFloat(step);
        if (numericValue !== max && (numericValue - min) % numericStep !== 0) {
            return { valid: false, invalidText: i18n.t('DASHBOARDS.DETAIL.VARIABLES.NUMBER_INPUT_INVALID_STEP_VALUE') };
        }
    }

    return { valid: true };
};

const changeVariables = (changedSelected?: number) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardVarsState.vars ?? {}) as DashboardVars;
    if (changedSelected !== undefined) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    dashboardVarsStore.setVars(vars);
};

watch(() => dashboard.value?.vars_schema?.properties, (varsSchema, prevVarsSchema) => {
    if (!varsSchema) return;
    const _variable = props.variable as NumberAnyVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[_variable.key])) return;

    state.value = (dashboard.value?.vars?.[_variable.key] as number) || _variable.options.min;
    changeVariables(state.value);

    state.keyword = (dashboard.value?.vars?.[_variable.key] as number) || _variable.options.min;
}, { immediate: true });

// for reset
watch(() => dashboardVarsState.vars, (_vars) => {
    const _variable = props.variable as NumberAnyVariable;
    const tempVarsValue = _vars?.[_variable.key] as number|undefined;
    if (tempVarsValue === undefined) {
        state.value = _variable.options.min;
        changeVariables(state.value);
    } else if (state.value !== tempVarsValue) {
        state.value = tempVarsValue;
    }
});


</script>

<template>
    <div class="dashboard-global-variable-filter-number-input">
        <p-popover :is-visible.sync="state.editMode"
                   hide-arrow
                   hide-close-button
                   position="bottom-start"
        >
            <div :class="{
                'filter-button': true,
                'selected': state.value !== undefined,
            }"
            >
                <span class="selection-label">{{ state.variable.name }}</span>
                <span v-if="state.value !== undefined"
                      class="selection-value"
                >{{ state.value }}</span>
            </div>

            <template #content>
                <div class="content-wrapper">
                    <div class="number-input-menu">
                        <p-icon-button name="ic_minus"
                                       width="2rem"
                                       height="2rem"
                                       :disabled="parseFloat(state.keyword) <= state.min"
                                       @click="handleClickMinusButton"
                        />
                        <p-text-input type="number"
                                      :invalid="state.invalid"
                                      :value="state.keyword"
                                      :min="state.variable.options.min"
                                      :max="state.variable.options.max"
                                      @update:value="handleUpdateKeyword"
                                      @update:selected="handleSelectValue"
                                      @delete-all-tags="handleDeleteKeyword"
                        />
                        <p-icon-button name="ic_plus"
                                       width="2rem"
                                       height="2rem"
                                       :disabled="parseFloat(state.keyword) >= state.max"
                                       @click="handleClickPlusButton"
                        />
                        <p-button size="sm"
                                  style-type="highlight"
                                  :disabled="state.invalid"
                                  @click="handleClickDoneButton"
                        >
                            {{ $t('COMMON.WIDGETS.APPLY') }}
                        </p-button>
                    </div>
                    <div class="info-wrapper">
                        <div v-if="!state.invalid"
                             class="info"
                        >
                            <p-i class="info-icon"
                                 name="ic_info-circle"
                                 width="1rem"
                                 height="1rem"
                            />
                            <p>
                                {{ $t('DASHBOARDS.DETAIL.VARIABLES.NUMBER_INPUT_STEP_INFO', { step: state.step }) }}
                            </p>
                        </div>
                        <div v-else
                             class="invalid-text"
                        >
                            <p class="text">
                                {{ state.invalidText }}
                            </p>
                        </div>
                    </div>
                    <div />
                </div>
            </template>
        </p-popover>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-global-variable-filter-number-input {
    @apply relative;
    .filter-button {
        @apply rounded-2xl border border-gray-200 bg-white flex items-center gap-1 cursor-pointer;
        height: 2rem;
        min-height: 2rem;
        padding: 0 0.5rem;

        .selection-label {
            @apply text-label-md text-gray-600;
        }
        .selection-value {
            @apply text-label-md text-secondary;
        }
        &.selected {
            @apply bg-blue-100 border-blue-300;
            .selection-label {
                @apply text-secondary font-bold;
            }
        }
    }

    .content-wrapper {
        .number-input-menu {
            @apply flex items-center gap-1 bg-white;

            margin-bottom: 0.25rem;

            /* custom design-system component - p-text-input */
            :deep(.p-text-input) {
                width: 8rem;

                input {
                    -moz-appearance: textfield;
                    -webkit-appearance: none;
                    appearance: none;
                }
                input::-webkit-inner-spin-button,
                .no-spinner::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            }
        }
        .info-wrapper {
            .info {
                @apply flex items-center text-gray-600 text-paragraph-md;
                .info-icon {
                    margin-right: 0.125rem;
                }
            }
            .invalid-text {
                @apply text-label-sm text-red-500;
                padding-left: 2.25rem;
                .text {
                    width: 8rem;
                }
            }
        }
    }
}
</style>
