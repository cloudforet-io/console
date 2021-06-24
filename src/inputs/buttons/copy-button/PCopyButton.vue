<template>
    <span class="p-copy-button">
        <span v-if="$scopedSlots.default" ref="textRef"
              class="mr-2"
        >
            <slot name="default" />
        </span>
        <p-i v-if="showIcon"
             ref="iconRef"
             class="copy-icon"
             :class="{active: click}"
             width="1em"
             height="1em"
             :name="click ? 'ic_copied' : 'ic_copy'"
             color="inherit"
             v-on="$listeners"
             @mousedown.native="click = true"
             @mouseup.native="copyText()"
        />
        <transition name="fade">
            <div v-if="isAlertVisible" ref="alertRef" class="copy-button-alert"
                 :style="alertStyle"
            >
                <p-i name="ic_state_active" color="white" width="1rem"
                     height="1rem"
                />
                <span>{{ $t('COMPONENT.COPY_BUTTON.COPIED') }}</span>
            </div>
        </transition>
    </span>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import Vue from 'vue';

import { copyAnyData, isNotEmpty } from '@/util/helpers';

import PI from '@/foundation/icons/PI.vue';

interface Props {
    value?: string;
    autoHideIcon?: boolean;
    copyManually?: boolean;
}

const ALERT_PAD = 8;

export default defineComponent<Props>({
    name: 'PCopyButton',
    components: { PI },
    props: {
        value: {
            type: String,
            default: null,
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
    setup(props: Props, { emit, slots }) {
        const state = reactive({
            click: false,
            isAlertVisible: false,
            iconRef: null as Vue|null,
            alertRef: null as Element|null,
            textRef: null as Element|null,
            alertStyle: computed<Partial<CSSStyleDeclaration>>(() => {
                if (!state.iconRef?.$el || !state.alertRef) return {};

                const iconRect: DOMRect = state.iconRef.$el.getBoundingClientRect();
                const alertHeight = state.alertRef.clientHeight;
                const alertWidth = state.alertRef.clientWidth;

                const left = iconRect.right + ALERT_PAD;
                if (left + alertWidth > window.innerWidth) {
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
                if (isNotEmpty(props.value)) return true;
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

            const observer = new MutationObserver((mutation) => {
                state.hasText = mutation.some(d => !!d.target.textContent);
            });

            observer.observe(textRef, {
                childList: true,
                subtree: true,
                characterData: true,
            });

            state.observer = observer;

            state.hasText = !!textRef.textContent;
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
    display: inline-flex;
    font-size: 0.875rem;
    align-items: center;

    .copy-icon {
        @apply text-gray-500;
        &.active {
            @apply text-secondary;
        }
    }

    @media (hover: hover) {
        &:hover {
            @apply text-secondary;
            .copy-icon {
                @apply text-secondary;
                cursor: pointer;
            }
        }
    }

    .copy-button-alert {
        @apply inline-flex text-white rounded-sm;
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
}

</style>
