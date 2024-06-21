<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type {
    AutocompleteHandler,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import {
    cloneDeep, flattenDeep,
} from 'lodash';

import type { DashboardVariableSchemaProperty, DashboardVariables } from '@/schema/dashboard/_types/dashboard-type';

import type { ReferenceMap } from '@/store/reference/type';

import { VariableModelFactory } from '@/lib/variable-models';
import { getVariableModelMenuHandler } from '@/lib/variable-models/variable-model-menu-handler';

import { useDashboardDetailInfoStore } from '@/services/dashboards/stores/dashboard-detail-info-store';


interface Props {
    dashboardVariables?: DashboardVariables;
    property: DashboardVariableSchemaProperty;
    propertyName: string;
    propertyLabel?: string;
    referenceMap: ReferenceMap;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    dashboardVariables: () => ({}),
    propertyLabel: '',
});

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailGetters = dashboardDetailStore.getters;
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as any|null,
    selected: [] as MenuItem[],
    menuHandler: computed<AutocompleteHandler>(() => {
        const options = props.property?.options;
        const fixedOptions = dashboardDetailGetters.refinedVariablesSchema.fixed_options;
        if (!Array.isArray(options)) return undefined;
        const variableModelInfoList = options.map((config) => ({
            variableModel: new VariableModelFactory({ type: config.type, managedModelKey: config.key }, undefined, {
                fixedOptions,
            }),
            dataKey: config.dataKey,
        }));
        return getVariableModelMenuHandler(variableModelInfoList);
    }),
});

// event
const handleSelectOption = () => {
    changeVariables(state.selected);
};

// helper
const changeVariables = (changedSelected: MenuItem[]) => {
    const variables = cloneDeep(props.dashboardVariables);
    const reconvertedSelected = changedSelected.map((d) => d.name) as string[];
    if (reconvertedSelected.length === 0) {
        delete variables[props.propertyName];
    } else if (props.property?.selection_type === 'SINGLE') {
        variables[props.propertyName] = reconvertedSelected[0];
    } else {
        variables[props.propertyName] = reconvertedSelected;
    }
    dashboardDetailStore.setVariables(variables);
};

const loadOptionItems = async (selectedValues?: string[]): Promise<MenuItem[]> => {
    let foundItems: MenuItem[] = [];
    const responses = await state.menuHandler(
        '',
        undefined,
        undefined,
        selectedValues?.map((d) => ({ name: d, label: d })),
    );
    const results = responses?.map((res) => res.results).flat();
    foundItems = foundItems.concat(results);
    return foundItems;
};
const initVariableAndSelected = async () => {
    const items = await loadOptionItems();
    const found = items[0];
    if (found) {
        state.selected = [found];
        changeVariables([found]);
    }
};
const initSelected = async (value: any) => {
    // Selected options data from backend can be undefined or string not string[]. Convert them to Array.
    const selectedValues = flattenDeep([value ?? []]);
    const items = await loadOptionItems(selectedValues);
    const selectedItems = items.filter((item) => selectedValues.includes(item.name));
    if (selectedItems.length) {
        state.selected = selectedItems;
    } else {
        await initVariableAndSelected();
    }
};

watch([() => props.property, () => props.dashboardVariables], async ([property]) => {
    dashboardDetailStore.setVariablesInitMap({
        ...dashboardDetailState.variablesInitMap,
        [props.propertyName]: false,
    });

    const value = props.dashboardVariables[props.propertyName];
    if (value) {
        await initSelected(value);
    } else if (property?.required) {
        await initVariableAndSelected();
    } else {
        state.selected = [];
    }

    dashboardDetailStore.setVariablesInitMap({
        ...dashboardDetailState.variablesInitMap,
        [props.propertyName]: true,
    });
}, { immediate: true });
</script>

<template>
    <div ref="containerRef"
         class="dashboard-variable-dropdown"
    >
        <p-select-dropdown is-filterable
                           :handler="state.menuHandler"
                           :selected.sync="state.selected"
                           :multi-selectable="props.property?.selection_type === 'MULTI'"
                           style-type="rounded"
                           appearance-type="badge"
                           show-select-marker
                           use-fixed-menu-style
                           selection-highlight
                           :init-selected-with-handler="props.visible"
                           :selection-label="props.propertyLabel"
                           :show-delete-all-button="false"
                           :page-size="10"
                           @update:selected="handleSelectOption"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block;

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
