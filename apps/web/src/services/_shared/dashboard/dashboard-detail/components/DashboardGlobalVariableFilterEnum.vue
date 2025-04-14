<script setup lang="ts">


import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    cloneDeep, flattenDeep, isEqual, xor,
} from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type {
    DashboardGlobalVariable,
    NumberEnumVariable,
    TextEnumVariable,
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
    variable: computed(() => props.variable as TextEnumVariable | NumberEnumVariable),
    multiSelectable: computed<boolean>(() => state.variable.options.selectionType === 'multi'),
    menuItems: computed<SelectDropdownMenuItem[]>(() => state.variable.values.map((value) => ({ label: value.label, name: value.key }))),
    selected: [] as SelectDropdownMenuItem[],
    isNumber: computed<boolean>(() => state.variable.type === 'number'),
});


const handleSelectOption = () => {
    changeVariables(state.selected);
};

const changeVariables = (changedSelected: MenuItem[]) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardVarsState.vars ?? {});
    const selectedValues: string[] = changedSelected.map((d) => d.name) as string[];
    if (selectedValues.length === 0) {
        delete vars[_key];
    } else {
        const _refinedValues: string[]|number[] = state.isNumber ? selectedValues.map((d) => parseFloat(d)) : selectedValues;
        const _vars = state.multiSelectable ? _refinedValues : _refinedValues[0];
        if (isEqual(vars[_key], _vars)) {
            return;
        }
        vars[_key] = _vars;
    }
    dashboardVarsStore.setVars(vars);
};

const initSelected = (value: any) => {
    // Selected options data from backend can be undefined or string not string[]. Convert them to Array.
    const selectedValues = flattenDeep([value ?? []]);
    const refinedValues = selectedValues.map((d) => d.toString());
    const selectedItems = state.menuItems.filter((item) => refinedValues.includes(item.name));
    state.selected = selectedItems;
};

watch(() => dashboard.value?.vars_schema?.properties, async (varsSchema, prevVarsSchema) => {
    if (!varsSchema) return;
    const _variable = props.variable as TextEnumVariable|NumberEnumVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[varsSchema[_variable.key]])) return;

    const value = dashboard.value?.vars?.[_variable.key];
    if (value) {
        initSelected(value);
    } else {
        state.selected = [];
    }
}, { immediate: true });

// for reset
watch(() => dashboardVarsState.vars, (_vars) => {
    const selectedValues = state.selected.map((d) => d.name);
    const _variable = props.variable as TextEnumVariable|NumberEnumVariable;
    const tempVarsValue = flattenDeep([(_vars?.[_variable.key] as string|string[]|undefined) ?? []]);
    const isNotSame = xor(selectedValues, tempVarsValue).length > 0;
    if (isNotSame) {
        initSelected(_vars?.[state.variable.key]);
    }
});


</script>

<template>
    <div class="dashboard-global-variable-filter-enum">
        <p-select-dropdown is-filterable
                           :menu="state.menuItems"
                           :selected.sync="state.selected"
                           :multi-selectable="state.multiSelectable"
                           style-type="rounded"
                           appearance-type="badge"
                           show-select-marker
                           use-fixed-menu-style
                           selection-highlight
                           :selection-label="state.variable.name"
                           show-delete-all-button
                           :page-size="10"
                           @update:selected="handleSelectOption"
        />
    </div>
</template>

<style scoped lang="postcss">
.dashboard-global-variable-filter-enum {
    /* custom design-system component - p-context-menu */
    :deep(.options-menu) {
        z-index: 10;
        margin-top: -1px;
        .label-wrapper {
            min-width: 7rem;
            width: max-content;
            max-width: 22.5rem;
        }
    }
}
</style>
