<template>
    <div v-on-click-outside="hideContextMenu"
         class="dashboard-variable-dropdown"
    >
        <button ref="targetRef"
                class="dropdown-box"
                :class="{ 'is-visible': state.visibleMenu, 'filled-value': state.selected.length }"
                @click="showContextMenu"
        >
            <span class="variable-label">{{ variableName }}</span>
            <span v-if="state.selected.length"
                  class="selected-items"
            >
                <span class="item-for-display">{{ state.selected[0].label }}</span>
                <p-badge v-if="state.selected.length > 1"
                         style-type="blue300"
                >
                    +{{ state.selected.length - 1 }}
                </p-badge>
            </span>
            <span />
            <p-i :name="state.visibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                 :activated="state.visibleMenu"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="state.visibleMenu"
                        ref="contextMenuRef"
                        searchable
                        use-fixed-menu-style
                        :menu="state.menu"
                        :selected="state.selected"
                        :multi-selectable="state.selectionType === 'MULTI'"
                        :show-radio-icon="state.selectionType === 'SINGLE'"
                        :show-clear-selection="state.selectionType === 'MULTI'"
                        @update-search-input="handleChangeContextMenuInput"
        />
    </div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed,
    reactive,
} from 'vue';

import { PBadge, PContextMenu, PI } from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import type { DashboardVariableSchemaProperty } from '@/services/dashboards/config';
// import { useContextMenuController } from '@spaceone/design-system/src/hooks/context-menu-controller';

interface Props {
    variableName: string;
    selected?: Array<MenuItem>;
    variableSchema?: DashboardVariableSchemaProperty;
}

const props = defineProps<Props>();

const state = reactive({
    visibleMenu: false,
    varialbeType: computed(() => props.variableSchema?.variable_type ?? 'MANAGED'),
    selectionType: computed(() => props.variableSchema?.selection_type ?? 'SINGLE'),
    searchText: '',
    // Must be filtered by searchText & reordered by Fn in context menu controller
    menu: [
        { name: 'spaceone', label: 'SpaceONE Dev' },
        { name: 'test1', label: 'Test-1' },
        { name: 'test2', label: 'Test-2' },
        { name: 'test3', label: 'Test-3' },
        { name: 'test4', label: 'Test-4' },
    ] as MenuItem[],
    selected: props.selected ?? [
        { name: 'spaceone', label: 'SpaceONE Dev' },
        { name: 'spaceone', label: 'SpaceONE Dev' },
        { name: 'spaceone', label: 'SpaceONE Dev' },
    ] as MenuItem[],
});
// const {
//     visibleMenu,
//     // showContextMenu,
//     hideContextMenu,
//     // focusOnContextMenu,
//     // reorderMenuBySelection,
//     // fixedMenuStyle,
// } = useContextMenuController({
//     targetRef: ref(null),
//     contextMenuRef: ref(null),
//     useReorderBySelection: true,
//     useFixedStyle: true,
// });
const hideContextMenu = () => {
    state.visibleMenu = false;
};
const showContextMenu = (e: MouseEvent) => {
    state.visibleMenu = !state.visibleMenu;
    e.stopPropagation();
};
const handleChangeContextMenuInput = (value: string): void => {
    state.searchText = value;
};

</script>

<style lang="postcss" scoped>
.dashboard-variable-dropdown {
    @apply inline-block relative;
    max-width: 20rem;

    .dropdown-box {
        @apply flex items-center border border-solid border-gray-300 bg-white rounded-md;
        height: 2rem;
        padding: 0 0.25rem 0 0.75rem;

        .variable-label {
            @apply text-gray-900 text-label-md;
        }

        .selected-items {
            @apply inline-flex items-center;
            padding: 0 0.5rem;

            .item-for-display {
                @apply text-gray-900 text-label-md font-bold;
                margin-right: 0.25rem;
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
