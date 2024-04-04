import {
    computed, nextTick, onMounted, onUnmounted, reactive, ref, toRefs, watch,
} from 'vue';
import type { Ref } from 'vue';
import type Vue from 'vue';

import type { ResizeObserverEntry } from '@juggle/resize-observer';
import { ResizeObserver } from '@juggle/resize-observer';
import { throttle } from 'lodash';

interface UseContextMenuFixedStyleOptions {
    useFixedMenuStyle?: Ref<boolean|undefined> | boolean;
    visibleMenu: Ref<boolean|undefined>;
    targetRef?: Ref<Vue|HTMLElement|null>;
    position?: 'left' | 'right';
    menuRef?: Ref<Vue|HTMLElement|null>;
    multiSelectable?: Ref<boolean|undefined>|boolean;
    parentId?: Ref<string|undefined>|string;
}

export const useContextMenuFixedStyle = ({
    useFixedMenuStyle, visibleMenu, targetRef, position, menuRef, multiSelectable, parentId,
}: UseContextMenuFixedStyleOptions) => {
    const state = reactive({
        useFixedMenuStyle: useFixedMenuStyle ?? false,
        multiSelectable: multiSelectable ?? false,
        visibleMenu,
    });

    const contextMenuFixedStyleState = reactive({
        targetRef: targetRef ?? null,
        targetElement: computed<Element|null>(() => (contextMenuFixedStyleState.targetRef as Vue)?.$el ?? contextMenuFixedStyleState.targetRef),
        menuRef: menuRef ?? null,
        menuElement: computed<Element|null>(() => (contextMenuFixedStyleState.menuRef as Vue)?.$el ?? contextMenuFixedStyleState.menuRef),
        menuTitleElement: computed<Element|null>(() => contextMenuFixedStyleState.menuElement?.getElementsByClassName('context-menu-title-wrapper')[0] ?? null),
        contextMenuStyle: {} as Partial<CSSStyleDeclaration>,
        parentId: parentId ?? undefined,
    });

    const hideMenu = throttle(() => {
        if (state.visibleMenu) state.visibleMenu = false;
    }, 300);

    const setStyleOfContextMenu = (targetElement: Element, menuElement?:Element) => {
        const targetRects: DOMRect = targetElement.getBoundingClientRect();
        const menuTitleRects: DOMRect|undefined = menuElement?.getBoundingClientRect();

        let menuHeaderHeight = 0;
        if (menuTitleRects) {
            menuHeaderHeight = menuTitleRects.height;
        }
        const contextMenuStyle: Partial<CSSStyleDeclaration> = {
            // overflowY: 'auto',
            position: 'absolute',
            height: 'auto',
            minHeight: '32px',
        };

        if (state.useFixedMenuStyle) {
            contextMenuStyle.position = 'fixed';
            contextMenuStyle.width = 'auto';
            contextMenuStyle.minWidth = `${targetRects.width}px`;
            contextMenuStyle.maxWidth = '100%';
        }

        if (window.innerHeight * 0.9 > targetRects.bottom + menuHeaderHeight) {
            const height = window.innerHeight - targetRects.bottom - 12;
            contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
            if (state.useFixedMenuStyle) contextMenuStyle.top = `${targetRects.bottom}px`;
            else contextMenuStyle.top = `${targetRects.height}px`;
        } else {
            const height = targetRects.top - 12;
            contextMenuStyle.maxHeight = `${height < 0 ? 0 : height}px`;
            if (state.useFixedMenuStyle) contextMenuStyle.bottom = `calc(100vh - ${targetRects.top}px)`;
            else contextMenuStyle.bottom = `${targetRects.height}px`;
        }

        if (state.useFixedMenuStyle) {
            if (position === 'left') contextMenuStyle.left = `${targetRects.left}px`;
            else if (position === 'right') contextMenuStyle.right = `${window.innerWidth - targetRects.right}px`;
        }

        contextMenuFixedStyleState.contextMenuStyle = contextMenuStyle;
    };

    watch([() => state.visibleMenu, () => contextMenuFixedStyleState.targetElement, () => contextMenuFixedStyleState.menuElement], async ([_visibleMenu, targetElement, menuElement]) => {
        if (!_visibleMenu || !targetElement) {
            contextMenuFixedStyleState.contextMenuStyle = {};
            return;
        }
        if (_visibleMenu && targetElement) {
            await nextTick(); // Needed codes for timing issues between painting DOM and visibleMenu
            setStyleOfContextMenu(targetElement, menuElement);
        }
    }, { immediate: true });

    const handleWindowResize = () => {
        if (state.useFixedMenuStyle) hideMenu();
    };
    onMounted(() => {
        window.addEventListener('resize', handleWindowResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleWindowResize);
    });

    const targetObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        entries.forEach((entry) => {
            setStyleOfContextMenu(entry.target);
        });
    });
    const menuObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            setStyleOfContextMenu(contextMenuFixedStyleState.targetElement, entry.target);
        });
    });

    onMounted(() => {
        targetObserver.observe(contextMenuFixedStyleState.targetElement);
        if (contextMenuFixedStyleState.menuTitleElement) menuObserver.observe(contextMenuFixedStyleState.menuTitleElement);
    });

    const prevX = ref(0);
    const prevY = ref(0);
    const parentElement = ref<HTMLElement|null>(null);

    const observeElementChanges = () => {
        if (!state.useFixedMenuStyle) return;

        if (!contextMenuFixedStyleState.targetElement) return;

        const { x, y, height } = contextMenuFixedStyleState.targetElement.getBoundingClientRect();

        if (x !== prevX.value || y !== prevY.value) {
            if (!state.multiSelectable) {
                hideMenu();
            } else {
                if (!contextMenuFixedStyleState.menuElement) return;
                contextMenuFixedStyleState.menuElement.style.top = `${y + height}px`;
                contextMenuFixedStyleState.menuElement.style.left = `${x}px`;
                if (parentElement.value) {
                    const { y: parentY, bottom } = parentElement.value.getBoundingClientRect();
                    /*
                        To address the issue of the menu persistently showing when there is an upper layer of the select-dropdown,
                        this code is written to close the menu when the select-dropdown is hidden behind an upper layer.
                    */
                    if ((parentY > y) || (bottom - height < y)) {
                        hideMenu();
                    }
                }
            }
        }

        prevX.value = x;
        prevY.value = y;

        requestAnimationFrame(observeElementChanges);
    };

    onMounted(() => {
        observeElementChanges();
    });
    onMounted(() => {
        if (!contextMenuFixedStyleState.parentId) return;
        parentElement.value = document.getElementById(contextMenuFixedStyleState.parentId);
    });

    return {
        ...toRefs(contextMenuFixedStyleState),
    };
};
