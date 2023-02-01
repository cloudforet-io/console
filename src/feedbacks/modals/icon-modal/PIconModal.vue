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
                             :color="primaryDark"
                             width="5rem"
                             height="5rem"
                        />
                        <span v-else-if="props.emoji"
                              class="wave"
                        >{{ props.emoji }}</span>
                        <div class="header-wrapper"
                             :class="props.size"
                        >
                            <p v-if="props.headerTitle"
                               class="header-title"
                            >
                                {{ props.headerTitle }}
                            </p>
                            <span v-if="props.headerDesc"
                                  class="header-desc"
                            >
                                {{ props.headerDesc }}
                            </span>
                        </div>
                        <div v-if="props.size === 'md'"
                             class="body-wrapper"
                        >
                            <slot name="body" />
                        </div>
                        <p-button
                            :style-type="props.buttonStyleType"
                            @click="handleClickButton"
                        >
                            {{ props.buttonText }}
                        </p-button>
                    </div>
                </div>
            </article>
        </transition>
    </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import PButton from '@/inputs/buttons/button/PButton.vue';
import '../modal.pcss';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';
import { makeProxy } from '@/utils/composition-helpers';

import { primaryDark } from '@/styles/colors.cjs';

const PI = () => import('@/foundation/icons/PI.vue');

interface IconModalProps {
    size?: string;
    visible?: boolean;
    iconName?: string;
    emoji?: string;
    headerTitle?: string;
    headerDesc?: string;
    buttonText: string;
    buttonStyleType?: string;
    backdrop?: boolean;
}
const props = withDefaults(defineProps<IconModalProps>(), {
    size: 'sm',
    buttonText: 'close',
    buttonStyleType: BUTTON_STYLE.tertiary,
    backdrop: true,
});
const emit = defineEmits<{(e: 'clickButton'): void;}>();
const state = reactive({
    proxyVisible: makeProxy('visible', props, emit),
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
            max-width: 32rem;
            min-height: 12.875rem;
            max-height: calc(100vh - 4rem);
            > .content-wrapper {
                @apply bg-white mx-auto rounded-lg;
                text-align: center;
                padding: 2.875rem 2rem 3.5rem;
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
                    margin-bottom: 1.5rem;
                    overflow: auto;
                    max-height: $body-max-height;
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
