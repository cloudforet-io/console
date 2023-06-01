<template>
    <router-link :to="props.to || {}"
                 class="p-anchor"
                 custom
    >
        <template #default="{href: toHref, navigate}">
            <span>
                <a ref="anchorRef"
                   class="p-anchor"
                   :class="{disabled: props.disabled, highlight: props.highlight, [props.size]: true}"
                   :target="validateTarget()"
                   :href="props.to ? (toHref || props.href ): props.href"
                   @click.stop="navigate"
                >
                    <p-i v-if="!props.hideIcon && hasText && props.iconPosition === IconPosition.left"
                         :name="props.iconName"
                         height="1.1em"
                         width="1.1em"
                         color="inherit"
                         class="icon"
                    />
                    <span class="text">
                        <slot v-bind="{...$props}">
                            {{ props.text }}
                        </slot>
                    </span>
                    <p-i v-if="!props.hideIcon && hasText && props.iconPosition === IconPosition.right"
                         :name="props.iconName"
                         height="1.1em"
                         width="1.1em"
                         color="inherit"
                         class="icon"
                    />
                </a>
            </span>
        </template>
    </router-link>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { RouteLocation } from 'vue-router';

import PI from '@/foundation/icons/PI.vue';
import { AnchorSize, IconPosition } from '@/inputs/anchors/type';


interface AnchorProps {
  text?: string;
  size?: AnchorSize;
  iconPosition?: IconPosition;
  hideIcon?: boolean;
  iconName?: string;
    // eslint-disable-next-line vue/require-default-prop
  href?: string;
    // eslint-disable-next-line vue/require-default-prop
  to?: RouteLocation;
  disabled?: boolean;
  highlight?: boolean;
}

const props = withDefaults(defineProps<AnchorProps>(), {
    text: '',
    size: AnchorSize.md,
    iconPosition: IconPosition.right,
    iconName: 'ic_external-link',
});

const validateTarget = () => {
    if (props.disabled) return '_self';
    if (props.iconName === 'ic_external-link' && !props.hideIcon) return '_blank';
    return '_self';
};
const anchorRef = ref<HTMLElement|null>(null);
const hasText = computed(() => !!anchorRef.value?.textContent);
</script>

<style lang="postcss">
.p-anchor {
    /* Do not change this to inline-flex style, because it must be used with inline texts. */
    @apply cursor-pointer inline-block items-end;
    font-size: inherit;
    vertical-align: baseline;
    line-height: 1.25;
    > .text {
        font-weight: inherit;
        font-size: inherit;
        color: inherit;
        word-break: break-all;
        vertical-align: baseline;
    }
    > .icon {
        margin: 0 0.125em;
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

    &.sm {
        font-size: 0.75rem;
        .icon {
            margin-bottom: 0.125rem;
        }
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
        &:focus, &:active, &focus-within {
            > .text {
                @apply underline;
            }
        }
    }
}
</style>
