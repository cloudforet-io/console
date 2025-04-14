<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { cloneDeep, isEqual } from 'lodash';

import { PButton, PTag, PTextInput } from '@cloudforet/mirinae';
import type { InputItem } from '@cloudforet/mirinae/types/controls/input/text-input/type';

import type {
    DashboardGlobalVariable,
    TextAnyVariable,
} from '@/api-clients/dashboard/_types/dashboard-global-variable-type';

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
        const anyTextVariable = props.variable as TextAnyVariable;
        return anyTextVariable;
    }),
    value: undefined as string|undefined,
    editMode: false,
    keyword: '',
});

const handleDeleteTextValue = () => {
    state.value = undefined;
    state.keyword = '';
    changeVariables();
    state.editMode = true;
};
const handleSelectValue = (selected: InputItem[]) => {
    state.value = selected[0]?.name;
    changeVariables(selected[0]?.name);
    state.editMode = false;
};

const handleClickDoneButton = () => {
    if (state.keyword) {
        state.value = state.keyword;
        changeVariables(state.keyword);
        state.editMode = false;
    }
};

const changeVariables = (changedSelected?: string) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardVarsState.vars ?? {});
    if (changedSelected) {
        vars[_key] = changedSelected;
    } else {
        delete vars[_key];
    }
    dashboardVarsStore.setVars(vars);
};

// set default value
watch(() => dashboard.value?.vars_schema?.properties, (varsSchema, prevVarsSchema) => {
    if (!varsSchema) return;
    const _variable = props.variable as TextAnyVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[_variable.key])) return;
    state.value = dashboard.value?.vars?.[_variable.key] || _variable.options?.defaultValue;
    changeVariables(state.value);
}, { immediate: true });

// for reset
watch(() => dashboardVarsState.vars, (_vars) => {
    const _variable = props.variable as TextAnyVariable;
    const tempVarsValue = _vars?.[_variable.key] as string|undefined;
    if (state.value !== tempVarsValue) {
        state.value = tempVarsValue;
    }
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
            <p-button v-if="!state.value"
                      size="sm"
                      style-type="highlight"
                      @click="handleClickDoneButton"
            >
                {{ $t('COMMON.WIDGETS.APPLY') }}
            </p-button>
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
