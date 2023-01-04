import type { ComponentPublicInstance, ComputedRef, Ref } from 'vue';
import type Vue from 'vue';
import { reactive, toRef } from 'vue';

import type { PContextMenu } from '@/components';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import type { MenuItem } from '@/inputs/context-menu/type';

type ContextMenuComponent = ComponentPublicInstance<typeof PContextMenu>;
export interface UseContextMenuControllerOptions {
    visibleMenu?: Ref<boolean>|boolean;
    targetRef: Ref<HTMLElement|Vue|null>;
    contextMenuRef: Ref<ContextMenuComponent|null>;

    /*
    Useful when used inside an element whose css position attribute value is fixed.
    It automatically resizes and provides a function that automatically closes when scrolling.
    fixedMenuStyle is returned only when this value is true.
     */
    useFixedStyle?: boolean;

    /*
    Whether to make update reorderedMenu by executing reorderMenuBySelection().
    If this options is true, reorderMenuBySelection() will use selected and originMenu options as their arguments.
    Also, reorderMenuBySelection() will be executed automatically when hideContextMenu(true) or showContextMenu(true) have been called.
     */
    useReorderBySelection?: boolean;

    /*
    Required values when using the reorder by selection feature: originMenu, selected
     */
    originMenu?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // The original menu that serves as the basis for order when reordering menus
    selected?: Ref<MenuItem[]>|ComputedRef<MenuItem[]>|MenuItem[]; // Items to be displayed at the top of the menu
}

export interface UseContextMenuControllerReturns {
    visibleMenu: Ref<boolean>;
    hideContextMenu: { (reorderMenu?: boolean): void };
    showContextMenu: { (reorderMenu?: boolean): void };
    focusOnContextMenu: FocusOnContextMenu;
    reorderMenuBySelection: ReorderMenuBySelection;
    fixedMenuStyle?: Ref<Partial<CSSStyleDeclaration>>;
    reorderedMenu: Ref<MenuItem[]>|ComputedRef<MenuItem[]>; // Reordered menu based on selection when using the reorder by selection feature
}

interface FocusOnContextMenu { (position?: number): void }
interface ReorderMenuBySelection { (selected?: MenuItem[], origin?: MenuItem[]): MenuItem[] }

export const useContextMenuController = ({
    useFixedStyle, targetRef, contextMenuRef, visibleMenu, useReorderBySelection, originMenu, selected,
}: UseContextMenuControllerOptions): UseContextMenuControllerReturns => {
    if (!targetRef) throw new Error('\'targetRef\' option must be given.');
    if (!contextMenuRef) throw new Error('\'contextMenuRef\' option must be given.');
    if (useReorderBySelection && (!originMenu || !selected)) {
        throw new Error('If \'useReorderBySelection\' is \'true\', \'originMenu\' and \'selected\' option must be given.');
    }

    const state = reactive({
        targetRef,
        contextMenuRef,
        visibleMenu: visibleMenu ?? false,
        originMenu: originMenu ?? [] as MenuItem[],
        selected: selected ?? [] as MenuItem[],
        reorderedMenu: [] as MenuItem[],
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

    const showContextMenu = (reorderMenu = false) => {
        if (reorderMenu && useReorderBySelection) reorderMenuBySelection();
        state.visibleMenu = true;
    };
    const hideContextMenu = (reorderMenu = false) => {
        if (reorderMenu && useReorderBySelection) reorderMenuBySelection();
        state.visibleMenu = false;
    };

    const focusOnContextMenu: FocusOnContextMenu = async (position?: number) => {
        if (state.contextMenuRef) {
            state.contextMenuRef.focus(position);
        }
    };

    const reorderMenuBySelection: ReorderMenuBySelection = (_selected: MenuItem[] = state.selected, origin: MenuItem[] = state.originMenu): MenuItem[] => {
        const selectedMap = {};
        _selected.forEach((item) => {
            if (!item.name) return;
            selectedMap[item.name] = item;
        });
        const unselected = origin.filter((item) => {
            if (!item.name) return true;
            if (item.type === 'divider' && item.name === 'selection-divider') return false;
            return !selectedMap[item.name];
        });
        let newItems: MenuItem[] = [];
        if (_selected.length) {
            newItems = newItems.concat(_selected);
            newItems.push({ type: 'divider', name: 'selection-divider' });
            newItems = newItems.concat(unselected);
        } else {
            newItems = unselected;
        }

        if (useReorderBySelection) {
            if (JSON.stringify(state.reorderedMenu) !== JSON.stringify(newItems)) {
                state.reorderedMenu = newItems;
            }
        }
        return newItems;
    };


    return {
        visibleMenu: toRef(state, 'visibleMenu'),
        reorderedMenu: toRef(state, 'reorderedMenu'),
        showContextMenu,
        hideContextMenu,
        focusOnContextMenu,
        reorderMenuBySelection,
        fixedMenuStyle,
    };
};
