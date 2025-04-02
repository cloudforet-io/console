import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type Vue from 'vue';

import {
    computePosition, autoUpdate, offset, flip, size, hide, shift,
} from '@floating-ui/dom';
import { throttle } from 'lodash';

// HACK: This is the type definition of the context menu. Only defined exposed methods. This is to prevent type error due to vue2-vue3 incompatibility.
export interface ISimpleContextMenu {
    focus: (position?: number) => void;
}
export interface UseContextMenuStyleOptions {
    /*
    Useful when used inside an element whose css position attribute value is fixed.
    It automatically check targetRef's position and adjust the context menu's position.
     */
    useFixedMenuStyle?: Ref<boolean|undefined> | boolean;

    visibleMenu?: Ref<boolean|undefined>;
    targetRef: Ref<Vue|HTMLElement|null>;
    menuRef: Ref<ISimpleContextMenu|HTMLElement|null>;

     /* Required for context menu style */
    position?: Ref<'left'|'right'|undefined>|'left'|'right';
    menuWidth?: Ref<'target-width'|string|undefined>|'target-width'|string|undefined; // default is 'auto'.
    boundary?: Ref<string|undefined>|string; // it's not developed yet. if you want to use it, you can develop it with detectOverflow middleware.
}

interface UseContextMenuStyleReturns {
    targetRef: Ref<Vue|HTMLElement|null>;
    targetElement: ComputedRef<Element|null>;
    menuRef: Ref<Vue|HTMLElement|null>;
    menuElement: ComputedRef<Element|null>;
    contextMenuStyle: Ref<Partial<CSSStyleDeclaration>>;
}

export const useContextMenuStyle = ({
    useFixedMenuStyle, visibleMenu, targetRef, menuRef, position, boundary, menuWidth,
}: UseContextMenuStyleOptions): UseContextMenuStyleReturns => {
    if (!targetRef) throw new Error('\'targetRef\' option must be given.');
    if (!menuRef) throw new Error('\'menuRef\' option must be given.');

    const state = reactive({
        useFixedMenuStyle: useFixedMenuStyle ?? false,
        visibleMenu: visibleMenu ?? false,
        position: position ?? 'left',
        menuWidth,
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
                                minWidth: (state.menuWidth === 'target-width' || state.menuWidth === 'auto' || !state.menuWidth) ? `${rects.reference.width}px` : state.menuWidth,
                                width: state.menuWidth === 'target-width' ? `${rects.reference.width}px` : state.menuWidth,
                                maxWidth: state.menuWidth === 'target-width' ? `${rects.reference.width}px` : state.menuWidth,
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
            if (cleanup) cleanup();
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
        } else if (cleanup) {
            cleanup();
            cleanup = undefined;
        }
    }, { immediate: true });

    onUnmounted(() => {
        if (cleanup) {
            cleanup();
            cleanup = undefined;
        }
    });

    return {
        ...toRefs(contextMenuFixedStyleState),
    } as unknown as UseContextMenuStyleReturns;
};
