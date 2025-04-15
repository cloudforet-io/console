<script setup lang="ts">
import {
    computed, reactive, defineAsyncComponent,
} from 'vue';

import type { DashboardGlobalVariable } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';

import type { GLOBAL_VARIABLE_FILTER_TYPE_MAP } from '@/services/_shared/dashboard/dashboard-detail/constants/dashboard-global-variable';

type GlobalVariableFilterType = keyof typeof GLOBAL_VARIABLE_FILTER_TYPE_MAP;


const FILTER_COMPONENT_MAP: Record<GlobalVariableFilterType, ReturnType<typeof defineAsyncComponent>> = {
    ENUM: defineAsyncComponent(() => import('@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilterEnum.vue')),
    REFERENCE: defineAsyncComponent(() => import('@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilterReference.vue')),
    TEXT_INPUT: defineAsyncComponent(() => import('@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilterTextInput.vue')),
    NUMBER_INPUT: defineAsyncComponent(() => import('@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilterNumberInput.vue')),
    NUMBER_SLIDER: defineAsyncComponent(() => import('@/services/_shared/dashboard/dashboard-detail/components/DashboardGlobalVariableFilterNumberSlider.vue')),
};


interface Props {
    variable: DashboardGlobalVariable;
}

const props = defineProps<Props>();

const state = reactive({
    variableMethod: computed<DashboardGlobalVariable['method']>(() => props.variable.method),
    variableType: computed<DashboardGlobalVariable['type']>(() => props.variable.type),
    variableFilterType: computed<GlobalVariableFilterType>(() => {
        if (props.variable.method === 'dynamic') return 'REFERENCE'; // dynamic - reference
        if (props.variable.valueType === 'enum') return 'ENUM'; // enum - text/number
        if (props.variable.type === 'text') return 'TEXT_INPUT'; // input - text
        if (props.variable.options.inputType === 'input') return 'NUMBER_INPUT'; // input - number
        return 'NUMBER_SLIDER'; // slider - number
    }),
});

</script>

<template>
    <div class="dashboard-global-variable-filter">
        <component :is="FILTER_COMPONENT_MAP[state.variableFilterType]"
                   :variable="props.variable"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-global-variable-filter {
    @apply inline-block;
}
</style>
