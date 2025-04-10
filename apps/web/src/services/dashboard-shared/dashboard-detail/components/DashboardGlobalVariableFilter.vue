<script setup lang="ts">
import {
    computed, reactive, defineAsyncComponent,
} from 'vue';

import type { DashboardGlobalVariable, GlobalVariableFilterType } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import { useProxyValue } from '@/common/composables/proxy-state';

const FILTER_COMPONENT_MAP: Record<GlobalVariableFilterType, ReturnType<typeof defineAsyncComponent>> = {
    ENUM: defineAsyncComponent(() => import('@/services/dashboard-shared/dashboard-detail/components/DashboardGlobalVariableFilterEnum.vue')),
    REFERENCE: defineAsyncComponent(() => import('@/services/dashboard-shared/dashboard-detail/components/DashboardGlobalVariableFilterReference.vue')),
    TEXT_INPUT: defineAsyncComponent(() => import('@/services/dashboard-shared/dashboard-detail/components/DashboardGlobalVariableFilterTextInput.vue')),
    NUMBER_INPUT: defineAsyncComponent(() => import('@/services/dashboard-shared/dashboard-detail/components/DashboardGlobalVariableFilterNumberInput.vue')),
    NUMBER_SLIDER: defineAsyncComponent(() => import('@/services/dashboard-shared/dashboard-detail/components/DashboardGlobalVariableFilterNumberSlider.vue')),
};


interface Props {
    variable: DashboardGlobalVariable;
    vars?: DashboardVars;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:vars', val: DashboardVars): void;
}>();

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
    proxyVars: useProxyValue<DashboardVars|undefined>('vars', props, emit),
});

</script>

<template>
    <div class="dashboard-global-variable-filter">
        <component :is="FILTER_COMPONENT_MAP[state.variableFilterType]"
                   :variable="props.variable"
                   :vars.sync="state.proxyVars"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-global-variable-filter {
    @apply inline-block;
}
</style>
