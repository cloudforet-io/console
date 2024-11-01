<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { cloneDeep } from 'lodash';

import { PTag, PTextInput } from '@cloudforet/mirinae';
import type { InputItem } from '@cloudforet/mirinae/src/inputs/input/text-input/type';

import type { DashboardGlobalVariable, TextAnyVariable } from '@/schema/dashboard/_types/dashboard-global-variable-type';
import type { DashboardVars } from '@/schema/dashboard/_types/dashboard-type';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';

interface Props {
    variable: DashboardGlobalVariable;
}


const props = defineProps<Props>();
const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const storeState = reactive({
    vars: computed<DashboardVars>(() => dashboardDetailState.vars),
});

const state = reactive({
    variable: computed(() => {
        const anyTextVariable = props.variable as TextAnyVariable;
        return anyTextVariable;
    }),
    value: undefined as string|undefined,
    editMode: false,
    keyword: '',
});

const handleDeleteTextValue = () => {
    state.value = undefined;
    changeVariables();
};
const handleSelectValue = (selected: InputItem[]) => {
    state.value = selected[0].name;
    changeVariables(selected[0].name);
};


const changeVariables = (changedSelected?: string) => {
    const _key = state.variable.key;
    const vars = cloneDeep(storeState.vars);
    if (changedSelected) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    dashboardDetailStore.setVars(vars);
};

onMounted(() => {
    const _variable = props.variable as TextAnyVariable;
    state.value = (storeState.vars[_variable.key] as string) || _variable.options?.defaultValue;
    changeVariables(state.value);
});

watch(() => state.value, (_value) => {
    state.editMode = !_value;
});


</script>

<template>
    <div class="dashboard-global-variable-filter-text-input">
        <div :class="{
            'filter-button': true,
            'selected': !!state.value,
        }"
        >
            <span class="selection-label">{{ state.variable.name }}</span>
            <p-tag v-if="state.value"
                   @delete="handleDeleteTextValue"
            >
                {{ state.value }}
            </p-tag>
            <p-text-input v-else
                          size="md"
                          placeholder="Enter Value"
                          :value.sync="state.keyword"
                          @update:selected="handleSelectValue"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.dashboard-global-variable-filter-text-input {
    .filter-button {
        @apply rounded-2xl border border-gray-200 bg-white flex items-center gap-1;
        height: 2rem;
        min-height: 2rem;
        padding: 0 0.5rem;

        .selection-label {
            @apply text-label-md text-gray-600;
        }
        &.selected {
            @apply bg-blue-100 border-blue-300;
            .selection-label {
                @apply text-secondary font-bold;
            }
        }
    }

    /* custom design-system component - p-text-input */
    :deep(.p-text-input) {
        width: 8rem;
        max-height: 2rem;
        > .input-container {
            @apply rounded-none border-t border-b border-l-0 border-r-0 border-gray-200;
            max-height: 2rem;

            &.focused, &:focus-within:not(.disabled):not(.invalid) {
                @apply bg-white border-gray-200;
            }
            &:hover:not(.disabled):not(.invalid) {
                @apply border-gray-200;
            }
        }
    }
}
</style>
