<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, debounce, isEqual } from 'lodash';

import { PTag, PSlider } from '@cloudforet/mirinae';

import type {
    DashboardGlobalVariable,
    NumberAnyVariable,
} from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import { useProxyValue } from '@/common/composables/proxy-state';

import { useDashboardGetQuery } from '@/services/dashboards/shared/composables/use-dashboard-get-query';

interface Props {
    variable: DashboardGlobalVariable;
    vars?: DashboardVars;
}


const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:vars', val: DashboardVars): void}>();
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);
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
    value: undefined as number|undefined,
    proxyVars: useProxyValue<DashboardVars|undefined>('vars', props, emit),
});

const handleUpdateSliderValue = debounce((value: string) => {
    const _value = parseFloat(value);
    state.value = _value;
    changeVariables(_value);
}, 300);

const changeVariables = (changedSelected?: number) => {
    const _key = state.variable.key;
    const vars = cloneDeep(props.vars ?? {});
    if (changedSelected !== undefined) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    state.proxyVars = vars;
};

watch(() => dashboard.value?.vars_schema?.properties, (varsSchema, prevVarsSchema) => {
    if (!varsSchema) return;
    const _variable = props.variable as NumberAnyVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[varsSchema[_variable.key]])) return;

    state.value = dashboard.value?.vars?.[_variable.key] || _variable.options.min;
    changeVariables(state.value);
}, { immediate: true });

// for reset
watch(() => props.vars, (_vars) => {
    const _variable = props.variable as NumberAnyVariable;
    const tempVarsValue = _vars?.[_variable.key] as number|undefined;
    if (state.value !== parseFloat(tempVarsValue)) {
        state.value = parseFloat(tempVarsValue);
    }
});

</script>

<template>
    <div class="dashboard-global-variable-filter-number-slider">
        <div :class="{
            'filter-button': true,
            'selected': state.value !== undefined,
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
            <p-tag selected
                   :deletable="false"
            >
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
