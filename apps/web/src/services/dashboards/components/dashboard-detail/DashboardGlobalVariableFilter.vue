<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import type { DashboardGlobalVariable, GlobalVariableFilterType } from '@/api-clients/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/api-clients/dashboard/_types/dashboard-type';

import { useProxyValue } from '@/common/composables/proxy-state';

import DashboardGlobalVariableFilterEnum
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilterEnum.vue';
import DashboardGlobalVariableFilterNumberInput
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilterNumberInput.vue';
import DashboardGlobalVariableFilterNumberSlider
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilterNumberSlider.vue';
import DashboardGlobalVariableFilterReference
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilterReference.vue';
import DashboardGlobalVariableFilterTextInput
    from '@/services/dashboards/components/dashboard-detail/DashboardGlobalVariableFilterTextInput.vue';


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
        <dashboard-global-variable-filter-enum v-if="state.variableFilterType === 'ENUM'"
                                               :variable="props.variable"
                                               :vars.sync="state.proxyVars"
        />
        <dashboard-global-variable-filter-reference v-else-if="state.variableFilterType === 'REFERENCE'"
                                                    :variable="props.variable"
                                                    :vars.sync="state.proxyVars"
        />
        <dashboard-global-variable-filter-text-input v-else-if="state.variableFilterType === 'TEXT_INPUT'"
                                                     :variable="props.variable"
                                                     :vars.sync="state.proxyVars"
        />
        <dashboard-global-variable-filter-number-input v-else-if="state.variableFilterType === 'NUMBER_INPUT'"
                                                       :variable="props.variable"
                                                       :vars.sync="state.proxyVars"
        />
        <dashboard-global-variable-filter-number-slider v-else-if="state.variableFilterType === 'NUMBER_SLIDER'"
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
