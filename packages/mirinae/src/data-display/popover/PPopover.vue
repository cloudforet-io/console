<template>
    <component :is="tag"
               ref="popoverRef"
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
                               class="close-icon"
                               @click="handleClickCloseIcon"
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
import { onClickOutside } from '@vueuse/core';
import {
    onMounted, onUnmounted, reactive, ref, useAttrs, watch, computed,
} from 'vue';

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

const props = withDefaults(defineProps<PopoverProps>(), {
    isVisible: false,
    tag: 'span',
    position: POPOVER_PLACEMENT.BOTTOM_END,
    trigger: POPOVER_TRIGGER.CLICK,
    ignoreTargetClick: false,
    ignoreOutsideClick: false,
});

const emit = defineEmits<{(e: 'update:is-visible', value: boolean): void}>();
const attrs = useAttrs();

const listeners = {
    ...attrs,
};

let popperObject: Instance|undefined;
const popoverRef = ref<HTMLElement|null>(null);
const contentRef = ref<HTMLElement|null>(null);
const targetRef = ref<HTMLElement|null>(null);

const state = reactive({
    proxyIsVisible: false,
    popperOptions: computed(() => ({
        placement: props.position,
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, 21],
                },
            },
        ],
    })),
});
const updateIsVisible = (visible: boolean, emitEvent = true) => {
    state.proxyIsVisible = visible;
    if (emitEvent) emit('update:is-visible', visible);
};
const hidePopover = (emitEvent = true) => {
    contentRef.value?.removeAttribute('data-show');
    popperObject?.setOptions({ placement: props.position });
    popperObject?.update();
    updateIsVisible(false, emitEvent);
};
const showPopover = (emitEvent = true) => {
    contentRef.value?.setAttribute('data-show', '');
    popperObject?.setOptions({ placement: props.position });
    popperObject?.update();
    updateIsVisible(true, emitEvent);
};
const handleClickTargetRef = (e) => {
    if (props.ignoreTargetClick) e.stopPropagation();
    const value = !state.proxyIsVisible;
    if (value) showPopover();
    else hidePopover();
};
const handleClickCloseIcon = () => {
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

const bindEventToTargetRef = (eventType, handler, useCapture = false) => targetRef.value?.addEventListener(eventType, handler, useCapture);
const addEvent = () => {
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

onMounted(() => {
    if (targetRef.value && contentRef.value) {
        popperObject = createPopper(targetRef.value, contentRef.value, state.popperOptions);
        addEvent();

        watch(() => props.isVisible, (value) => {
            if (state.proxyIsVisible === value) return;
            state.proxyIsVisible = value;
            if (value) showPopover(false);
            else hidePopover(false);
        }, { immediate: true });
    }
});

onUnmounted(() => popperObject?.destroy());

onClickOutside(popoverRef, handleClickOutside);

</script>

<style lang="postcss">
.p-popover {
    > .popper {
        @apply bg-white border rounded-md border-gray-300 py-3 pl-4 pr-2;
        display: none;
        filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 8%));
        z-index: 99;

        &[data-show] {
            display: block;
        }
        > .popper-content-wrapper {
            @apply flex w-full;

            .close-icon {
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
