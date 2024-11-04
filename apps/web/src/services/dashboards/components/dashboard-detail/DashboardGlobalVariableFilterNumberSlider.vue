<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { cloneDeep, debounce, isEqual } from 'lodash';

import { PTag, PSlider } from '@cloudforet/mirinae';

import type {
    DashboardGlobalVariable,
    NumberAnyVariable,
} from '@/schema/dashboard/_types/dashboard-global-variable-type';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    variable: DashboardGlobalVariable;
}


const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;
const dashboardDetailGetters = dashboardDetailStore.getters;

const state = reactive({
    variable: computed(() => {
        const anyNumberVariable = props.variable as NumberAnyVariable;
        return anyNumberVariable;
    }),
    step: computed<number|undefined>(() => state.variable.options.step),
    min: computed<number>(() => parseFloat(state.variable.options.min)),
    max: computed<number>(() => parseFloat(state.variable.options.max)),
    value: undefined as number|undefined,
});

const handleUpdateSliderValue = debounce((value: string) => {
    const _value = parseFloat(value);
    state.value = _value;
    changeVariables(_value);
}, 300);

const changeVariables = (changedSelected?: number) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardDetailState.vars);
    if (changedSelected) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    dashboardDetailStore.setVars(vars);
};

watch(() => dashboardDetailGetters.dashboardVarsSchemaProperties, (varsSchema, prevVarsSchema) => {
    const _variable = props.variable as NumberAnyVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[varsSchema[_variable.key]])) return;

    state.value = (dashboardDetailGetters.dashboardInfo.vars[_variable.key] as number) || _variable.options.min;
    changeVariables(state.value);

    state.keyword = (dashboardDetailGetters.dashboardInfo.vars[_variable.key] as number) || _variable.options.min;
}, { immediate: true });

</script>

<template>
    <div class="dashboard-global-variable-filter-number-slider">
        <div :class="{
            'filter-button': true,
            'selected': !!state.value,
        }"
        >
            <span class="selection-label">{{ state.variable.name }}</span>
            <p-slider class="number-slider"
                      :value="state.value"
                      :min="state.min"
                      :max="state.max"
                      :step="state.step !== undefined ? parseFloat(state.step) : undefined"
                      :show-value="false"
                      @update:value="handleUpdateSliderValue"
            />
            <p-tag :deletable="false">
                {{ state.value }}
            </p-tag>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-global-variable-filter-number-slider {
    .filter-button {
        @apply rounded-2xl border border-gray-200 bg-white flex items-center gap-2;
        height: 2rem;
        min-height: 2rem;
        padding: 0 0.5rem;

        .selection-label {
            @apply text-label-md text-gray-600;
        }
        .number-slider {
            margin: 0 0.125rem;
            padding-bottom: 0.25rem;
        }
        &.selected {
            @apply bg-blue-100 border-blue-300;
            .selection-label {
                @apply text-secondary font-bold;
            }
        }
    }
}
</style>
