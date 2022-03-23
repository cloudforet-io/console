<template>
    <component :is="tag"
               ref="popperRef"
               v-click-outside="handleClickOutside"
               class="p-popover"
               v-on="$listeners"
    >
        <div class="targetRef" @click="handleClickTargetRef">
            <slot />
        </div>
        <div ref="contentRef" class="popper" :class="{ 'visible': proxyIsVisible }">
            <div class="popper-content-wrapper">
                <slot name="content" />
                <p-icon-button name="ic_delete" color="inherit"
                               class="delete-icon" @click="handleClickDeleteIcon"
                />
            </div>
            <div class="arrow" data-popper-arrow />
        </div>
    </component>
</template>

<script lang="ts">
import { onMounted, reactive, toRefs } from '@vue/composition-api';
import { createPopper, Instance } from '@popperjs/core';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { POPOVER_PLACEMENT } from '@/data-display/popover/type';
import vClickOutside from 'v-click-outside';
import { PropType } from 'vue';
import { useProxyValue } from '@/hooks/proxy-state';

interface PopoverProps {
    tag: string;
    position: POPOVER_PLACEMENT;
    isVisible: boolean;
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
        isVisible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: PopoverProps, { emit }) {
        const state = reactive({
            proxyIsVisible: useProxyValue('isVisible', props, emit),
            contentRef: null as null|HTMLElement,
            popperRef: null as null|HTMLElement,
            popperObject: {} as Instance,
        });
        const hidePopover = () => {
            state.proxyIsVisible = false;
        };
        const handleClickTargetRef = () => {
            state.proxyIsVisible = !state.proxyIsVisible;
            return state.popperObject?.setOptions({ placement: props.position });
        };
        const handleClickDeleteIcon = () => {
            hidePopover();
        };
        const handleClickOutside = () => {
            hidePopover();
        };
        onMounted(() => {
            if (state.popperRef && state.contentRef) {
                const popperObject = createPopper(state.popperRef, state.contentRef, {
                    placement: props.position,
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 15],
                            },
                        },
                    ],
                });
                if (popperObject) state.popperObject = popperObject;
            }
        });

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
}
</style>
