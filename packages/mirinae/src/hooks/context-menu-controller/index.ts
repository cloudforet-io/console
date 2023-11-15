import type { ComputedRef, Ref, UnwrapRef } from 'vue';
import type Vue from 'vue';
import {
    computed, isRef, reactive, ref, toRef,
} from 'vue';

import type { MenuAttachHandler } from '@/hooks/context-menu-controller/context-menu-attach';
import { useContextMenuAttach } from '@/hooks/context-menu-controller/context-menu-attach';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import type { MenuItem } from '@/inputs/context-menu/type';
import { getTextHighlightRegex } from '@/utils/helpers';

export interface UseContextMenuControllerOptions<Item extends MenuItem = MenuItem> {
    targetRef: Ref<HTMLElement|Vue|null>; // required for style

    contextMenuRef?: Ref<any|null>; // required when using focusing feature by focusOnContextMenu()
    /*
    Useful when used inside an element whose css position attribute value is fixed.
    It automatically resizes and provides a function that automatically closes when scrolling.
    contextMenuStyle is returned only when this value is true.
     */
    useFixedStyle?: Ref<boolean|undefined>|boolean;

    visibleMenu?: Ref<boolean>|boolean; // used for visibility control. related to fixed style feature and focusing feature. give this option or use returned value.

    /* Whether to automatically reorder on initiateMenu(). */
    useReorderBySelection?: boolean;
    /* Required values when using the reorder by selection feature: menu or handler, selected */
    menu?: Ref<Item[]>|Item[]; // The original menu that serves as the basis for order when reordering menus
    handler?: Ref<MenuAttachHandler<Item>|undefined>;
    selected?: Ref<Item[]>|ComputedRef<Item[]>|Item[]; // Items to be displayed at the top of the menu

    /* Whether to automatically filtering menu by searchText  */
    useMenuFiltering?: boolean;
    /* Required values when using the reorder by selection feature: menu or handler, searchText */
    searchText?: Ref<string>;

    /* Required when to use show more button to attach items  */
    pageSize?: Ref<number|undefined>|number;

    /* In the context of 'useFixedStyle,' to adjust the position of the context menu relative to the target, the default value is 'left.'  */
    position?: 'left' | 'right';
}


interface FocusOnContextMenu { (position?: number): void }

export const useContextMenuController = <Item extends MenuItem = MenuItem>({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, useReorderBySelection, menu, selected,
    useMenuFiltering, searchText, handler, pageSize, position,
}: UseContextMenuControllerOptions<Item>) => {
    if (!targetRef) throw new Error('\'targetRef\' option must be given.');
    if (useReorderBySelection) {
        if (!menu && (!handler || (isRef(handler) && !handler.value))) {
            throw new Error('If \'useReorderBySelection\' is \'true\', \'menu\' or \'handler\' option must be given.');
        }
        if (!selected) {
            throw new Error('If \'useReorderBySelection\' is \'true\', \'selected\' option must be given.');
        }
    }
    if (useMenuFiltering) {
        if (!menu && (!handler || (isRef(handler) && !handler.value))) {
            throw new Error('If \'useMenuFiltering\' is \'true\', \'menu\' or \'handler\' option must be given.');
        }
        if (!searchText) {
            throw new Error('If \'useMenuFiltering\' is \'true\', \'searchText\' option must be given.');
        }
    }

    const state = reactive({
        contextMenuRef,
        useFixedStyle: useFixedStyle ?? false,
        visibleMenu: visibleMenu ?? false,
        menu: menu ?? [] as Item[],
        selected: selected ?? [] as Item[],
        pageSize,
        searchText: searchText ?? '',
        position: position ?? 'left',
    });

    /* fixed style */
    const {
        contextMenuStyle,
    } = useContextMenuFixedStyle({
        useFixedMenuStyle: toRef(state, 'useFixedStyle'),
        visibleMenu: toRef(state, 'visibleMenu'),
        targetRef,
        position: state.position,
    });

    // menu filtering
    const filterItemsBySearchText = (text: string, items: Item[]) => {
        let results: Item[];
        const trimmed = text.trim();
        if (trimmed) {
            const regex = getTextHighlightRegex(trimmed);
            results = items.filter((d) => {
                if (d.type === undefined || d.type === 'item') return regex.test(d.label as string);
                return true;
            });
        } else {
            results = [...items] ?? [];
        }

        return results;
    };

    /* menu capturing */
    const selectedSnapshot = ref<Item[]>([]);
    const capture = () => {
        selectedSnapshot.value = [...state.selected] as UnwrapRef<Item[]>;
    };

    /* menu attaching */
    const defaultMenu = useMenuFiltering ? computed<Item[]>(() => filterItemsBySearchText(state.searchText, state.menu as Item[])) : toRef(state, 'menu');
    const {
        attachedMenu,
        attachLoading,
        resetMenuAndPagination: resetAttachedMenuAndPagination,
        attachMenuItems,
    } = useContextMenuAttach<Item>({
        attachHandler: handler,
        menu: defaultMenu as Ref<Item[]>,
        searchText,
        pageSize: toRef(state, 'pageSize'),
        filterItems: useReorderBySelection ? selectedSnapshot as Ref<Item[]> : undefined,
    });

    /* menu refining */
    const SELECTION_DIVIDER_KEY = 'selection-divider';
    const topItems = computed<Item[]>(() => filterItemsBySearchText(state.searchText, selectedSnapshot.value as Item[]));
    const refinedMenu = computed(() => {
        if (!useReorderBySelection) return attachedMenu.value;

        let newItems: Item[] = [];
        if (topItems.value.length) {
            newItems = newItems.concat(topItems.value);
            newItems.push({ type: 'divider', name: SELECTION_DIVIDER_KEY } as Item);
            newItems = newItems.concat(attachedMenu.value);
        } else {
            newItems = attachedMenu.value;
        }
        return newItems;
    });

    /* menu visibility, focusing, refining */
    const showContextMenu = () => {
        if (!state.visibleMenu) {
            state.visibleMenu = true;
        }
    };
    const hideContextMenu = () => {
        if (state.visibleMenu) state.visibleMenu = false;
    };
    const toggleContextMenu = () => {
        if (state.visibleMenu) hideContextMenu();
        else showContextMenu();
    };
    const focusOnContextMenu: FocusOnContextMenu = async (focusPosition?: number) => {
        showContextMenu();
        if (state.contextMenuRef) {
            state.contextMenuRef.focus(focusPosition);
        }
    };
    const initiateMenu = async () => {
        resetAttachedMenuAndPagination();
        capture();
        await attachMenuItems();
    };
    const reloadMenu = async () => {
        resetAttachedMenuAndPagination();
        await attachMenuItems();
    };

    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        refinedMenu,
        contextMenuStyle,
        loading: attachLoading,
        showContextMenu,
        hideContextMenu,
        toggleContextMenu,
        focusOnContextMenu,
        initiateMenu,
        reloadMenu,
        showMoreMenu: attachMenuItems,
    };
};
