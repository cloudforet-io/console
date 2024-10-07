import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Ref } from 'vue';
import type Vue from 'vue';

import {
    computePosition, autoUpdate, offset, flip, size, hide, shift,
} from '@floating-ui/dom';
import { throttle } from 'lodash';

interface UseContextMenuFixedStyleOptions {
    useFixedMenuStyle?: Ref<boolean|undefined> | boolean;
    visibleMenu?: Ref<boolean|undefined>;
    targetRef: Ref<Vue|HTMLElement|null>;
    menuRef: Ref<Vue|HTMLElement|null>;
    position?: Ref<'left'|'right'|undefined>|'left'|'right';
    boundary?: Ref<string|undefined>|string; // it's not developed yet. if you want to use it, you can develop it with detectOverflow middleware.
}

export const useContextMenuStyle = ({
    useFixedMenuStyle, visibleMenu, targetRef, menuRef, position, boundary,
}: UseContextMenuFixedStyleOptions) => {
    const state = reactive({
        useFixedMenuStyle: useFixedMenuStyle ?? false,
        visibleMenu,
        position,
        boundary: boundary ?? undefined,
    });

    const contextMenuFixedStyleState = reactive({
        targetRef: targetRef ?? null,
        targetElement: computed<Element|null>(() => (contextMenuFixedStyleState.targetRef as Vue)?.$el ?? contextMenuFixedStyleState.targetRef),
        menuRef: menuRef ?? null,
        menuElement: computed<Element|null>(() => (contextMenuFixedStyleState.menuRef as Vue)?.$el ?? contextMenuFixedStyleState.menuRef),
        contextMenuStyle: {} as Partial<CSSStyleDeclaration>,
    });

    const hideMenu = throttle(() => {
        if (state.visibleMenu) {
            state.visibleMenu = false;
        }
    }, 300);


    let cleanup: (() => void)|undefined;
    const PAD = 12;
    const MIN_HEIGHT = 72;
    const MAX_HEIGHT = 576; // 32rem
    const setStyleOfContextMenu = (referenceEl: HTMLElement, floatingEl: HTMLElement) => {
        const setPosition = (isFixed = false) => {
            computePosition(referenceEl, floatingEl, {
                placement: `bottom-${state.position === 'left' ? 'start' : 'end'}`,
                middleware: [
                    offset(1),
                    size({
                        apply({ rects, elements, availableHeight: floatingAvailableHeight }) {
                            let availableHeight = floatingAvailableHeight - PAD;
                            const style: Partial<CSSStyleDeclaration> = {
                                minWidth: `${rects.reference.width}px`,
                            };

                            if (availableHeight < MAX_HEIGHT) {
                                style.maxHeight = `${availableHeight}px`;
                            } else {
                                style.maxHeight = `${MAX_HEIGHT}px`;
                                availableHeight = MAX_HEIGHT;
                            }

                            // apply min-height if the content is taller than the available space.
                            // this is to prevent the content from being too small and prevent flipping too early.
                            if (availableHeight < MIN_HEIGHT && elements.floating.scrollHeight >= availableHeight) {
                                style.minHeight = `${MIN_HEIGHT}px`;
                            } else {
                                style.minHeight = '';
                            }

                            Object.assign(elements.floating.style, style);
                            // apply the same style to the state
                            contextMenuFixedStyleState.contextMenuStyle = {
                                ...contextMenuFixedStyleState.contextMenuStyle,
                                ...style,
                            };

                            // adjust the max-height of the content area based on the header height
                            const headerEl = elements.floating.querySelector<HTMLElement>('.p-context-menu > .context-menu-title-wrapper');
                            const contentEl = elements.floating.querySelector<HTMLElement>('.p-context-menu > .menu-container');
                            const bottomEl = elements.floating.querySelector<HTMLElement>('.p-context-menu > .bottom-slot-area');
                            if (contentEl && headerEl) { // always exist
                                if (headerEl.clientHeight > 0) {
                                    if (bottomEl && bottomEl.clientHeight > 0) {
                                        contentEl.style.maxHeight = `${availableHeight - headerEl.clientHeight - bottomEl.clientHeight}px`;
                                    } else {
                                        contentEl.style.maxHeight = `${availableHeight - headerEl.clientHeight}px`;
                                    }
                                } else if (bottomEl && bottomEl.clientHeight > 0) {
                                    contentEl.style.maxHeight = `${availableHeight - bottomEl.clientHeight}px`;
                                } else {
                                    contentEl.style.maxHeight = 'inherit';
                                }
                            }
                        },
                    }),
                    flip({
                        flipAlignment: false,
                        fallbackStrategy: 'initialPlacement',
                        crossAxis: false,
                    }),
                    shift(),
                    (isFixed ? hide({ padding: 5 }) : undefined),
                ],
            }).then(({
                x, y, middlewareData, placement,
            }) => {
                const style: Partial<CSSStyleDeclaration> = {
                    left: `${x}px`,
                    top: placement.startsWith('bottom') ? `${y}px` : `${y + 2}px`,
                    position: isFixed ? 'fixed' : 'absolute',
                };
                if (!isFixed && state.position === 'right') {
                    style.left = 'auto';
                    style.right = '0px';
                }
                Object.assign(floatingEl.style, style);
                // apply the same style to the state
                contextMenuFixedStyleState.contextMenuStyle = {
                    ...contextMenuFixedStyleState.contextMenuStyle,
                    ...style,
                };
                floatingEl.setAttribute('floating-placement', placement);
                if (middlewareData.hide?.referenceHidden) hideMenu();
            });
        };
        if (state.useFixedMenuStyle) {
            cleanup = autoUpdate(referenceEl, floatingEl, () => {
                setPosition(true);
            }, { animationFrame: true });
        } else {
            setPosition();
        }
    };

    watch([() => state.visibleMenu, () => contextMenuFixedStyleState.targetElement, () => contextMenuFixedStyleState.menuElement], async ([_visibleMenu, targetElement, menuElement]) => {
        if (_visibleMenu && menuElement && targetElement) {
            setStyleOfContextMenu(targetElement as HTMLElement, menuElement as HTMLElement);
        } else if (cleanup) cleanup();
    }, { immediate: true });

    onUnmounted(() => {
        if (cleanup) cleanup();
    });

    return {
        ...toRefs(contextMenuFixedStyleState),
    };
};
