<template>
    <component :is="tag"
               v-click-outside="handleClickOutside"
               class="p-popover"
               v-on="listeners"
    >
        <span ref="targetRef"
              class="target-ref"
        >
            <slot />
        </span>
        <div ref="contentRef"
             class="popper"
             :class="{ 'visible': state.proxyIsVisible }"
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

<script setup lang="ts">

import type { Instance } from '@popperjs/core';
import { createPopper } from '@popperjs/core';
import vClickOutside from 'v-click-outside';
import {
    onMounted, onUnmounted, reactive, useAttrs,
} from 'vue';
import type { PropType } from 'vue';

import type { PopoverPlacement, PopoverTrigger } from '@/data-display/popover/type';
import { POPOVER_PLACEMENT, POPOVER_TRIGGER } from '@/data-display/popover/type';
import { useProxyValue } from '@/hooks';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

const props = defineProps({
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
        default: false,
    },
});

const emit = defineEmits(['update:isVisible']);
const attrs = useAttrs();

const listeners = {
    ...attrs,
};

const state = reactive({
    proxyIsVisible: useProxyValue('isVisible', props, emit),
    contentRef: null as null|HTMLElement,
    targetRef: null as null|HTMLElement,
    popperObject: {} as Instance,
});
const hidePopover = () => {
    state.proxyIsVisible = false;
    return state.contentRef?.removeAttribute('data-show');
};
const showPopover = () => {
    // eslint-disable-next-line no-unused-expressions
    state.contentRef?.setAttribute('data-show', '');
    state.popperObject.update();
    return state.popperObject?.setOptions({ placement: props.position });
};
const handleClickTargetRef = (e) => {
    state.proxyIsVisible = !state.proxyIsVisible;
    if (props.ignoreTargetClick) e.stopPropagation();
    return state.popperObject?.setOptions({ placement: props.position });
};
const handleClickDeleteIcon = () => {
    hidePopover();
};
const handleClickOutside = () => {
    hidePopover();
};


// eslint-disable-next-line no-undef
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
