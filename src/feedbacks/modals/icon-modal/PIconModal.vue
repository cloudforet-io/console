<template>
    <section class="p-icon-modal">
        <transition v-if="visible" name="modal">
            <article class="modal-mask" :class="{'no-backdrop':!backdrop}"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="headerTitle"
                     tabindex="1"
            >
                <div class="modal-wrapper" :class="size">
                    <div class="content-wrapper" :class="size">
                        <p-lottie v-if="lottieName"
                                  :name="lottieName"
                                  :size="5"
                        />
                        <p-i v-if="iconName"
                             class="block" :name="iconName"
                             width="5rem" height="5rem"
                        />
                        <span v-if="emoji" class="wave">👋</span>
                        <div class="header-wrapper" :class="size">
                            <p v-if="headerTitle" class="header-title">
                                {{ headerTitle }}
                            </p>
                            <span v-if="headerDesc" class="header-desc">
                                {{ headerDesc }}
                            </span>
                        </div>
                        <div v-if="size === 'md'" class="body-wrapper">
                            <slot name="body" />
                        </div>
                        <p-button
                            :style-type="buttonType" :outline="outline"
                            @click="onClickButton"
                        >
                            {{ buttonText }}
                        </p-button>
                    </div>
                </div>
            </article>
        </transition>
    </section>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import PLottie from '@/foundation/lottie/PLottie.vue';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import { IconModalProps } from '@/feedbacks/modals/icon-modal/type';
import '../modal.pcss';

import { makeProxy } from '@/util/composition-helpers';

export default {
    name: 'PIconModal',
    components: {
        PI,
        PLottie,
        PButton,
    },
    props: {
        size: {
            type: String,
            default: 'sm',
        },
        visible: {
            type: Boolean,
            default: false,
        },
        lottieName: {
            type: String,
            default: undefined,
        },
        iconName: {
            type: String,
            default: undefined,
        },
        emoji: {
            type: Boolean,
            default: undefined,
        },
        headerTitle: {
            type: String,
            default: undefined,
        },
        headerDesc: {
            type: String,
            default: undefined,
        },
        buttonText: {
            type: String,
            default: '',
        },
        buttonType: {
            type: String,
            default: 'gray900',
        },
        outline: {
            type: Boolean,
            default: true,
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: IconModalProps, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
        });

        const onClickButton = () => {
            state.proxyVisible = false;
            emit('clickButton');
        };

        return {
            ...toRefs(state),
            onClickButton,
        };
    },
};

</script>

<style lang="postcss">
.p-icon-modal {
    .modal-wrapper {
        width: calc(100vw - 1.5rem);
        min-width: 17rem;
        max-width: 32rem;
        min-height: 12.875rem;
        max-height: calc(100vh - 4rem);
        &.md {
            min-width: 25rem;
            max-width: 50rem;
            min-height: 12.875rem;
        }
    }
    .content-wrapper {
        @apply bg-white mx-auto;
        text-align: center;
        border-radius: 1rem;
        padding: 2.875rem 2rem 3.5rem;
        width: 100%;
        min-height: 10.5rem;

        &.md {
            padding: 3.5rem 2rem;
        }

        .p-lottie {
            display: inline-flex;
        }

        .p-i-icon {
            margin: auto;
        }

        .wave {
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

        .header-wrapper {
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
            &.md {
                margin-top: 0.625rem;
                margin-bottom: 2.5rem;
            }

            .header-title {
                @apply text-primary-dark;
                font-size: 1.5rem;
                font-weight: bold;
                line-height: 160%;
                margin-bottom: 0.25rem;
            }
        }

        $header-height: 14rem;
        $footer-height: 6.9rem;
        $wrapper-margin: 4rem;
        $body-max-height: calc(100vh - $(header-height) - $(footer-height) - $(wrapper-margin));

        .body-wrapper {
            margin-bottom: 1.5rem;
            overflow: auto;
            max-height: $body-max-height;
        }
    }
}

</style>
