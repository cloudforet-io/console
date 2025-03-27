import type { Ref } from 'vue';
import { reactive, toRef } from 'vue';

import type { MenuItem } from '@/controls/context-menu/type';
import type {
    UseContextMenuItemsOptions,
} from '@/hooks/use-context-menu-items/use-context-menu-items';
import {
    useContextMenuItems,
} from '@/hooks/use-context-menu-items/use-context-menu-items';
import type { UseContextMenuStyleOptions } from '@/hooks/use-context-menu-style/use-context-menu-style';
import { useContextMenuStyle } from '@/hooks/use-context-menu-style/use-context-menu-style';


export interface UseContextMenuControllerOptions<Item extends MenuItem = MenuItem> extends
    Omit<UseContextMenuStyleOptions, 'visibleMenu'|'menuRef'|'useFixedMenuStyle'>,
    UseContextMenuItemsOptions<Item> {
    visibleMenu?: Ref<boolean>|boolean; // used for visibility control. related to fixed style feature and focusing feature. give this option or use returned value.
    contextMenuRef?: UseContextMenuStyleOptions['menuRef'];
    useFixedStyle?: UseContextMenuStyleOptions['useFixedMenuStyle'];
}

interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    refinedMenu: ReturnType<typeof useContextMenuItems>['refinedMenu'];
    contextMenuStyle: ReturnType<typeof useContextMenuStyle>['contextMenuStyle'];
    loading: ReturnType<typeof useContextMenuItems>['loading'];
    showContextMenu: () => void;
    hideContextMenu: () => void;
    toggleContextMenu: () => void;
    focusOnContextMenu: FocusOnContextMenu;
    initiateMenu: ReturnType<typeof useContextMenuItems>['initiateMenu'];
    reloadMenu: ReturnType<typeof useContextMenuItems>['reloadMenu'];
    showMoreMenu: ReturnType<typeof useContextMenuItems>['showMoreMenu'];
}

export interface FocusOnContextMenu { (position?: number): void }

export const useContextMenuController = <Item extends MenuItem = MenuItem>({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, useReorderBySelection, menu, selected,
    useMenuFiltering, searchText, handler, pageSize, position, hideHeaderWithoutItems, menuWidth, boundary,
}: UseContextMenuControllerOptions<Item>): UseContextMenuControllerReturns => {
    const state = reactive({
        contextMenuRef: contextMenuRef ?? null,
        visibleMenu: visibleMenu ?? false,
    });

    /* menu style */
    const {
        contextMenuStyle,
    } = useContextMenuStyle({
        useFixedMenuStyle: useFixedStyle,
        visibleMenu: toRef(state, 'visibleMenu'),
        targetRef,
        position,
        menuRef: toRef(state, 'contextMenuRef'),
        menuWidth,
        boundary,
    });

    /* menu items */
    const {
        refinedMenu,
        loading,
        initiateMenu,
        reloadMenu,
        showMoreMenu,
    } = useContextMenuItems({
        useReorderBySelection, menu, selected, useMenuFiltering, searchText, handler, pageSize, hideHeaderWithoutItems,
    });

    /* menu visibility, focusing */
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
            state.contextMenuRef.focus(focusPosition); // contextMenu component has focus method
        }
    };

    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        refinedMenu,
        contextMenuStyle,
        loading,
        showContextMenu,
        hideContextMenu,
        toggleContextMenu,
        focusOnContextMenu,
        initiateMenu,
        reloadMenu,
        showMoreMenu,
    };
};
