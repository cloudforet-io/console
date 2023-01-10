<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-variable-dropdown"
         :class="{ 'open-menu': visibleMenu }"
    >
        <button ref="targetRef"
                class="dropdown-box"
                :class="{ 'is-visible': visibleMenu, 'filled-value': selected.length }"
                @click="handleChangeVisible"
        >
            <span class="variable-label">{{ variableName }}</span>
            <span v-if="selected.length"
                  class="selected-items"
            >
                <span class="item-for-display">{{ selected[0].label }}</span>
                <p-badge v-if="selected.length > 1"
                         class="selected-count"
                         style-type="blue300"
                >
                    +{{ selected.length - 1 }}
                </p-badge>
                <button class="option-delete-button"
                        @click.stop="handleClearSelected"
                >
                    <p-i name="ic_delete"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                </button>
            </span>

            <p-i :name="visibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                 :activated="visibleMenu"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="visibleMenu"
                        ref="contextMenuRef"
                        class="options-menu"
                        searchable
                        use-fixed-menu-style
                        :search-text="searchText"
                        :style="fixedMenuStyle"
                        :menu="reorderedMenu"
                        :selected="selected"
                        :multi-selectable="variableProperty.selection_type === 'MULTI'"
                        :show-radio-icon="variableProperty.selection_type === 'SINGLE'"
                        :show-clear-selection="variableProperty.selection_type === 'MULTI'"
                        @update:selected="handleSelectOption"
                        @update:search-text="handleChangeContextMenuInput"
        />
    </div>
</template>

<script setup lang="ts">
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    reactive, toRefs,
} from 'vue';

import {
    PBadge, PContextMenu, PI, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep } from 'lodash';

import type { ReferenceMap } from '@/store/modules/reference/type';

import type { DashboardVariableSchemaProperty } from '@/services/dashboards/config';
import { useDashboardDetailInfoStore } from '@/services/dashboards/dashboard-detail/store/dashboard-detail-info';

interface Props {
    propertyName: string;
    referenceMap: ReferenceMap;
}

const props = defineProps<Props>();

const dashboardDetailStore = useDashboardDetailInfoStore();
const dashboardDetailState = dashboardDetailStore.state;

const state = reactive({
    targetRef: null as HTMLElement | null,
    contextMenuRef: null as typeof PContextMenu | null,
    searchText: '',
    variableProperty: computed<DashboardVariableSchemaProperty>(() => dashboardDetailState.variablesSchema.properties[props.propertyName]),
    variableSelectedOptions: computed<undefined|string|string[]>(() => dashboardDetailState.variables[props.propertyName]),
    variableName: computed(() => state.variableProperty?.name),
    selected: computed<MenuItem[]>(() => {
        const option = state.variableSelectedOptions;
        if (!option) return [];
        let arrayOfSelectedOptions;
        if (Array.isArray(option)) {
            arrayOfSelectedOptions = option;
        } else arrayOfSelectedOptions = [option];

        if (state.variableProperty.variable_type === 'MANAGED') {
            return arrayOfSelectedOptions.map((d) => ({ name: d, label: props.referenceMap[d].label }));
        } return arrayOfSelectedOptions.map((d) => ({ name: d, label: d }));
    }),
    options: computed<MenuItem[]>(() => {
        let result;
        if (state.variableProperty.variable_type === 'MANAGED') {
            result = Object.entries(props.referenceMap).map(([referenceKey, referenceItem]) => ({
                name: referenceKey, label: referenceItem.label,
            }));
        } else result = state.variableProperty.options?.map((d) => ({ name: d, label: d }));
        return result;
    }),
});

const {
    targetRef,
    contextMenuRef,
    variableProperty,
    variableName,
    searchText,
    selected,
    options,
} = toRefs(state);

const {
    visibleMenu,
    showContextMenu,
    hideContextMenu,
    fixedMenuStyle,
    reorderedMenu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    useFixedStyle: true,
    originMenu: options,
    selected,
});

// event
const handleClearSelected = () => {
    changeVariables([]);
};
const handleChangeVisible = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        showContextMenu(true); // update reorderedMenu automatically
    }
};
// TODO: search text binding
const handleChangeContextMenuInput = (text: string): void => {
    state.searchText = text;
};

const handleSelectOption = (_selected: MenuItem[]) => {
    changeVariables(_selected);
};

// helper
const changeVariables = (changedSelected: MenuItem[]) => {
    const variables = cloneDeep(dashboardDetailState.variables);
    const reconvertedSelected = changedSelected.map((d) => d.name) as string[];
    if (reconvertedSelected.length === 0) {
        delete variables[props.propertyName];
    } else if (state.variableProperty.selection_type === 'SINGLE') {
        variables[props.propertyName] = reconvertedSelected[0];
    } else {
        variables[props.propertyName] = reconvertedSelected;
    }
    dashboardDetailState.variables = variables;
};

</script>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block relative;
    max-width: 20rem;
    &.open-menu {
        @apply relative;
    }

    .dropdown-box {
        @apply flex items-center border border-solid border-gray-300 bg-white rounded-md;
        height: 2rem;
        padding: 0 0.25rem 0 0.75rem;

        .variable-label {
            @apply text-gray-900 text-label-md;
        }

        .selected-items {
            @apply inline-flex items-center;
            padding-left: 0.5rem;

            .item-for-display {
                @apply text-gray-900 text-label-md font-bold;
            }
            .selected-count {
                margin-left: 0.25rem;
            }
            .option-delete-button {
                @apply flex items-center justify-center text-gray-400 rounded-full;
                margin-left: 0.5rem;

                &:hover {
                    @apply bg-gray-200 text-gray-900;
                }
            }
        }

        &:hover {
            @apply border-blue-600 bg-blue-100;
        }
        &.filled-value {
            @apply border-blue-400 bg-blue-200;
            &.is-visible {
                @apply border-blue-600;
            }
        }
    }
}
</style>
