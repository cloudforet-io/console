<script setup lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import type { TranslateResult } from 'vue-i18n';

import PIconButton from '@/controls/buttons/icon-button/PIconButton.vue';

interface Props {
    visible: boolean;
    title?: string | TranslateResult;
    styleType?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg' | 'full';
    isFixedSize?: boolean;
    hideHeader?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    title: '',
    styleType: 'primary',
    size: 'md',
    isFixedSize: false,
    hideHeader: false,
});

const emit = defineEmits<{(e: 'update:visible', val: boolean): void;
    (e: 'close'): void;
    (e: 'closed'): void;
}>();

const handleClose = () => {
    emit('close');
    emit('update:visible', false);
};
</script>

<template>
    <div class="p-overlay-layout">
        <transition name="fade"
                    @after-leave="emit('closed')"
        >
            <div v-if="props.visible"
                 class="background-overlay"
            />
        </transition>
        <transition name="slide">
            <div v-if="props.visible"
                 v-on-click-outside="handleClose"
                 class="layout"
                 :class="{
                     [props.styleType]: true,
                     [props.size]: true,
                     'fixed-size': props.isFixedSize,
                 }"
            >
                <div class="header">
                    <slot v-if="!props.hideHeader"
                          name="header"
                    >
                        <div class="title-wrapper">
                            <h2 class="title-text">
                                {{ props.title }}
                            </h2> <slot name="title-right-extra" />
                        </div>
                    </slot>
                </div>
                <p-icon-button class="close-button"
                               name="ic_close"
                               size="lg"
                               @click="handleClose"
                />
                <div class="contents">
                    <slot />
                </div>
                <div v-if="$slots['footer']"
                     class="footer-wrapper"
                >
                    <slot name="footer" />
                </div>
            </div>
        </transition>
    </div>
</template>

<style lang="postcss">
.p-overlay-layout {
    @apply absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 1030;

    >.layout {
        @apply fixed flex flex-col;
        height: 100vh;
        top: 0;
        right: 0;

        >.header {
            @apply flex justify-between items-center;
            flex-shrink: 0;
            padding: 1.75rem 4.5rem 1.25rem 1.5rem;

            .title-wrapper {
                @apply flex items-center;

                .title-text {
                    @apply text-gray-900 text-label-xl font-medium;
                }
            }
        }

        >.close-button {
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
        }

        .contents {
            @apply flex-1 overflow-y-auto flex;
        }

        .footer-wrapper {
            flex-shrink: 0;
            height: 3.5rem;
        }

        &.sm {
            width: 30%;
        }
        &.md {
            width: 50%;
        }
        &.lg {
            width: 90%;
        }
        &.full {
            width: 100%;
        }

        &.primary {
            @apply bg-white;
        }

        &.secondary {
            @apply bg-gray-100;
        }

        @screen tablet {
            &.sm {
                width: 100%;
            }
            &.md {
                width: 100%;
            }
            &.lg {
                width: 100%;
            }
            &.full {
                width: 100%;
            }
        }
    }

    /* transition */
    .slide-enter-active {
        transition: all 0.3s ease;
    }
    .slide-leave-active {
        transition: all 0.3s ease-out;
    }
    .slide-enter, .slide-leave-to {
        transform: translateX(100px);
        opacity: 0;
    }

    .fade-enter-active {
        transition: all 0.3s ease;
    }
    .fade-leave-active {
        transition: all 0.3s ease-out;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }

    .background-overlay {
        @apply bg-gray-900 bg-opacity-75 fixed;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
    }
}
</style>
