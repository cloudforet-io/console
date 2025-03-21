<template>
    <span class="p-copy-button"
          :class="size"
    >
        <span v-if="$scopedSlots.default"
              ref="textRef"
              class="copy-text"
        >
            <slot name="default" />
        </span>
        <p-i v-if="showIcon"
             ref="iconRef"
             class="copy-icon"
             :class="{active: click}"
             width="1em"
             height="1em"
             :name="click ? 'ic_copy-filled' : 'ic_copy'"
             color="inherit"
             v-on="$listeners"
             @mousedown.native="click = true"
             @mouseup.native="copyText()"
        />
        <transition name="fade">
            <div v-if="isAlertVisible"
                 ref="alertRef"
                 class="copy-button-alert"
                 :style="alertStyle"
            >
                <p-i name="ic_check"
                     color="white"
                     width="1rem"
                     height="1rem"
                />
                <span>{{ $t('COMPONENT.COPY_BUTTON.COPIED') }}</span>
            </div>
        </transition>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { PropType } from 'vue';

import { useWindowSize } from '@vueuse/core';

import type { Size } from '@/controls/buttons/copy-button/type';
import { SIZE } from '@/controls/buttons/copy-button/type';
import PI from '@/foundation/icons/PI.vue';
import { copyAnyData, isNotEmpty } from '@/utils/helpers';

const ALERT_PAD = 8;

export default defineComponent({
    name: 'PCopyButton',
    components: { PI },
    props: {
        value: {
            type: String,
            default: null,
        },
        size: {
            type: String as PropType<Size>,
            default: SIZE.md,
        },
        autoHideIcon: {
            type: Boolean,
            default: false,
        },
        copyManually: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const { width } = useWindowSize();
        const state = reactive({
            click: false,
            isAlertVisible: false,
            iconRef: null as any|null,
            alertRef: null as Element|null,
            textRef: null as Element|null,
            alertStyle: computed(() => {
                if (!state.iconRef?.$el || !state.alertRef) return {};

                const iconRect: DOMRect = state.iconRef.$el.getBoundingClientRect();
                const alertHeight = state.alertRef.clientHeight;
                const alertWidth = state.alertRef.clientWidth;

                const left = iconRect.right + ALERT_PAD;
                if (left + alertWidth > width.value) {
                    return {
                        right: `${ALERT_PAD}px`,
                        top: `${iconRect.top - alertHeight - ALERT_PAD}px`,
                    };
                }
                return {
                    left: `${left}px`,
                    top: `${iconRect.top - ((alertHeight - iconRect.height) / 2)}px`,
                };
            }),
            hasText: false,
            showIcon: computed(() => {
                if (!props.autoHideIcon) return true;
                return state.hasText;
            }),
            textObserver: null as null|MutationObserver,
        });

        const copyText = () => {
            state.isAlertVisible = true;
            setTimeout(() => { state.isAlertVisible = false; }, 500);

            if (!state.click) return;

            if (props.copyManually) {
                emit('copy');
                state.click = false;
                return;
            }

            if (isNotEmpty(props.value)) {
                copyAnyData(props.value);
                emit('copied');
            } else if (state.textRef?.textContent) {
                copyAnyData(state.textRef.textContent);
                emit('copied');
            }

            state.click = false;
        };

        watch(() => state.textRef, (textRef) => {
            if (!textRef) {
                if (state.textObserver) state.textObserver.disconnect();
                return;
            }

            const observer = new MutationObserver(() => {
                state.hasText = textRef.textContent?.trim();
            });

            observer.observe(textRef, {
                childList: true,
                subtree: true,
                characterData: true,
            });

            state.textObserver = observer;

            state.hasText = !!textRef.textContent?.trim();
        }, { immediate: true });


        onUnmounted(() => {
            if (state.textObserver) state.textObserver.disconnect();
        });


        return {
            ...toRefs(state),
            copyText,
        };
    },
});
</script>

<style lang="postcss">

.p-copy-button {
    @apply text-gray-900;
    display: inline-block;
    vertical-align: middle;

    .copy-text {
        margin-right: 0.25rem;
        cursor: text;
        line-height: 1.25;
    }

    .copy-icon {
        @apply text-gray-500;
        &.active {
            @apply text-secondary;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-secondary;
                cursor: pointer;
            }
        }
    }

    .copy-button-alert {
        @apply inline-flex text-white rounded-xs;
        position: fixed;
        z-index: 9999;
        background-color: rgba(theme('colors.gray.900'), 0.88);
        font-weight: 400;
        font-size: 0.75rem;
        line-height: 1.3;
        width: auto;
        padding: 0.25rem 0.5rem;
        justify-content: center;
        align-items: center;
        &.fade-enter-active, &.fade-leave-active {
            transition: opacity 0.3s;
        }
        &.fade-enter, &.fade-leave-to {
            opacity: 0;
        }
    }

    @define-mixin size $text-size {
        font-size: $text-size;
    }
    &.md {
        @mixin size 0.875rem;
    }
    &.sm {
        @mixin size 0.75rem;
    }
}

</style>
