<template>
    <span class="p-link">
        <router-link v-slot="{href: toHref, navigate}"
                     :to="props.to || {}"
                     custom
        >
            <a ref="linkRef"
               class="p-link"
               :class="{disabled: props.disabled, highlight: props.highlight, [props.size]: true}"
               :target="state.target"
               :href="props.to ? (toHref || props.href ): props.href"
               @click.stop="navigate"
            >
                <p-i v-if="state.hasText && !!props.leftIcon"
                     :name="props.leftIcon"
                     height="1rem"
                     width="1rem"
                     color="inherit"
                     class="icon"
                />
                <span class="text">
                    <slot v-bind="{...$props}">
                        {{ props.text }}
                    </slot>
                </span>
                <p-i v-if="state.hasText && props.actionIcon !== ACTION_ICON.NONE"
                     :name="state.actionIconName"
                     :height="state.iconSize"
                     :width="state.iconSize"
                     color="inherit"
                     class="icon"
                />
            </a>
        </router-link>
    </span>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

import PI from '@/foundation/icons/PI.vue';
import { ACTION_ICON, LinkSize } from '@/inputs/link/type';
import type { ActionIcon } from '@/inputs/link/type';


interface LinkProps {
    text?: string;
    disabled?: boolean;
    highlight?: boolean;
    size?: LinkSize;
    leftIcon?: string;
    actionIcon?: ActionIcon;
    newTab?: boolean;
    href?: string;
    to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<LinkProps>(), {
    text: '',
    size: undefined,
    leftIcon: undefined,
    actionIcon: 'none',
    href: undefined,
    to: undefined,
});

const linkRef = ref<HTMLElement|null>(null);
const state = reactive({
    hasText: computed(() => !!linkRef.value?.textContent),
    target: computed(() => {
        if (props.actionIcon === ACTION_ICON.EXTERNAL_LINK || props.newTab) return '_blank';
        return '_self';
    }),
    actionIconName: computed(() => {
        if (props.actionIcon === ACTION_ICON.INTERNAL_LINK) {
            if (props.newTab) return 'ic_arrow-right-up';
            return 'ic_arrow-right';
        }
        if (props.actionIcon === ACTION_ICON.EXTERNAL_LINK) return 'ic_external-link';
        return undefined;
    }),
    iconSize: computed(() => {
        if (props.size === LinkSize.sm) return '0.75rem';
        if (props.size === LinkSize.md) return '0.875rem';
        if (props.size === LinkSize.lg) return '1rem';
        return '0.875rem';
    }),
});
</script>

<style lang="postcss">
.p-link {
    /* Do not change this to inline-flex style, because it must be used with inline texts. */
    @apply cursor-pointer inline-block items-end;
    font-size: inherit;
    vertical-align: baseline;
    line-height: 100%;
    > .text {
        font-weight: inherit;
        font-size: inherit;
        color: inherit;
        word-break: break-all;
        vertical-align: baseline;
    }
    > .icon {
        margin: 0 0.125rem 0 0;
        vertical-align: top;
    }
    &.disabled {
        @apply text-gray-400;
        cursor: not-allowed;
        &.highlight {
            @apply text-blue-300;
        }
    }
    &:not(.disabled).highlight {
        @apply text-blue-700;
        &:active {
            @apply text-blue-700;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-blue-800;
            }
        }
    }

    &.md {
        font-size: 0.875rem;
    }
    &.sm {
        font-size: 0.75rem;
    }
    &.lg {
        font-size: 1rem;
        .icon {
            margin-bottom: unset;
        }
    }

    @media (hover: hover) {
        &:not(.disabled):hover {
            > .text {
                @apply underline;
            }
        }
    }

    &:not(.disabled) {
        &:focus, &:active, &:focus-within {
            > .text {
                @apply underline;
            }
        }
    }
}
</style>
