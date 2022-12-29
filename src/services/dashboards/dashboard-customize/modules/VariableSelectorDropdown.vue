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
                        :style="fixedMenuStyle"
                        :menu="menu"
                        :selected.sync="selected"
                        :multi-selectable="selectionType === 'MULTI'"
                        :show-radio-icon="selectionType === 'SINGLE'"
                        :show-clear-selection="selectionType === 'MULTI'"
                        @update-search-input="handleChangeContextMenuInput"
        />
    </div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    onMounted,
    reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PBadge, PContextMenu, PI, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import type { VariableSelectionType } from '@/services/dashboards/config';

interface Props {
    variableName: string;
    defaultSelected?: string| string[];
    variableOptions: string[];
    selectionType: VariableSelectionType;
}
interface EmitFn {
    (e: 'change', value: string|string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<EmitFn>();


const state = reactive({
    targetRef: null,
    contextMenuRef: null,
    searchText: '',
    selected: [] as MenuItem[],
    options: [] as MenuItem[],
});

const {
    targetRef,
    contextMenuRef,
    selected,
    options,
} = toRefs(state);

const {
    visibleMenu,
    showContextMenu,
    hideContextMenu,
    // focusOnContextMenu,
    reorderMenuBySelection,
    fixedMenuStyle,
    menu,
} = useContextMenuController({
    targetRef,
    contextMenuRef,
    useReorderBySelection: true,
    useFixedStyle: true,
    menu: options,
});

// event
const handleClearSelected = () => {
    state.selected = [];
};
const handleChangeVisible = () => {
    if (visibleMenu.value) {
        hideContextMenu();
    } else {
        reorderMenuBySelection(selected.value);
        showContextMenu();
    }
};
// TODO: search text binding
const handleChangeContextMenuInput = (value: string): void => {
    // state.searchText = value;
};

// reconvert to string | string[]
watch(() => state.selected, (_selected) => {
    let reconvertedSelected;
    if (props.selectionType === 'SINGLE') {
        reconvertedSelected = _selected[0].name;
    } else reconvertedSelected = _selected.map((d) => d.name);
    emit('change', reconvertedSelected);
});

onMounted(() => {
    // convert to MenuItem for selected
    if (props.defaultSelected) {
        const defaultSelected = [] as MenuItem[];
        if (Array.isArray(props.defaultSelected)) {
            props.defaultSelected.forEach((d) => {
                defaultSelected.push({ name: d, label: d });
            });
        } else defaultSelected.push({ name: props.defaultSelected, label: props.defaultSelected });
        state.selected = defaultSelected;
    }

    // convert to MenuItem for variable options
    const defaultMenu = [] as MenuItem[];
    props.variableOptions.forEach((d) => {
        defaultMenu.push({ name: d, label: d });
    });
    state.options = defaultMenu;
});

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
