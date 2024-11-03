<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep, isEqual } from 'lodash';

import { PIconButton, PTextInput, PPopover } from '@cloudforet/mirinae';
import type { InputItem } from '@cloudforet/mirinae/src/inputs/input/text-input/type';

import type {
    DashboardGlobalVariable,
    NumberAnyVariable,
} from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    variable: DashboardGlobalVariable;
}


const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    variable: computed(() => {
        const anyNumberVariable = props.variable as NumberAnyVariable;
        return anyNumberVariable;
    }),
    step: computed<number|undefined>(() => state.variable.options.step),
    min: computed<number>(() => parseFloat(state.variable.options.min)),
    max: computed<number>(() => parseFloat(state.variable.options.max)),
    invalid: false,
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
const handleClickMinusButton = () => {
    let _numericValue = parseFloat(state.keyword);
    const _min = state.min;
    const numericStep = state.step ? parseFloat(state.step) : 1;

    if (_numericValue < _min) {
        _numericValue = _min;
    } else if (state.step) {
        if (isValidNumber(state.keyword, state.min, state.max, state.step)) {
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
        if (isValidNumber(state.keyword, state.min, state.max, state.step)) {
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
    state.invalid = !isValidNumber(value, state.min, state.max, state.step);
    state.keyword = value;
};

const isValidNumber = (value: string, min: number, max: number, step?: string): boolean => {
    const numericValue = parseFloat(value);

    if (Number.isNaN(numericValue) || numericValue < min || numericValue > max) {
        return false;
    }

    if (step) {
        const numericStep = parseFloat(step);
        return numericValue === max || (numericValue - min) % numericStep === 0;
    }

    return true;
};

const changeVariables = (changedSelected?: number) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardDetailState.vars) as DashboardVars;
    if (changedSelected) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    dashboardDetailStore.setVars(vars);
};

watch(() => dashboardDetailState.vars, (vars, prevVars) => {
    if (isEqual(vars[state.variable.key], prevVars?.[state.variable.key])) return;

    const _variable = props.variable as NumberAnyVariable;
    state.value = (dashboardDetailState.vars[_variable.key] as number) || _variable.options.min;
    changeVariables(state.value);

    state.keyword = (dashboardDetailState.vars[_variable.key] as number) || _variable.options.min;
}, { immediate: true });



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
                'selected': !!state.value,
            }"
            >
                <span class="selection-label">{{ state.variable.name }}</span>
                <span v-if="state.value"
                      class="selection-value"
                >{{ state.value }}</span>
            </div>

            <template #content>
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

    .number-input-menu {
        @apply flex items-center gap-1 bg-white;

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
}
</style>
