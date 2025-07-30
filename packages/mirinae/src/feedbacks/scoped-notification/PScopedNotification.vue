<script setup lang="ts">
// Component name without P: PScopedNotification
// Component name in kebab case: p-scoped-notification
// Story Category: Feedbacks
// Story Title: ScopedNotification

import { reactive } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';

import {
    gray, indigo, red, yellow, green, violet,
} from '@/styles/colors.cjs';


const ICON_COLOR_MAP = {
    information: indigo[500],
    danger: red[400],
    warning: yellow[500],
    success: green[700],
    discovery: violet[700],
};
interface Props {
    type?: 'danger'|'warning'|'success'|'information'|'discovery'|'tip';
    layout?: 'in-section' | 'full-width';
    icon?: string;
    title?: string|TranslateResult;
    showCloseButton?: boolean;
    visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'tip',
    layout: 'full-width',
    icon: undefined,
    title: undefined,
    showCloseButton: false,
    visible: true,
});
const emit = defineEmits<{(e: 'close'): void;
    (e: 'update:visible', value: boolean): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleCloseClick = () => {
    emit('close');
    state.proxyVisible = false;
};
</script>

<template>
    <div class="p-scoped-notification"
         :class="[props.type, props.layout]"
    >
        <p-i v-if="props.icon"
             class="left-icon self-start"
             width="1.25rem"
             height="1.25rem"
             :color="ICON_COLOR_MAP[props.type]"
             :name="props.icon"
        />
        <div class="content-wrapper"
             :class="{'no-title': !props.title}"
        >
            <div class="left-part">
                <div v-if="props.title"
                     class="title-wrapper"
                >
                    {{ props.title }}
                </div>
                <div class="body-wrapper">
                    <slot />
                </div>
            </div>
            <div class="right-part">
                <slot name="right" />
            </div>
        </div>
        <p-icon-button v-if="props.showCloseButton"
                       name="ic_close"
                       :color="gray[400]"
                       class="close-button"
                       @click.stop="handleCloseClick"
        />
    </div>
</template>

<style scoped lang="postcss">
.p-scoped-notification {
    @apply flex gap-2 rounded bg-gray-100;
    padding: 1.125rem 1.5rem;

    >.left-icon {
        margin: 0.125rem 0;
        flex-shrink: 0;
    }

    >.content-wrapper {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        justify-content: space-between;
        &.no-title {
            @apply mt-0;
            .left-part {
                .body-wrapper {
                    @apply mt-0;
                }
            }
        }
        .left-part {
            .title-wrapper {
                @apply text-label-lg font-bold;
                line-height: 1.25rem;
            }

            .body-wrapper {
                @apply text-paragraph-md mt-1;
            }
        }
        .right-part {
            display: flex;
            flex-wrap: wrap;
            flex-shrink: 0;
            margin-top: auto;
        }
    }

    /* type */
    &.information {
        @apply bg-indigo-100;
        .title-wrapper {
            @apply text-indigo-600;
        }
    }

    &.warning {
        @apply bg-yellow-100;
        .title-wrapper {
            @apply text-yellow-700;
        }
    }

    &.danger {
        @apply bg-red-100;
        .title-wrapper {
            @apply text-red-500;
        }
    }

    &.success {
        @apply bg-green-100;
        .title-wrapper {
            @apply text-green-700;
        }
    }

    &.discovery {
        @apply bg-violet-150;
        .title-wrapper {
            @apply text-violet-700;
        }
    }

    /* layout */
    &.in-section {
        @apply gap-1;
        padding: 0.5rem 1rem;

        >.content-wrapper {
            margin-top: 0.125rem;
        }
    }
}
</style>
