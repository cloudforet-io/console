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
}

export const useContextMenuFixedStyle = ({
    useFixedMenuStyle, visibleMenu, targetRef, position,
}: UseContextMenuFixedStyleOptions) => {
    const state = reactive({
        useFixedMenuStyle: useFixedMenuStyle ?? false,
        visibleMenu,
    });

    const contextMenuFixedStyleState = reactive({
        targetRef: targetRef ?? null,
        targetElement: computed<Element|null>(() => (contextMenuFixedStyleState.targetRef as Vue)?.$el ?? contextMenuFixedStyleState.targetRef),
        contextMenuStyle: {} as Partial<CSSStyleDeclaration>,
    });

    const hideMenu = throttle(() => {
        if (state.visibleMenu) state.visibleMenu = false;
    }, 300);

    const setStyleOfContextMenu = (targetElement: Element) => {
        const targetRects: DOMRect = targetElement.getBoundingClientRect();

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

        if (window.innerHeight * 0.9 > (targetRects.bottom)) {
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

    watch([() => state.visibleMenu, () => contextMenuFixedStyleState.targetElement], async ([_visibleMenu, targetElement]) => {
        if (!_visibleMenu || !targetElement) {
            contextMenuFixedStyleState.contextMenuStyle = {};
            return;
        }
        if (_visibleMenu && targetElement) {
            await nextTick(); // Needed codes for timing issues between painting DOM and visibleMenu
            setStyleOfContextMenu(targetElement);
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

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        entries.forEach((entry) => {
            setStyleOfContextMenu(entry.target);
        });
    });

    onMounted(() => {
        observer.observe(contextMenuFixedStyleState.targetElement);
    });

    const prevX = ref(0);
    const prevY = ref(0);
    const observeElementChanges = () => {
        if (!state.useFixedMenuStyle) return;

        const { x, y } = contextMenuFixedStyleState.targetElement.getBoundingClientRect();

        if (x !== prevX.value || y !== prevY.value) {
            hideMenu();
        }

        prevX.value = x;
        prevY.value = y;

        requestAnimationFrame(observeElementChanges);
    };

    onMounted(() => {
        observeElementChanges();
    });

    return {
        ...toRefs(contextMenuFixedStyleState),
    };
};
