<template>
    <component :is="tag"
               v-click-outside="handleClickOutside"
               class="p-popover"
               :style="{
                   position: boundary ? 'static' : 'relative',
               }"
               v-on="$listeners"
    >
        <span ref="targetRef"
              class="target"
        >
            <slot />
        </span>
        <div ref="contentRef"
             class="floating"
             :class="{ 'visible': proxyIsVisible, 'hide-padding': hidePadding }"
             :style="width ? { width } : {}"
        >
            <div class="floating-content-wrapper">
                <slot name="content" />
                <p-icon-button v-if="!hideCloseButton"
                               name="ic_close"
                               color="inherit"
                               size="sm"
                               class="close-icon"
                               @click.stop="handleClickCloseIcon"
                />
            </div>
            <div v-if="!hideArrow"
                 ref="arrowRef"
                 class="arrow"
            />
        </div>
    </component>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    defineComponent,
    onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import {
    computePosition, autoUpdate, offset, flip, shift, limitShift, arrow, size, detectOverflow,
} from '@floating-ui/dom';
import vClickOutside from 'v-click-outside';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';
import type { PopoverPlacement, PopoverTrigger } from '@/data-display/popover/type';
import { POPOVER_TRIGGER } from '@/data-display/popover/type';

const ARROW_STATIC_SIDES = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
};

export default defineComponent({
    name: 'PPopover',
    components: {
        PIconButton,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    model: {
        prop: 'isVisible',
        event: 'update:isVisible',
    },
    props: {
        isVisible: {
            type: Boolean,
            default: undefined,
        },
        tag: {
            type: String,
            default: 'span',
        },
        position: {
            type: String as PropType<PopoverPlacement>,
            default: undefined,
        },
        trigger: {
            type: String as PropType<PopoverTrigger>,
            default: POPOVER_TRIGGER.CLICK,
        },
        ignoreTargetClick: {
            type: Boolean,
            default: true,
        },
        ignoreOutsideClick: {
            type: Boolean,
            default: false,
        },
        hidePadding: {
            type: Boolean,
            default: false,
        },
        hideCloseButton: {
            type: Boolean,
            default: false,
        },
        hideArrow: {
            type: Boolean,
            default: false,
        },
        boundary: {
            type: String,
            default: '',
        },
        width: {
            type: String,
            default: '',
        },
        minWidth: {
            type: String,
            default: '',
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyIsVisible: false,
            contentRef: null as null|HTMLElement,
            targetRef: null as null|HTMLElement,
            arrowRef: null as null|HTMLElement,
        });
        let cleanup: (() => void)|undefined;
        const updateIsVisible = (visible: boolean, emitEvent = true) => {
            state.proxyIsVisible = visible;
            if (emitEvent) emit('update:is-visible', visible);
        };
        const hidePopover = (emitEvent = true) => {
            state.contentRef?.removeAttribute('data-show');
            updateIsVisible(false, emitEvent);
        };
        const showPopover = (emitEvent = true) => {
            state.contentRef?.setAttribute('data-show', '');
            updateIsVisible(true, emitEvent);
        };
        const handleClickTargetRef = (e) => {
            if (props.ignoreTargetClick) e.stopPropagation();
            const value = !state.proxyIsVisible;
            if (value) showPopover();
            else hidePopover();
        };
        const handleClickCloseIcon = () => {
            emit('close');
            hidePopover();
        };
        const handleClickOutside = () => {
            if (!props.ignoreOutsideClick) {
                hidePopover();
            }
        };
        const handleTargetShowEvent = () => {
            showPopover();
        };
        const handleTargetHideEvent = () => {
            hidePopover();
        };
        const bindEventToTargetRef = (eventType, handler, useCapture = false) => state.targetRef?.addEventListener(eventType, handler, useCapture);
        const addEventByTrigger = () => {
            if (props.trigger === POPOVER_TRIGGER.CLICK) {
                bindEventToTargetRef('click', handleClickTargetRef, true);
            } else if (props.trigger === POPOVER_TRIGGER.HOVER) {
                bindEventToTargetRef('mouseenter', handleTargetShowEvent);
                bindEventToTargetRef('mouseleave', handleTargetHideEvent);
            } else if (props.trigger === POPOVER_TRIGGER.FOCUS) {
                bindEventToTargetRef('focus', handleTargetShowEvent, true);
                bindEventToTargetRef('blur', handleTargetHideEvent, true);
            }
        };
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                hidePopover();
            }
        };

        onMounted(() => {
            if (state.targetRef && state.contentRef) {
                const referenceEl = state.targetRef;
                const floatingEl = state.contentRef;
                const arrowEl = state.arrowRef;
                cleanup = autoUpdate(referenceEl, floatingEl, () => {
                    computePosition(referenceEl, floatingEl, {
                        placement: props.position,
                        middleware: [
                            offset(props.hideArrow ? 1 : 11),
                            size({
                                apply({ rects, elements }) {
                                    Object.assign(elements.floating.style, {
                                        minWidth: props.minWidth ? props.minWidth : `${rects.reference.width}px`,
                                    });
                                },
                            }),
                            props.boundary ? {
                                name: 'overflow',
                                async fn(_state) {
                                    const boundaryEl = floatingEl.closest(props.boundary as string);
                                    if (boundaryEl) {
                                        await detectOverflow(_state, {
                                            boundary: boundaryEl,
                                        });
                                    }

                                    return {};
                                },
                            } : undefined,
                            flip(),
                            shift({ limiter: limitShift() }),
                            (arrowEl ? arrow({ element: arrowEl }) : undefined),
                        ],
                    }).then(({
                        placement, x, y, middlewareData,
                    }) => {
                        const style: Partial<CSSStyleDeclaration> = {
                            left: `${x}px`,
                            top: `${y}px`,
                        };
                        Object.assign(floatingEl.style, style);
                        const side = placement.split('-')[0]; //  bottom-end -> bottom

                        const staticSide = ARROW_STATIC_SIDES[side] ?? '';

                        if (arrowEl && middlewareData.arrow) {
                            const arrowState = middlewareData.arrow;
                            Object.assign(arrowEl.style, {
                                left: arrowState.x != null ? `${arrowState.x}px` : '',
                                top: arrowState.y != null ? `${arrowState.y}px` : '',
                                [staticSide]: `${-arrowEl.offsetWidth / 2}px`,
                            });
                            arrowEl.setAttribute('arrow-side', staticSide);
                        }
                        floatingEl.setAttribute('floating-placement', placement);

                        addEventByTrigger();
                        document.addEventListener('keydown', handleEscKey);
                    });

                    watch(() => props.isVisible, (value) => {
                        if (value === undefined || state.proxyIsVisible === value) return;
                        state.proxyIsVisible = value;
                        if (value) showPopover(false);
                        else hidePopover(false);
                    }, { immediate: true });
                });
            }
        });

        onUnmounted(() => {
            if (cleanup) cleanup();
            document.removeEventListener('keydown', handleEscKey);
        });

        return {
            ...toRefs(state),
            handleClickTargetRef,
            handleClickOutside,
            handleClickCloseIcon,
        };
    },
});

</script>

<style lang="postcss">
.p-popover {
    > .target {
        @apply inline-flex;
    }
    > .floating {
        @apply bg-white border rounded-md border-gray-300;
        width: max-content;
        position: absolute;
        top: 0;
        left: 0;
        display: none;
        filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.08));
        z-index: 99;
        padding: 1rem;

        &.visible {
            display: unset;
        }
        &[data-show] {
            display: block;
        }
        &.hide-padding {
            padding: 0;
        }
        > .floating-content-wrapper {
            @apply flex w-full;
            .close-icon {
                position: absolute;
                right: 0.25rem;
                top: 0.25rem;
                z-index: 100;
            }
        }

        > .arrow {
            @apply border-gray-300 border;
            position: absolute;
            width: 1rem;
            height: 1rem;
            background: inherit;
            transform: rotate(45deg);
            &[arrow-side='top'] {
                border-bottom: none;
                border-right: none;
            }
            &[arrow-side='right'] {
                border-bottom: none;
                border-left: none;
            }
            &[arrow-side='bottom'] {
                border-top: none;
                border-left: none;
            }
            &[arrow-side='left'] {
                border-top: none;
                border-right: none;
            }
        }
    }

    @screen mobile {
        > .floating {
            max-width: 17rem;
        }
    }
}
</style>
