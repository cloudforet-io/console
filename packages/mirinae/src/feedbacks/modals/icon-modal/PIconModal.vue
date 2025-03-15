<template>
    <section class="p-icon-modal">
        <transition v-if="props.visible"
                    name="modal"
        >
            <article class="modal-mask"
                     :class="{'no-backdrop':!props.backdrop}"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="headerTitle"
                     tabindex="1"
            >
                <div class="modal-wrapper"
                     :class="props.size"
                >
                    <div class="content-wrapper">
                        <p-i v-if="props.iconName"
                             class="block"
                             :name="props.iconName"
                             :color="props.iconColor"
                             width="5rem"
                             height="5rem"
                        />
                        <p-lazy-img v-if="props.imageUrl"
                                    class="block"
                                    :src="props.imageUrl"
                                    width="5rem"
                                    height="5rem"
                        />
                        <span v-else-if="props.emoji"
                              class="wave"
                        >{{ props.emoji }}</span>
                        <div class="header-wrapper"
                             :class="props.size"
                        >
                            <slot name="custom-header" />
                            <p v-if="props.headerTitle"
                               class="header-title"
                            >
                                {{ props.headerTitle }}
                            </p>
                            <span v-if="props.headerDesc || $slots['header-desc']"
                                  class="header-desc"
                            >
                                <slot name="header-desc"
                                      v-bind="{desc: props.headerDesc}"
                                >
                                    {{ props.headerDesc }}
                                </slot>
                            </span>
                        </div>
                        <div class="body-wrapper">
                            <slot name="body" />
                        </div>
                        <slot v-if="!props.hideButton"
                              name="custom-button"
                        >
                            <p-button class="button"
                                      :style-type="props.buttonStyleType"
                                      @click="handleClickButton"
                            >
                                {{ props.buttonText }}
                            </p-button>
                        </slot>
                    </div>
                </div>
            </article>
        </transition>
    </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import PButton from '@/controls/buttons/button/PButton.vue';
import type { ButtonStyle } from '@/controls/buttons/button/type';
import { BUTTON_STYLE } from '@/controls/buttons/button/type';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import { useProxyValue } from '@/hooks';

import '../modal.pcss';

const PI = () => import('@/foundation/icons/PI.vue');

interface IconModalProps {
    size?: string;
    visible?: boolean;
    iconName?: string;
    iconColor?: string;
    imageUrl?: string;
    emoji?: string;
    headerTitle?: string;
    headerDesc?: string;
    buttonText: string;
    buttonStyleType?: ButtonStyle;
    backdrop?: boolean;
    hideButton?: boolean;
}
const props = withDefaults(defineProps<IconModalProps>(), {
    size: 'sm',
    buttonText: 'close',
    buttonStyleType: BUTTON_STYLE.tertiary,
    backdrop: true,
    iconName: undefined,
    imageUrl: undefined,
    iconColor: undefined,
    emoji: undefined,
    headerTitle: undefined,
    headerDesc: undefined,
});
const emit = defineEmits<{(e: 'clickButton'): void;}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleClickButton = () => {
    state.proxyVisible = false;
    emit('clickButton');
};
</script>

<style lang="postcss">
.p-icon-modal {
    $header-height: 14rem;
    $footer-height: 6.9rem;
    $wrapper-margin: 4rem;
    $body-max-height: calc(100vh - $(header-height) - $(footer-height) - $(wrapper-margin));
    > .modal-mask {
        > .modal-wrapper {
            width: calc(100vw - 1.5rem);
            min-width: 17rem;
            max-width: 36rem;
            min-height: 12.875rem;
            max-height: calc(100vh - 4rem);
            > .content-wrapper {
                @apply bg-white mx-auto rounded-lg;
                text-align: center;
                padding: 2.875rem 2rem 2.5rem;
                width: 100%;
                min-height: 10.5rem;

                > .p-i-icon {
                    margin: auto;
                }

                > .wave {
                    animation-name: wave-animation;
                    animation-duration: 2.5s;
                    animation-iteration-count: infinite;
                    transform-origin: 70% 70%;
                    display: inline-block;
                    font-size: 4rem;
                }

                @keyframes wave-animation {
                    0% {
                        transform: rotate(0deg);
                    }
                    10% {
                        transform: rotate(14deg);
                    }
                    20% {
                        transform: rotate(-8deg);
                    }
                    30% {
                        transform: rotate(14deg);
                    }
                    40% {
                        transform: rotate(-4deg);
                    }
                    50% {
                        transform: rotate(10deg);
                    }
                    60% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(0deg);
                    }
                }

                > .header-wrapper {
                    margin-top: 1.5rem;
                    margin-bottom: 1.5rem;

                    &.md {
                        margin-top: 0.625rem;
                        margin-bottom: 2.5rem;
                    }

                    > .header-title {
                        @apply text-primary-dark;
                        font-size: 1.5rem;
                        font-weight: bold;
                        line-height: 160%;
                        margin-bottom: 0.25rem;
                    }
                }

                > .body-wrapper {
                    overflow: auto;
                    max-height: $body-max-height;
                }

                > .button {
                    margin-top: 1.5rem;
                }
            }
            &.md {
                min-width: 25rem;
                max-width: 50rem;
                min-height: 12.875rem;
                > .content-wrapper {
                    padding: 3.5rem 2rem;
                }
            }
        }
    }
}

</style>
