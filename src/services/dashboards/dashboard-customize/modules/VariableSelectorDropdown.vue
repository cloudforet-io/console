<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-variable-dropdown"
         :class="{ 'open-menu': visibleMenu }"
    >
        <button ref="targetRef"
                class="dropdown-box"
                :class="{ 'is-visible': visibleMenu, 'filled-value': state.selected.length }"
                @click="toggleMenu"
        >
            <span class="variable-contents">
                <span class="variable-label">{{ variableName }}</span>
                <span v-if="state.selected.length"
                      class="item-for-display"
                >{{ state.selected[0].label }}</span>
            </span>
            <template v-if="state.selected.length">
                <p-badge v-if="state.selected.length > 1"
                         class="selected-count"
                         style-type="blue300"
                >
                    +{{ state.selected.length - 1 }}
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
            </template>

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
                        :search-text="state.searchText"
                        :style="contextMenuStyle"
                        :menu="refinedMenu"
                        :selected="state.selected"
                        :multi-selectable="variableProperty.selection_type === 'MULTI'"
                        show-select-marker
                        :show-clear-selection="variableProperty.selection_type === 'MULTI'"
                        @click-show-more="showMoreMenu"
                        @keyup:down:end="focusOnContextMenu()"
                        @update:selected="handleSelectOption"
                        @update:search-text="handleUpdateSearchText"
        />
    </div>
</template>

<script setup lang="ts">
// CAUTION: this vOnClickOutside is using !! Please do not remove.
import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    reactive, toRef, toRefs, watch,
} from 'vue';

import {
    PBadge, PContextMenu, PI, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { cloneDeep, debounce } from 'lodash';

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
    contextMenuRef: null as any|null,
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
            return arrayOfSelectedOptions.map((d) => ({ name: d, label: props.referenceMap[d]?.label ?? props.referenceMap[d]?.name ?? d }));
        } return arrayOfSelectedOptions.map((d) => ({ name: d, label: d }));
    }),
    options: computed<MenuItem[]>(() => {
        let result;
        if (state.variableProperty.variable_type === 'MANAGED') {
            result = Object.entries(props.referenceMap).map(([referenceKey, referenceItem]) => ({
                name: referenceKey, label: referenceItem?.label ?? referenceItem?.name ?? referenceKey,
            }));
        } else result = state.variableProperty.options?.map((d) => ({ name: d, label: d }));
        return result;
    }),
});



const {
    visibleMenu,
    refinedMenu,
    contextMenuStyle,
    hideContextMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef: toRef(state, 'targetRef'),
    contextMenuRef: toRef(state, 'contextMenuRef'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'searchText'),
    selected: toRef(state, 'selected'),
    menu: toRef(state, 'options'),
    pageSize: 10,
});

const toggleMenu = () => {
    if (visibleMenu.value) hideContextMenu();
    else focusOnContextMenu();
};

// event
const handleClearSelected = () => {
    changeVariables([]);
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

const handleUpdateSearchText = debounce((text: string) => {
    state.searchText = text;
    reloadMenu();
}, 200);

watch(visibleMenu, (_visibleMenu) => {
    if (_visibleMenu) {
        initiateMenu();
    } else state.searchText = '';
}, { immediate: true });

const {
    targetRef,
    contextMenuRef,
    variableProperty,
    variableName,
} = toRefs(state);

</script>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block;
    max-width: 22.5rem;

    &.open-menu {
        @apply relative;
    }

    .dropdown-box {
        @apply flex items-center border border-solid border-gray-300 bg-white rounded-md w-full;
        height: 2rem;
        padding: 0 0.25rem 0 0.75rem;

        .variable-contents {
            @apply inline-flex text-gray-900 text-label-md flex-shrink w-full;
            max-width: 16.375rem;

            .variable-label {
                @apply flex-shrink-0;
                max-width: 11rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .item-for-display {
                @apply font-bold flex-shrink;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-left: 0.5rem;
            }
        }

        .selected-count {
            @apply flex-shrink-0;
            margin-left: 0.25rem;
        }

        .option-delete-button {
            @apply flex items-center flex-shrink-0 justify-center text-gray-400 rounded-full;
            margin-left: 0.5rem;

            &:hover {
                @apply bg-gray-200 text-gray-900;
            }
        }

        .dropdown-icon {
            @apply flex-shrink-0;
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

    /* custom design-system component - p-context-menu */
    :deep(.options-menu) {
        .label-wrapper {
            max-width: 22.5rem;
        }
    }
}
</style>
