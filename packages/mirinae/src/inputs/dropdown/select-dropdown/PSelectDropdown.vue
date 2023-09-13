<script setup lang="ts">
import {
    computed, watch, useSlots, ref, toRef, reactive,
} from 'vue';

import { onClickOutside, useFocus } from '@vueuse/core';
import { debounce, reduce } from 'lodash';

import { useContextMenuController, useProxyValue } from '@/hooks';
import { useIgnoreWindowArrowKeydownEvents } from '@/hooks/ignore-window-arrow-keydown-events';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import DropdownButton from '@/inputs/dropdown/select-dropdown/components/dropdown-button.vue';
import type {
    AutocompleteHandler,
    SelectDropdownAppearanceType,
    SelectDropdownMenuItem,
    SelectDropdownStyleType,
    ContextMenuPosition,
} from '@/inputs/dropdown/select-dropdown/type';
import {
    CONTEXT_MENU_POSITION,
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/inputs/dropdown/select-dropdown/type';


interface SelectDropdownProps {
    /* dropdown button */
    styleType?: SelectDropdownStyleType;
    appearanceType?: SelectDropdownAppearanceType;
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
    menuPosition?: ContextMenuPosition;

    /* others */
    handler?: AutocompleteHandler;
    disableHandler?: boolean;
    pageSize?: number;
    resetSelectedOnUnmounted?: boolean;
}

const props = withDefaults(defineProps<SelectDropdownProps>(), {
    /* dropdown button */
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    appearanceType: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
    selected: undefined,
    placeholder: undefined,
    selectionLabel: undefined,
    showDeleteAllButton: false,
    buttonIcon: undefined,
    /* context menu props */
    visibleMenu: undefined,
    menu: () => [],
    loading: false,
    searchText: '',
    menuPosition: CONTEXT_MENU_POSITION.LEFT,
    /* others */
    handler: undefined,
    pageSize: undefined,
    resetSelectedOnUnmounted: true,
});

/* event emits */
const emit = defineEmits<{(e: 'update:visible-menu', visibleMenu: boolean): void;
    (e: 'update:search-text', searchText: string): void;
    (e: 'update:selected', selected: SelectDropdownMenuItem[]): void;
    (e: 'select', item: SelectDropdownMenuItem, isSelected: boolean): void;
    (e: 'delete-tag', item: SelectDropdownMenuItem, index: number): void;
    (e: 'click-show-more'): void;
    (e: 'clear-selection'): void;
}>();

const slots = useSlots();

const state = reactive({
    proxyVisibleMenu: useProxyValue<boolean>('visibleMenu', props, emit),
    proxySelectedItem: useProxyValue<SelectDropdownMenuItem[]|string|number>('selected', props, emit),
    selectedItems: computed<SelectDropdownMenuItem[]>(() => {
        if (!state.proxySelectedItem) return [];
        if (Array.isArray(state.proxySelectedItem)) return state.proxySelectedItem;
        return [{
            label: state.proxySelectedItem,
            value: state.proxySelectedItem,
        }];
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
    buttonSlots: computed(() => reduce(slots, (res, d, name) => {
        if (name.startsWith('button-') || name === 'button-default') {
            res[`${name.substring(7)}`] = d;
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
    if (props.readonly || props.disabled || state.proxyVisibleMenu) return;
    if (!props.disableHandler) {
        initiateMenu();
    }
    focusOnContextMenu();
};

const containerRef = ref<HTMLElement|null>(null);
onClickOutside(containerRef, hideMenu);

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
    selected: props.isFilterable ? toRef(state, 'selectedItems') : [],
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
    if (props.readonly || props.disabled) return;
    if (state.proxyVisibleMenu) hideMenu();
    else showMenu();
};
const handleSelectMenuItem = (item: SelectDropdownMenuItem, _, isSelected: boolean) => {
    if (!props.multiSelectable) hideMenu();
    emit('select', item, isSelected);
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
    state.proxySelectedItem = selected;
};
const updateSearchText = debounce(async (searchText: string) => {
    state.proxySearchText = searchText;
    if (!props.disableHandler) {
        await reloadMenu();
    }
}, 200);

/* ignore window arrow keydown event */
useIgnoreWindowArrowKeydownEvents({ predicate: state.proxyVisibleMenu });

/* watcher */
watch(() => props.disabled, (disabled) => {
    if (disabled) hideMenu();
});
</script>

<template>
    <div ref="containerRef"
         :class="{
             'p-select-dropdown': true,
             'is-fixed-width': props.isFixedWidth,
         }"
    >
        <dropdown-button ref="targetRef"
                         :style-type="props.styleType"
                         :appearance-type="props.appearanceType"
                         :button-icon="props.buttonIcon"
                         :invalid="props.invalid"
                         :disabled="props.disabled"
                         :placeholder="props.placeholder"
                         :selection-label="props.selectionLabel"
                         :show-alert-dot="props.showAlertDot"
                         :show-delete-all-button="showDeleteAllButton"
                         :is-fixed-width="props.isFixedWidth"
                         :selection-highlight="props.selectionHighlight"
                         :is-visible-menu="state.proxyVisibleMenu"
                         :readonly="props.readonly"
                         :multi-selectable="props.multiSelectable"
                         :selected-items="state.selectedItems"
                         @enter-key="handleEnterKey"
                         @click-delete="handleClickDelete"
                         @click-dropdown-button="handleClickDropdownButton"
        />
        <p-context-menu v-show="state.proxyVisibleMenu"
                        ref="menuRef"
                        :class="{
                            'dropdown-context-menu': true,
                            default: !props.showSelectMarker,
                            [menuPosition]: props.styleType !== SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON && !useFixedMenuStyle }"
                        :menu="refinedMenu"
                        :loading="props.loading || loading"
                        :readonly="props.readonly"
                        :style="{
                            ...contextMenuStyle,
                            ...(props.styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON && {width: 'auto'}),
                        }"
                        :item-height-fixed="!props.isFilterable"
                        :no-select-indication="!props.isFilterable"
                        :selected="state.selectedItems"
                        :multi-selectable="props.multiSelectable"
                        :search-text="state.proxySearchText"
                        :searchable="props.isFilterable"
                        :show-select-header="props.showSelectHeader"
                        :show-select-marker="props.showSelectMarker"
                        :show-clear-selection="props.isFilterable"
                        :reset-selected-on-unmounted="props.resetSelectedOnUnmounted"
                        @select="handleSelectMenuItem"
                        @click-done="hideMenu"
                        @click-show-more="handleClickShowMore"
                        @clear-selection="handleClearSelection"
                        @keyup:up:end="focusDropdownButton"
                        @keyup:down:end="focusOnContextMenu()"
                        @keyup:esc="hideMenu"
                        @update:selected="updateSelected"
                        @update:search-text="updateSearchText"
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
.p-select-dropdown {
    @apply relative inline-block;
    min-width: 6.5rem;

    .dropdown-context-menu {
        @apply absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: auto;

        /* menu position */
        &.left {
            left: 0;
            right: unset;
        }
        &.right {
            left: unset;
            right: -1px;
        }
    }

    &.is-fixed-width {
        display: initial;
    }
}
</style>
