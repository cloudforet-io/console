<script setup lang="ts">


import { computed, reactive, watch } from 'vue';

import { cloneDeep, flattenDeep, isEqual } from 'lodash';

import { PSelectDropdown } from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import type {
    DashboardGlobalVariable,
    NumberEnumVariable,
    TextEnumVariable,
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
        const enumVariable = props.variable as TextEnumVariable|NumberEnumVariable;
        return enumVariable;
    }),
    multiSelectable: computed(() => state.variable.options.selectionType === 'multi'),
    menuItems: computed(() => state.variable.values.map((value) => ({ label: value.label, name: value.key }))),
    selected: [],
    isNumber: computed<boolean>(() => state.variable.type === 'number'),
});


const handleSelectOption = () => {
    changeVariables(state.selected);
};

const changeVariables = (changedSelected: MenuItem[]) => {
    const _key = state.variable.key;
    const vars = cloneDeep(dashboardDetailState.vars);
    const selectedValues: string[] = changedSelected.map((d) => d.name) as string[];
    if (selectedValues.length === 0) {
        delete vars[_key];
    } else {
        const _refinedValues: string[]|number[] = state.isNumber ? selectedValues.map((d) => parseFloat(d)) : selectedValues;
        const _vars = state.multiSelectable ? _refinedValues : _refinedValues[0];
        if (isEqual(dashboardDetailState.vars[_key], _vars)) {
            return;
        }
        vars[_key] = _vars;
    }
    dashboardDetailStore.setVars(vars);
};

const initVariableAndSelected = async () => {
    const found = state.menuItems[0];
    if (found) {
        state.selected = [found];
        changeVariables([found]);
    }
};

const initSelected = async (value: any) => {
    // Selected options data from backend can be undefined or string not string[]. Convert them to Array.
    const selectedValues = flattenDeep([value ?? []]);
    const refinedValues = selectedValues.map((d) => d.toString());
    const selectedItems = state.menuItems.filter((item) => refinedValues.includes(item.name));
    if (selectedItems.length) {
        state.selected = selectedItems;
    } else {
        await initVariableAndSelected();
    }
};

watch(() => dashboardDetailGetters.dashboardVarsSchemaProperties, async (varsSchema, prevVarsSchema) => {
    const _variable = props.variable as TextEnumVariable|NumberEnumVariable;
    if (isEqual(varsSchema[_variable.key], prevVarsSchema?.[varsSchema[_variable.key]])) return;

    const value = dashboardDetailGetters.dashboardInfo.vars[_variable.key];
    if (value) {
        await initSelected(value);
    } else {
        state.selected = [];
    }
}, { immediate: true });



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
