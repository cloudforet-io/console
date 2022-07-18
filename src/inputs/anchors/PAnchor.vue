<template>
    <router-link :to="to || {}" class="p-anchor" custom>
        <template #default="{href: toHref, navigate}">
            <span>
                <a ref="anchorRef" class="p-anchor"
                   :class="{disabled, highlight, [iconPosition]: true, [size]: true}"
                   :target="validateTarget()"
                   :href="to ? (toHref || href ): href"
                   @click.stop="navigate"
                >
                    <span class="text">
                        <slot v-bind="{...$props}">
                            {{ text }}
                        </slot>
                    </span>
                    <p-i v-if="iconVisible && hasText"
                         :name="iconName"
                         height="1.1em" width="1.1em"
                         color="inherit"
                         class="icon"
                    />
                </a>
            </span>
        </template>
    </router-link>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from '@vue/composition-api';

import type { Location } from 'vue-router';

import PI from '@/foundation/icons/PI.vue';
import { AnchorSize, IconPosition } from '@/inputs/anchors/type';


interface Props {
  text?: string;
  size?: AnchorSize;
  iconPosition?: IconPosition;
  iconVisible?: boolean;
  iconName?: string;
  href?: string;
  to?: Location;
  disabled?: boolean;
  highlight?: boolean;
}

export default defineComponent<Props>({
    name: 'PAnchor',
    components: {
        PI,
    },
    props: {
        text: {
            type: String,
            default: '',
        },
        size: {
            type: String,
            default: AnchorSize.md,
            validator(type: AnchorSize) {
                return Object.values(AnchorSize).includes(type);
            },
        },
        iconPosition: {
            type: String,
            default: IconPosition.right,
            validator(type: IconPosition) {
                return Object.values(IconPosition).includes(type);
            },
        },
        iconVisible: {
            type: Boolean,
            default: true,
        },
        iconName: {
            type: String,
            default: 'ic_external-link',
        },
        href: {
            type: String,
            default: undefined,
        },
        to: {
            type: Object,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        highlight: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Props) {
        const validateTarget = () => {
            const {
                disabled, iconName, iconVisible,
            } = props;
            if (disabled) return '_self';
            if (iconName === 'ic_external-link' && iconVisible) return '_blank';
            return '_self';
        };
        const anchorRef = ref<HTMLElement|null>(null);
        const hasText = computed(() => !!anchorRef.value?.textContent);
        return {
            validateTarget,
            anchorRef,
            hasText,
        };
    },
});
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer inline-flex items-end;
    vertical-align: middle;
    line-height: inherit;
    font-size: 0.875rem;
    > .text {
        font-weight: inherit;
        font-size: inherit;
        color: inherit;
        word-break: break-all;
    }
    > .icon {
        margin-left: 0.125rem;
        margin-bottom: 0.1rem;
    }
    &.left {
        @apply flex-row-reverse;
        .icon {
            margin-left: unset;
            margin-right: 0.125rem;
        }
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
