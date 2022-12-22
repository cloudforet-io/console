import type { ComputedRef, Ref } from 'vue';
import type Vue from 'vue';
import { reactive, toRef } from 'vue';

import type { PContextMenu } from '@/components';
import { useContextMenuFixedStyle } from '@/hooks';
import type { MenuItem } from '@/inputs/context-menu/type';

export interface UseContextMenuControllerOptions {
    useFixedStyle?: boolean;
    visibleMenu?: Ref<boolean>|boolean;
    targetRef: Ref<HTMLElement|Vue|null>;
    contextMenuRef: Ref<typeof PContextMenu|null>;
    menu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>;
    useReorderBySelection?: boolean;
}

export interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    hideContextMenu: { (): void };
    showContextMenu: { (): void };
    focusOnContextMenu: FocusOnContextMenu;
    reorderMenuBySelection: ReorderMenuBySelection;
    fixedMenuStyle?: Ref<Partial<CSSStyleDeclaration>>;
    menu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>;
}

interface FocusOnContextMenu { (position?: number): void }
interface ReorderMenuBySelection { (selected: MenuItem[]): MenuItem[] }

export const useContextMenuController = ({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, menu, useReorderBySelection,
}: UseContextMenuControllerOptions): UseContextMenuControllerReturns => {
    if (!targetRef) throw new Error('No targetRef received.');
    if (!contextMenuRef) throw new Error('No contextMenuRef received.');
    if (useReorderBySelection && !menu) throw new Error('No menu received to reorder by selection.');

    const state = reactive({
        targetRef,
        contextMenuRef,
        visibleMenu: visibleMenu ?? false,
        menu: menu ?? [],
    });

    let fixedMenuStyle: Ref<Partial<CSSStyleDeclaration>>|undefined;
    if (useFixedStyle) {
        const {
            contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: true,
            visibleMenu: toRef(state, 'visibleMenu'),
            targetRef,
        });
        fixedMenuStyle = contextMenuStyle;
    }

    const showContextMenu = () => {
        state.visibleMenu = true;
    };
    const hideContextMenu = () => {
        state.visibleMenu = false;
    };

    const focusOnContextMenu: FocusOnContextMenu = async (position?: number) => {
        if (state.contextMenuRef) state.contextMenuRef.focus(position);
    };

    const reorderMenuBySelection: ReorderMenuBySelection = (selected: MenuItem[]) => {
        const selectedMap = {};
        selected.forEach((item) => {
            if (!item.name) return;
            selectedMap[item.name] = item;
        });
        const unselected = state.menu.filter((item) => !item.name || !selectedMap[item.name]);
        let newItems: MenuItem[] = [];
        if (selected.length) {
            newItems = newItems.concat(selected);
            newItems.push({ type: 'divider', name: 'selection-divider' });
            newItems = newItems.concat(unselected);
        } else {
            newItems = unselected;
        }
        state.menu = newItems;
        return newItems;
    };


    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        menu: toRef(state, 'menu'),
        showContextMenu,
        hideContextMenu,
        focusOnContextMenu,
        reorderMenuBySelection,
        fixedMenuStyle,
    };
};
