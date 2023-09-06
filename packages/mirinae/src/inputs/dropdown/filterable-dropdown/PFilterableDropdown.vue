<script setup lang="ts">
import {
    computed, watch, useSlots, ref, toRef, reactive,
} from 'vue';

import { onClickOutside, useFocus } from '@vueuse/core';
import { debounce, reduce } from 'lodash';

import PBadge from '@/data-display/badge/PBadge.vue';
import PTag from '@/data-display/tags/PTag.vue';
import PI from '@/foundation/icons/PI.vue';
import { useContextMenuController, useProxyValue } from '@/hooks';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks/ignore-window-arrow-keydown-events';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import {
    useFilterableDropdownButtonDisplay,
} from '@/inputs/dropdown/filterable-dropdown/composables/filterable-dropdown-button-display';
import type {
    AutocompleteHandler, FilterableDropdownAppearanceType,
    DropdownMenuItem,
} from '@/inputs/dropdown/filterable-dropdown/type';
import { FILTERABLE_DROPDOWN_APPEARANCE_TYPES } from '@/inputs/dropdown/filterable-dropdown/type';

/* props */
interface FilterableDropdownProps {
    /* context menu props */
    menu?: DropdownMenuItem[];
    loading?: boolean;
    selected?: DropdownMenuItem[];
    multiSelectable?: boolean;
    searchText?: string;
    readonly?: boolean;
    showSelectHeader?: boolean;
    showSelectMarker?: boolean;
    /* others */
    visibleMenu?: boolean;
    useFixedMenuStyle?: boolean;
    placeholder?: string;
    invalid?: boolean;
    disabled?: boolean;
    // eslint-disable-next-line vue/require-default-prop
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    appearanceType?: FilterableDropdownAppearanceType;
    // eslint-disable-next-line vue/require-default-prop
    pageSize?: number;
    resetSelectedOnUnmounted?: boolean;
    showDeleteAllButton?: boolean;
}
const props = withDefaults(defineProps<FilterableDropdownProps>(), {
    menu: () => [],
    loading: false,
    selected: () => [],
    searchText: '',
    visibleMenu: undefined,
    placeholder: undefined,
    appearanceType: FILTERABLE_DROPDOWN_APPEARANCE_TYPES[0],
    resetSelectedOnUnmounted: true,
    showDeleteAllButton: true,
});

/* event emits */
const emit = defineEmits<{(e: 'update:visible-menu', visibleMenu: boolean): void;
    (e: 'update:search-text', searchText: string): void;
    (e: 'update:selected', selected: DropdownMenuItem[]): void;
    (e: 'select', item: DropdownMenuItem, isSelected: boolean): void;
    (e: 'delete-tag', item: DropdownMenuItem, index: number): void;
    (e: 'click-show-more'): void;
    (e: 'clear-selection'): void;
}>();

const slots = useSlots();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean>('visibleMenu', props, emit),
    proxySelectedItem: useProxyValue<DropdownMenuItem[]>('selected', props, emit),
    proxySearchText: useProxyValue('searchText', props, emit),
    showDeleteAllButton: computed(() => {
        if (!props.showDeleteAllButton) return false;
        if (props.disabled) return false;
        if (props.readonly) return false;
        return !!state.proxySelectedItem.length;
    }),
    menuSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
        return res;
    }, {})),
});

/* menu visibility */
const hideMenu = () => {
    if (state.proxyVisibleMenu) {
        state.proxyVisibleMenu = false;
        state.proxySearchText = '';
    }
};
const showMenu = () => {
    if (props.readonly || props.disabled || state.proxyVisibleMenu) return;
    initiateMenu();
    focusOnContextMenu();
};

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideMenu);

/* dropdown button display */
const {
    displayValueOnDropdownButton,
    showTagsOnDropdownButton,
    displayBadgeValueOnDropdownButton,
} = useFilterableDropdownButtonDisplay({
    multiSelectable: toRef(props, 'multiSelectable'),
    selected: toRef(state, 'proxySelectedItem'),
    appearanceType: toRef(props, 'appearanceType'),
});

/* context menu controller */
const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement|null>(null);
const {
    contextMenuStyle,
    loading,
    refinedMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController({
    useFixedStyle: computed(() => props.useFixedMenuStyle),
    targetRef,
    contextMenuRef: menuRef,
    visibleMenu: toRef(state, 'proxyVisibleMenu'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'proxySearchText'),
    selected: toRef(state, 'proxySelectedItem'),
    handler: toRef(props, 'handler'),
    menu: toRef(props, 'menu'),
    pageSize: toRef(props, 'pageSize'),
});

/* focusing */
const { focused: focusedOnDropdownButton } = useFocus(targetRef);
const focusDropdownButton = () => {
    if (focusedOnDropdownButton.value) return;
    focusedOnDropdownButton.value = true;
};

/* event handler */
const handleClickDropdownButton = () => {
    if (state.proxyVisibleMenu) hideMenu();
    else showMenu();
};
const handleSelectMenuItem = (item: DropdownMenuItem, _, isSelected: boolean) => {
    if (!props.multiSelectable) hideMenu();
    emit('select', item, isSelected);
};
const handleUpdateSelected = (selected: DropdownMenuItem[]) => {
    state.proxySelectedItem = selected;
};
const handleClickShowMore = async () => {
    if (!props.disableHandler) {
        await showMoreMenu();
    }
    emit('click-show-more');
};
const handleClearSelection = () => {
    emit('clear-selection');
};
const handleUpdateSearchText = debounce(async (searchText: string) => {
    state.proxySearchText = searchText;
    if (!props.disableHandler) {
        await reloadMenu();
    }
}, 200);
const handleClickDeleteAll = () => {
    if (state.proxySelectedItem.length) {
        handleUpdateSelected([]);
    }
};
const handleTagDelete = (item: DropdownMenuItem, idx: number) => {
    const selectedClone = [...state.proxySelectedItem];
    selectedClone.splice(idx, 1);
    handleUpdateSelected(selectedClone);
    emit('delete-tag', item, idx);
};

/* ignore window arrow keydown event */
useIgnoreWindowArrowKeydownEvents({ predicate: state.proxyVisibleMenu });

/* watcher */
watch(() => props.disabled, (disabled) => {
    if (disabled) hideMenu();
});
</script>

<template>
    <div ref="containerRef"
         class="p-filterable-dropdown"
         :class="{
             disabled: props.disabled,
             readonly: props.readonly,
             opened: state.proxyVisibleMenu, invalid
         }"
    >
        <div ref="targetRef"
             class="dropdown-button"
             :tabindex="(disabled || readonly) ? -1 : 0"
             @keyup.down="focusOnContextMenu(undefined)"
             @keyup.esc.capture.stop="hideMenu"
             @keyup.enter.capture.stop="handleClickDropdownButton"
             @click="handleClickDropdownButton"
        >
            <slot name="input-left-area" />
            <div class="selection-display-wrapper">
                <span v-if="displayValueOnDropdownButton === undefined"
                      class="placeholder"
                >
                    {{ props.placeholder || $t('COMPONENT.FILTERABLE_DROPDOWN.PLACEHOLDER') }}
                </span>
                <span v-else-if="displayValueOnDropdownButton"
                      class="selected-item"
                >
                    {{ displayValueOnDropdownButton }}
                    <p-badge v-if="displayBadgeValueOnDropdownButton"
                             :style-type="disabled ? 'gray200' : 'blue200'"
                             :badge-type="disabled ? 'solid' : 'subtle'"
                    >
                        {{ displayBadgeValueOnDropdownButton }}
                    </p-badge>
                </span>
                <div v-else-if="showTagsOnDropdownButton"
                     class="tags-wrapper"
                >
                    <p-tag v-for="(item, idx) in state.proxySelectedItem"
                           :key="item.name"
                           class="selected-tag"
                           @delete="handleTagDelete(item, idx)"
                    >
                        {{ item.label || item.name }}
                    </p-tag>
                </div>
                <span v-if="state.showDeleteAllButton"
                      class="delete-all-button"
                      @click.stop="handleClickDeleteAll"
                >
                    <p-i name="ic_close"
                         width="1rem"
                         height="1rem"
                         color="inherit"
                    />
                </span>
            </div>
            <span class="arrow-button"
                  @click.stop="handleClickDropdownButton"
            >
                <p-i :name="state.proxyVisibleMenu ? 'ic_chevron-up' : 'ic_chevron-down'"
                     width="1.5rem"
                     height="1.5rem"
                     color="inherit"
                />
            </span>
        </div>
        <p-context-menu v-show="state.proxyVisibleMenu"
                        ref="menuRef"
                        class="dropdown-context-menu"
                        :search-text="state.proxySearchText"
                        searchable
                        :menu="refinedMenu"
                        :loading="props.loading || loading"
                        :readonly="props.readonly"
                        :selected="state.proxySelectedItem"
                        :multi-selectable="props.multiSelectable"
                        :show-select-header="props.showSelectHeader"
                        :show-select-marker="props.showSelectMarker"
                        show-clear-selection
                        :style="contextMenuStyle"
                        :class="{ default: !props.showSelectMarker }"
                        :reset-selected-on-unmounted="props.resetSelectedOnUnmounted"
                        @select="handleSelectMenuItem"
                        @click-done="hideMenu"
                        @click-show-more="handleClickShowMore"
                        @clear-selection="handleClearSelection"
                        @keyup:up:end="focusDropdownButton"
                        @keyup:down:end="focusOnContextMenu()"
                        @keyup:esc="hideMenu"
                        @update:selected="handleUpdateSelected"
                        @update:search-text="handleUpdateSearchText"
        >
            <template #header>
                <slot name="context-menu-header" />
            </template>
            <template v-for="(_, slot) of state.menuSlots"
                      #[slot]="scope"
            >
                <slot :name="`menu-${slot}`"
                      v-bind="scope"
                />
            </template>
        </p-context-menu>
    </div>
</template>

<style lang="postcss">
.p-filterable-dropdown {
    @apply relative w-full;
    > .dropdown-button {
        @apply flex items-center bg-white border rounded-md border-gray-300 cursor-pointer;
        width: 100%;
        min-height: 2rem;
        > .selection-display-wrapper {
            @apply flex;
            flex-grow: 1;
            width: 100%;
            > .placeholder {
                @apply text-label-md text-gray-500;
                flex-grow: 1;
                line-height: 1.5;
                padding: 0.25rem 0.5rem;
            }
            > .selected-item {
                @apply text-label-md text-gray-800;
                flex-grow: 1;
                line-height: 1.5;
                padding: 0.25rem 0.5rem;
            }
            > .tags-wrapper {
                @apply flex flex-wrap;
                flex-grow: 1;
                gap: 0.5rem;
                padding: 0.375rem 0.5rem;
                > .selected-tag {
                    margin: 0;
                }
            }
            > .delete-all-button {
                @apply inline-flex items-center text-gray-400 cursor-pointer;
                flex-shrink: 0;
                max-height: 2rem;
                width: 1rem;
            }
        }
        .arrow-button {
            @apply inline-flex items-center text-gray-600 cursor-pointer;
            flex-shrink: 0;
            max-height: 2rem;
            width: 1.75rem;
        }
    }
    > .dropdown-context-menu {
        @apply absolute;
        z-index: 1000;
        min-width: 100%;
        width: 100%;
    }

    &.disabled {
        > .dropdown-button {
            @apply bg-gray-100 border-gray-300 cursor-not-allowed;
            > .arrow-button {
                @apply text-gray-300;
            }
        }
    }

    &.readonly {
        > .dropdown-button {
            @apply text-gray-300 border-gray-300 cursor-default;
            .selected-item {
                @apply text-gray-800;
            }
            > .arrow-button {
                @apply text-gray-300;
            }
        }
    }

    &.opened:not(.invalid) {
        > .dropdown-button {
            @apply border-secondary;
            > .arrow-button {
                @apply text-secondary;
            }
        }
    }

    &.invalid {
        > .dropdown-button {
            @apply border-alert;
        }
    }

    @media (hover: hover) {
        &:not(.disabled, .readonly):hover {
            > .dropdown-button {
                @apply text-secondary;
            }
            &:not(.invalid) {
                > .dropdown-button {
                    @apply border-secondary;
                }
            }
        }
    }
}
</style>
