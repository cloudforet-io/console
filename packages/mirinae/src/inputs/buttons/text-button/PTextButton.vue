<template>
    <button class="p-text-button"
            :class="{
                [styleType]: true,
                [size]: true,
                loading: !!loading,
                disabled: !!disabled,
                readonly
            } "
            v-on="{
                ...$listeners,
                click: (event) => {
                    if (!disabled && !loading) {
                        if (typeof $listeners.click === 'function') $listeners.click(event);
                        if (Array.isArray($listeners.click)) $listeners.click.forEach(func => func(event));
                    }
                }
            }"
    >
        <p-spinner v-if="loading"
                   :size="loadingIconSize"
        />
        <p-i v-if="iconLeft"
             :name="iconLeft"
             :width="iconSize"
             :height="iconSize"
             color="inherit"
             class="icon left"
        />
        <slot name="default" />
        <p-i v-if="iconRight"
             :name="iconRight"
             :width="iconSize"
             :height="iconSize"
             color="inherit"
             class="icon right"
        />
    </button>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import { SPINNER_SIZE } from '@/feedbacks/loading/spinner/type';
import PI from '@/foundation/icons/PI.vue';
import type { TextButtonSize, TextButtonStyle, TextButtonProps } from '@/inputs/buttons/text-button/type';
import { TEXT_BUTTON_SIZE, TEXT_BUTTON_STYLE } from '@/inputs/buttons/text-button/type';


const ICON_WIDTH: Record<TextButtonSize, string> = {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
};
const LOADING_SIZE: Record<TextButtonSize, string> = {
    sm: SPINNER_SIZE.xs,
    md: SPINNER_SIZE.sm,
    lg: SPINNER_SIZE.sm,
};

export default defineComponent<TextButtonProps>({
    name: 'PTextButton',
    components: { PI, PSpinner },
    props: {
        styleType: {
            type: String as PropType<TextButtonStyle>,
            default: TEXT_BUTTON_STYLE.default,
            validator(value: TextButtonStyle): boolean {
                return Object.values(TEXT_BUTTON_STYLE).includes(value);
            },
        },
        size: {
            type: String as PropType<TextButtonSize>,
            default: TEXT_BUTTON_SIZE.md,
            validator(value: TextButtonSize): boolean {
                return Object.values(TEXT_BUTTON_SIZE).includes(value);
            },
        },
        iconLeft: {
            type: String,
            default: undefined,
        },
        iconRight: {
            type: String,
            default: undefined,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            iconSize: computed(() => ICON_WIDTH[props.size ?? ''] ?? ICON_WIDTH.md),
            loadingIconSize: computed(() => LOADING_SIZE[props.size ?? ''] ?? LOADING_SIZE.md),
        });

        return {
            ...toRefs(state),
        };
    },
});
</script>

<style lang="postcss">
.p-text-button {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    text-align: center;
    padding: 0 0.25rem;

    &:not(.disabled):not(.readonly)&:hover {
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
    }
    &:focus {
        outline-color: theme('colors.blue.500');
    }

    &.md {
        font-size: 0.875rem;
    }
    &.lg {
        font-size: 1rem;
    }
    &.sm {
        font-size: 0.75rem;
    }

    &.default {
        @apply text-gray-700;
    }
    &.highlight {
        @apply text-blue-700;
    }

    &.loading {
        cursor: not-allowed;
        text-decoration: none;
        > .p-spinner {
            margin-right: 0.25em;
        }
    }
    &.disabled {
        @apply text-gray-400;
        cursor: not-allowed;
        text-decoration: none;
    }
    &.readonly {
        cursor: not-allowed;
        text-decoration: none;
    }

    > .icon {
        flex-shrink: 0;
        &.left {
            margin-right: 0.25em;
        }
        &.right {
            margin-left: 0.25rem;
        }
    }
}
</style>
