<script setup lang="ts">
import {
    computed, reactive, ref, toRef, useSlots, watch,
} from 'vue';

import { onClickOutside, useFocus } from '@vueuse/core';
import { debounce, reduce } from 'lodash';

import PContextMenu from '@/controls/context-menu/PContextMenu.vue';
import type { ContextMenuType } from '@/controls/context-menu/type';
import DropdownButton from '@/controls/dropdown/select-dropdown/components/dropdown-button.vue';
import type {
    AutocompleteHandler,
    ContextMenuPosition,
    SelectDropdownAppearanceType,
    SelectDropdownMenuItem,
    SelectDropdownStyleType,
    SelectDropdownSize,
} from '@/controls/dropdown/select-dropdown/type';
import {
    CONTEXT_MENU_POSITION,
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/controls/dropdown/select-dropdown/type';
import { useContextMenuController, useProxyValue } from '@/hooks';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks/use-ignore-window-arrow-keydown-events/use-ignore-window-arrow-keydown-events';


interface SelectDropdownProps {
    /* dropdown button */
    styleType?: SelectDropdownStyleType;
    appearanceType?: SelectDropdownAppearanceType;
    size?: SelectDropdownSize;
    disabled?: boolean;
    invalid?: boolean;
    placeholder?: string;
    selectionLabel?: string;
    selectionHighlight?: boolean;
    showAlertDot?: boolean;
    showDeleteAllButton?: boolean;
    useFixedMenuStyle?: boolean;
    buttonIcon?: string;
    isFixedWidth?: boolean;
    resetSelectionOnMenuClose?: boolean;
    block?: boolean;

    /* context menu props */
    isFilterable?: boolean;
    visibleMenu?: boolean;
    menu?: SelectDropdownMenuItem[];
    loading?: boolean;
    selected?: SelectDropdownMenuItem[]|string|number;
    multiSelectable?: boolean;
    searchText?: string;
    readonly?: boolean;
    showSelectHeader?: boolean;
    showSelectMarker?: boolean;
    showClearSelection?: boolean;
    menuPosition?: ContextMenuPosition;
    indexMode?: boolean;
    menuWidth?: 'target-width'|string;
    boundary?: string;

    /* others */
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    pageSize?: number;
    resetSelectedOnUnmounted?: boolean;
    initSelectedWithHandler?: boolean;
    hideHeaderWithoutItems?: boolean;
}

const props = withDefaults(defineProps<SelectDropdownProps>(), {
    /* dropdown button */
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    appearanceType: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
    size: 'md',
    selected: undefined,
    placeholder: undefined,
    selectionLabel: undefined,
    showDeleteAllButton: false,
    buttonIcon: undefined,
    resetSelectionOnMenuClose: false,
    block: false,
    /* context menu props */
    visibleMenu: undefined,
    menu: () => [],
    loading: false,
    searchText: '',
    menuPosition: CONTEXT_MENU_POSITION.LEFT,
    indexMode: false,
    menuWidth: 'auto',
    boundary: undefined,
    /* others */
    handler: undefined,
    pageSize: undefined,
    resetSelectedOnUnmounted: false,
    initSelectedWithHandler: false,
});

/* event emits */
const emit = defineEmits<{(e: 'update:visible-menu', visibleMenu: boolean): void;
    (e: 'update:search-text', searchText: string): void;
    (e: 'update:selected', selected: SelectDropdownMenuItem[]|string|number): void;
    (e: 'select', item: SelectDropdownMenuItem|number|string, isSelected: boolean): void;
    (e: 'delete-tag', item: SelectDropdownMenuItem, index: number): void;
    (e: 'click-show-more'): void;
    (e: 'clear-selection'): void;
    (e: 'click-done', selected: SelectDropdownMenuItem[]|string|number): void;
    (e: 'click-button', { label, name, type }: {label: string, name: string, type: ContextMenuType}): void;
}>();

const slots = useSlots();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean>('visibleMenu', props, emit),
    proxySelectedItem: useProxyValue<SelectDropdownMenuItem[]|string|number>('selected', props, emit),
    selectedIndex: typeof props.selected === 'number' ? props.selected : undefined,
    selectedItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.proxySelectedItem === undefined) return [];
        if (props.indexMode) return [props.menu[state.selectedIndex || 0]];
        if (Array.isArray(state.proxySelectedItem)) return state.proxySelectedItem;
        return props.menu.filter((m) => m.name === state.proxySelectedItem);
    }),
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
    dropdownSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('dropdown-') || name === 'dropdown-default') {
            res[`${name.substring(9)}`] = d;
        }
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
    if (props.disabled || state.proxyVisibleMenu) return;
    if (!props.disableHandler) {
        initiateMenu();
    }
    focusOnContextMenu();
};

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideMenu);

/* context menu controller */
const menuRef = ref<HTMLElement|null>(null);
const targetRef = ref<HTMLElement|null>(null);
const {
    loading,
    refinedMenu,
    focusOnContextMenu,
    initiateMenu,
    reloadMenu,
    showMoreMenu,
} = useContextMenuController<SelectDropdownMenuItem>({
    useFixedStyle: computed(() => props.useFixedMenuStyle),
    targetRef,
    contextMenuRef: menuRef,
    visibleMenu: toRef(state, 'proxyVisibleMenu'),
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(state, 'proxySearchText'),
    selected: props.isFilterable ? toRef(state, 'selectedItems') : [],
    handler: toRef(props, 'handler'),
    menu: toRef(props, 'menu'),
    pageSize: toRef(props, 'pageSize'),
    hideHeaderWithoutItems: toRef(props, 'hideHeaderWithoutItems'),
    menuWidth: toRef(props, 'menuWidth'),
    boundary: toRef(props, 'boundary'),
    position: toRef(props, 'menuPosition'),
});

/* focusing */
const { focused: focusedOnDropdownButton } = useFocus(targetRef);
const focusDropdownButton = () => {
    if (focusedOnDropdownButton.value) return;
    focusedOnDropdownButton.value = true;
};

/* event handler */
const handleClickDropdownButton = () => {
    if (props.disabled) return;
    if (props.readonly) {
        if (props.appearanceType !== 'badge') return;
        if (state.selectedItems.length <= 1) return;
    }
    if (state.proxyVisibleMenu) hideMenu();
    else showMenu();
};
const handleSelectMenuItem = (item: SelectDropdownMenuItem, _: number, isSelected: boolean) => {
    if (!props.multiSelectable) {
        hideMenu();
        if (!props.indexMode) {
            if (Array.isArray(state.proxySelectedItem)) {
                emit('select', item, isSelected);
            } else {
                emit('select', item.name || '', isSelected);
            }
        } else {
            emit('select', state.selectedIndex, isSelected);
        }
    } else {
        emit('select', item, isSelected);
    }
};
const handleClickShowMore = async (item: SelectDropdownMenuItem) => {
    if (!props.disableHandler) {
        await showMoreMenu(item._resultIndex);
    }
    emit('click-show-more');
};
const handleClearSelection = () => {
    emit('clear-selection');
};
const handleClickDelete = (item?: SelectDropdownMenuItem, idx?: number) => {
    if (item !== undefined && idx !== undefined) {
        const selectedClone = [...state.proxySelectedItem];
        selectedClone.splice(idx, 1);
        updateSelected(selectedClone);
        emit('delete-tag', item, idx);
    } else {
        updateSelected([]);
    }
};
const handleEnterKey = () => {
    focusOnContextMenu(undefined);
};
const updateSelected = (selected: SelectDropdownMenuItem[]) => {
    if (props.resetSelectionOnMenuClose) return;
    if (props.multiSelectable) {
        state.proxySelectedItem = selected;
    } else if (Array.isArray(state.proxySelectedItem)) {
        state.proxySelectedItem = selected;
    } else {
        state.selectedIndex = props.menu.findIndex((data) => data.name === selected[0]?.name);
        state.proxySelectedItem = selected[0]?.name;
    }
};
const updateSearchText = debounce(async (searchText: string) => {
    state.proxySearchText = searchText;
    if (!props.disableHandler) {
        await reloadMenu();
    }
}, 200);
const handleClickDone = () => {
    emit('click-done', state.selectedItems);
    hideMenu();
};

const handleClickButtonType = (e: {label: string, name: string, type: ContextMenuType}) => {
    emit('click-button', e);
};

/* ignore window arrow keydown event */
useIgnoreWindowArrowKeydownEvents({ predicate: state.proxyVisibleMenu });

/* watcher */
watch(() => props.disabled, (disabled) => {
    if (disabled) hideMenu();
});

/* style type */
const styleType = computed(() => {
    if (slots['dropdown-icon-button']) return 'icon-button';
    return props.styleType;
});

/* init */
(() => {
    if (!props.multiSelectable) return;
    if (!props.selected) return;
    if (Array.isArray(props.selected)) return;

    throw new Error('If \'multiSelectable\' is \'true\', \'selected\' option must be an array.');
})();

const isInitiatingWithHandler = ref(false);
watch([() => props.handler, () => props.initSelectedWithHandler], async ([handler, initSelectedWithHandler]) => {
    if (props.disableHandler) return;
    if (!initSelectedWithHandler) return;
    if (!handler) return;
    if (!state.proxySelectedItem.length) return;
    if (isInitiatingWithHandler.value) return;

    isInitiatingWithHandler.value = true;

    // this is to refine selected items by handler's results whose label is fully set.
    let responses = handler(
        '',
        undefined,
        undefined,
        state.proxySelectedItem,
    );
    if (responses instanceof Promise) responses = await responses;
    const { results } = Array.isArray(responses) ? { results: responses.map((r) => r.results).flat() } : responses;
    state.proxySelectedItem = state.proxySelectedItem.map((item) => {
        const found = results.find((d) => d.name === item.name);
        if (found) return found;
        return item;
    });

    isInitiatingWithHandler.value = false;
}, { immediate: true });

defineExpose({ reloadMenu });
</script>

<template>
    <div ref="containerRef"
         :class="{
             'p-select-dropdown': true,
             [styleType]: true,
             [props.size]: true,
             'is-fixed-width': props.isFixedWidth,
             'is-filterable': props.isFilterable,
             'block': props.block,
         }"
    >
        <dropdown-button ref="targetRef"
                         :style-type="props.styleType"
                         :appearance-type="props.appearanceType"
                         :size="props.size"
                         :button-icon="props.buttonIcon"
                         :invalid="props.invalid"
                         :disabled="props.disabled"
                         :placeholder="props.placeholder"
                         :selection-label="props.selectionLabel"
                         :show-alert-dot="props.showAlertDot"
                         :show-delete-all-button="showDeleteAllButton"
                         :is-fixed-width="props.isFixedWidth"
                         :selection-highlight="props.selectionHighlight"
                         :is-visible-menu="props.readonly ? state.selectedItems.length > 0 && state.proxyVisibleMenu : state.proxyVisibleMenu"
                         :readonly="props.readonly"
                         :multi-selectable="props.multiSelectable"
                         :selected-items="state.selectedItems"
                         @enter-key="handleEnterKey"
                         @click-delete="handleClickDelete"
                         @click-dropdown-button="handleClickDropdownButton"
        >
            <template v-for="(_, slot) of state.dropdownSlots"
                      #[slot]="scope"
            >
                <slot :name="`dropdown-${slot}`"
                      v-bind="scope[0]"
                />
            </template>
            <template #input-left-area>
                <slot name="dropdown-left-area" />
            </template>
        </dropdown-button>
        <p-context-menu v-if="props.readonly ? (state.selectedItems.length > 0 && state.proxyVisibleMenu) : state.proxyVisibleMenu"
                        ref="menuRef"
                        :class="{
                            'dropdown-context-menu': true,
                            default: !props.showSelectMarker,
                        }"
                        :menu="props.readonly ? state.selectedItems : (props.disableHandler ? props.menu : refinedMenu)"
                        :loading="props.loading || loading"
                        :readonly="props.readonly"
                        :item-height-fixed="!props.isFilterable"
                        :selected="props.readonly ? [] : state.selectedItems"
                        :multi-selectable="props.multiSelectable"
                        :search-text="state.proxySearchText"
                        :searchable="props.isFilterable"
                        :show-select-header="props.showSelectHeader"
                        :show-select-marker="props.showSelectMarker"
                        :show-clear-selection="props.isFilterable || props.showClearSelection"
                        :reset-selected-on-unmounted="props.resetSelectedOnUnmounted"
                        @select="handleSelectMenuItem"
                        @click-done="handleClickDone"
                        @click-show-more="handleClickShowMore"
                        @clear-selection="handleClearSelection"
                        @click-button="handleClickButtonType"
                        @keyup:up:end="focusDropdownButton"
                        @keyup:down:end="focusOnContextMenu()"
                        @keyup:esc="hideMenu"
                        @update:selected="updateSelected"
                        @update:search-text="updateSearchText"
        >
            <template #header>
                <slot name="context-menu-header" />
            </template>
            <template #no-data-format>
                <slot name="no-data-area" />
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
.p-select-dropdown {
    @apply relative inline-block;
    min-width: 6.5rem;

    &.sm {
        min-width: 4.125rem;
    }
    &.icon-button, &.tertiary-icon-button {
        min-width: 0;
    }
    &.block {
        width: 100%;
    }
    .dropdown-context-menu {
        @apply absolute;
        margin-top: -1px;
        z-index: 1000;
    }

    &.is-fixed-width {
        @apply relative inline-block;
        width: 100%;
    }

    &.is-filterable {
        width: 100%;
    }

    &.icon-button, &.transparent {
        min-width: unset;
    }
}
</style>
