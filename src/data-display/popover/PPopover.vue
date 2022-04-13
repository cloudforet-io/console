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
        <div ref="contentRef" class="popper" :class="{ 'visible': isVisible }">
            <div class="popper-content-wrapper">
                <slot name="content" />
                <p-icon-button name="ic_delete" color="inherit" size="sm"
                               class="delete-icon" @click="handleClickDeleteIcon"
                />
            </div>
            <div class="arrow" data-popper-arrow />
        </div>
    </component>
</template>

<script lang="ts">
import {
    onMounted, onUnmounted, reactive, toRefs,
} from '@vue/composition-api';
import { createPopper, Instance } from '@popperjs/core';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';
import vClickOutside from 'v-click-outside';
import { PropType } from 'vue';

interface PopoverProps {
    tag: string;
    position: POPOVER_PLACEMENT;
    isVisible: boolean;
    trigger: POPOVER_TRIGGER;
    ignoreTargetClick: boolean;
}

export default {
    name: 'PPopover',
    components: {
        PIconButton,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        tag: {
            type: String,
            default: 'span',
        },
        position: {
            type: String as PropType<POPOVER_PLACEMENT>,
            validator(value) {
                if (value === undefined) return POPOVER_PLACEMENT.BOTTOM_END;
                return Object.values(POPOVER_PLACEMENT).includes(value);
            },
            default: POPOVER_PLACEMENT.BOTTOM_END,
        },
        trigger: {
            type: String as PropType<POPOVER_TRIGGER>,
            validator(value) {
                if (value === undefined) return POPOVER_TRIGGER.CLICK;
                return Object.values(POPOVER_TRIGGER).includes(value);
            },
            default: POPOVER_TRIGGER.CLICK,
        },
        ignoreTargetClick: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: PopoverProps) {
        const state = reactive({
            isVisible: false,
            contentRef: null as null|HTMLElement,
            targetRef: null as null|HTMLElement,
            popperObject: {} as Instance,
        });
        const hidePopover = () => {
            state.isVisible = false;
            return state.contentRef?.removeAttribute('data-show');
        };
        const showPopover = () => {
            // eslint-disable-next-line no-unused-expressions
            state.contentRef?.setAttribute('data-show', '');
            state.popperObject.update();
            return state.popperObject?.setOptions({ placement: props.position });
        };
        const handleClickTargetRef = (e) => {
            state.isVisible = !state.isVisible;
            if (props.ignoreTargetClick) e.stopPropagation();
            return state.popperObject?.setOptions({ placement: props.position });
        };
        const handleClickDeleteIcon = () => {
            hidePopover();
        };
        const handleClickOutside = () => {
            hidePopover();
        };
        const bindEventToTargetRef = (eventType: keyof HTMLElementEventMap, handler, useCature = false) => state.targetRef?.addEventListener(eventType, handler, useCature);
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

        onMounted(() => {
            if (state.targetRef && state.contentRef) {
                const popperObject = createPopper(state.targetRef, state.contentRef, {
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
                if (popperObject) state.popperObject = popperObject;
                addEvent();
            }
        });

        onUnmounted(() => state.popperObject?.destroy());
        return {
            ...toRefs(state),
            handleClickTargetRef,
            handleClickOutside,
            handleClickDeleteIcon,
        };
    },
};

</script>

<style lang="postcss" scoped>
.p-popover {
    .popper {
        @apply bg-white border rounded-md border-gray-300 py-3 pl-4 pr-2;
        display: none;
        filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.08));
        z-index: 99;

        &[data-show] {
            display: block;
        }
        .popper-content-wrapper {
            @apply flex w-full;

            .delete-icon {
                margin: 0.5rem;
            }
        }

        .arrow,
        .arrow::before {
            @apply border-gray-300 border;
            position: absolute;
            width: 1rem;
            height: 1rem;
            background: inherit;
        }

        .arrow {
            visibility: hidden;
        }

        .arrow::before {
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
        .popper {
            max-width: 17rem;
        }
    }
}
</style>
