<template>
    <component :is="tag"
               v-click-outside="handleClickOutside"
               class="p-popover"
               v-on="$listeners"
    >
        <span ref="targetRef"
              class="target-ref"
        >
            <slot />
        </span>
        <div ref="contentRef"
             class="popper"
             :class="{ 'visible': proxyIsVisible }"
        >
            <div class="popper-content-wrapper">
                <slot name="content" />
                <p-icon-button name="ic_close"
                               color="inherit"
                               size="sm"
                               class="delete-icon"
                               @click="handleClickDeleteIcon"
                />
            </div>
            <div class="arrow"
                 data-popper-arrow
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

import type { Instance } from '@popperjs/core';
import { createPopper } from '@popperjs/core';
import vClickOutside from 'v-click-outside';

import type { PopoverPlacement, PopoverTrigger } from '@/data-display/popover/type';
import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

interface PopoverProps {
    isVisible: boolean;
    tag: string;
    position?: PopoverPlacement;
    trigger?: PopoverTrigger;
    ignoreTargetClick?: boolean;
    ignoreOutsideClick?: boolean;
}

export default defineComponent<PopoverProps>({
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
            default: false,
        },
        tag: {
            type: String,
            default: 'span',
        },
        position: {
            type: String as PropType<PopoverPlacement>,
            validator(value?: PopoverPlacement) {
                if (value === undefined) return true;
                return Object.values(POPOVER_PLACEMENT).includes(value);
            },
            default: POPOVER_PLACEMENT.BOTTOM_END,
        },
        trigger: {
            type: String as PropType<PopoverTrigger>,
            validator(value?: PopoverTrigger) {
                if (value === undefined) return true;
                return Object.values(POPOVER_TRIGGER).includes(value);
            },
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
    },
    setup(props, { emit }) {
        let popperObject: Instance|undefined;
        const state = reactive({
            proxyIsVisible: props.isVisible,
            contentRef: null as null|HTMLElement,
            targetRef: null as null|HTMLElement,
        });
        const updateIsVisible = (visible: boolean) => {
            state.proxyIsVisible = visible;
            emit('update:is-visible', visible);
        };
        const hidePopover = () => {
            updateIsVisible(false);
            return state.contentRef?.removeAttribute('data-show');
        };
        const showPopover = () => {
            state.contentRef?.setAttribute('data-show', '');
            popperObject?.update();
            return popperObject?.setOptions({ placement: props.position });
        };
        const handleClickTargetRef = (e) => {
            updateIsVisible(!state.proxyIsVisible);
            if (props.ignoreTargetClick) e.stopPropagation();
            return popperObject?.setOptions({ placement: props.position });
        };
        const handleClickDeleteIcon = () => {
            hidePopover();
        };
        const handleClickOutside = () => {
            if (!props.ignoreOutsideClick) hidePopover();
        };
        const bindEventToTargetRef = (eventType, handler, useCature = false) => state.targetRef?.addEventListener(eventType, handler, useCature);
        const addEvent = () => {
            if (props.trigger === POPOVER_TRIGGER.CLICK) {
                bindEventToTargetRef('click', handleClickTargetRef, true);
            } else if (props.trigger === POPOVER_TRIGGER.HOVER) {
                bindEventToTargetRef('mouseenter', showPopover);
                bindEventToTargetRef('mouseleave', hidePopover);
            } else if (props.trigger === POPOVER_TRIGGER.FOCUS) {
                bindEventToTargetRef('focus', showPopover, true);
                bindEventToTargetRef('blur', hidePopover, true);
            }
        };
        const triggerTargetEvent = (target: HTMLElement, visible: boolean) => {
            if (props.trigger === POPOVER_TRIGGER.CLICK && !props.ignoreTargetClick) {
                target.click();
            } else if (props.trigger === POPOVER_TRIGGER.HOVER) {
                if (visible) target.dispatchEvent(new Event('mouseenter'));
                else target.dispatchEvent(new Event('mouseleave'));
            } else if (props.trigger === POPOVER_TRIGGER.FOCUS) {
                if (visible) target.focus();
                else target.blur();
            }
        };

        onMounted(() => {
            if (state.targetRef && state.contentRef) {
                popperObject = createPopper(state.targetRef, state.contentRef, {
                    placement: props.position,
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 21],
                            },
                        },
                    ],
                });
                addEvent();
            }
        });

        onUnmounted(() => popperObject?.destroy());

        watch(() => props.isVisible, (value) => {
            if (state.proxyIsVisible === value) return;
            if (state.targetRef) {
                // NOTE: If the state is changed without triggering event, the popper position will be wrong.
                triggerTargetEvent(state.targetRef, value);
                return;
            }
            updateIsVisible(value);
        }, { immediate: true });

        return {
            ...toRefs(state),
            handleClickTargetRef,
            handleClickOutside,
            handleClickDeleteIcon,
        };
    },
});

</script>

<style lang="postcss">
.p-popover {
    > .popper {
        @apply bg-white border rounded-md border-gray-300 py-3 pl-4 pr-2;
        display: none;
        filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.08));
        z-index: 99;

        &[data-show] {
            display: block;
        }
        > .popper-content-wrapper {
            @apply flex w-full;

            .delete-icon {
                margin: 0.5rem;
            }
        }

        > .arrow,
        > .arrow::before {
            @apply border-gray-300 border;
            position: absolute;
            width: 1rem;
            height: 1rem;
            background: inherit;
        }

        > .arrow {
            visibility: hidden;
        }

        > .arrow::before {
            visibility: visible;
            content: '';
            transform: rotate(45deg);
        }

        &[data-popper-placement^='top'] > .arrow {
            bottom: -0.55rem;

            &::before {
                border-top: none;
                border-left: none;
            }
        }

        &[data-popper-placement^='bottom'] > .arrow {
            top: -0.55rem;

            &::before {
                border-bottom: none;
                border-right: none;
            }
        }

        &[data-popper-placement^='left'] > .arrow {
            right: -0.55rem;

            &::before {
                border-bottom: none;
                border-left: none;
            }
        }

        &[data-popper-placement^='right'] > .arrow {
            left: -0.55rem;

            &::before {
                border-top: none;
                border-right: none;
            }
        }

        &.visible {
            display: unset;
        }
    }

    @screen mobile {
        > .popper {
            max-width: 17rem;
        }
    }
}
</style>
