<template>
    <component :is="component"
               :href="disabled ? undefined : href"
               class="p-button"
               :class="{
                   [styleType]: true,
                   [size]: true,
                   [fontWeight]: true,
                   'loading': !!loading,
                   'block': !!block,
                   'outline': !!outline,
                   'disabled': !!disabled,
               } "
               v-on="{
                   ...$listeners,
                   click: (event) => {
                       if (!disabled && !loading) {
                           if (typeof $listeners.click === 'function') $listeners.click(event);
                           else $listeners.click.forEach(func => func(event));
                       }
                   }
               }"
    >
        <p-lottie v-if="loading" name="thin-spinner" :size="loadingIconSize" />
        <p-i v-if="icon"
             :name="icon"
             width="1rem" height="1rem"
             color="inherit"
        />
        <slot name="default" />
    </component>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PI from '@/foundation/icons/PI.vue';
import PLottie from '@/foundation/lottie/PLottie.vue';
import type { ButtonProps, ButtonSize } from '@/inputs/buttons/button/type';
import { BUTTON_FONT_WEIGHT, BUTTON_SIZE, BUTTON_STYLE } from '@/inputs/buttons/button/type';


const LOADING_SIZE: Record<ButtonSize, number> = {
    sm: 0.75,
    md: 1,
    lg: 1,
};
export default defineComponent<ButtonProps>({
    name: 'PButton',
    components: {
        PLottie,
        PI,
    },
    props: {
        styleType: {
            type: String,
            default: BUTTON_STYLE.primary,
            validator(value: string): boolean {
                return Object.keys(BUTTON_STYLE).includes(value);
            },
        },
        size: {
            type: String,
            default: BUTTON_SIZE.md,
            validator(value: string): boolean {
                return Object.keys(BUTTON_SIZE).includes(value);
            },
        },
        loading: {
            type: Boolean,
            default: false,
        },
        href: {
            type: String,
            default: undefined,
        },
        icon: {
            type: String,
            default: undefined,
        },
        outline: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        fontWeight: {
            type: String,
            default: BUTTON_FONT_WEIGHT.bold,
            validator(value: string): boolean {
                return Object.keys(BUTTON_FONT_WEIGHT).includes(value);
            },
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            component: computed(() => (props.href ? 'a' : 'button')),
            loadingIconSize: computed(() => LOADING_SIZE[props.size ?? ''] ?? LOADING_SIZE.md),
        });

        /* Event */
        const handleClick = () => {
            if (!props.disabled && !props.loading) {
                emit('click');
            }
        };

        return {
            ...toRefs(state),
            handleClick,
        };
    },
});
</script>

<style lang="postcss">
@define-mixin btn-color $theme, $bg-color, $text-color {
    &.$(theme) {
        background-color: $bg-color;
        color: $text-color;
        &.outline {
            border-color: $bg-color;
            color: $bg-color;
            background-color: #fff;
            &:not(.disabled):hover {
                background-color: $bg-color;
                color: $text-color;
            }
        }
        &.disabled {
            @apply bg-gray-200 text-gray-400 border-gray-100;
            cursor: not-allowed;
            &.outline {
                @apply text-gray-300 border-gray-300;
            }
        }
        &.loading {
            @apply bg-gray-200 text-gray-400 border-gray-100;
            cursor: not-allowed;
            > .spinner {
                margin-right: 0.5em;
            }
        }
    }
}

.p-button {
    @apply font-bold inline-flex justify-center items-center cursor-pointer text-center border border-transparent rounded;
    padding: 0 0.875rem;
    opacity: 1;
    min-width: 6rem;
    height: 2rem;
    letter-spacing: 0;
    font-size: 0.875rem;
    line-height: 2rem;
    white-space: nowrap;
    transition:
        color 0.15s ease-in-out,
        background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;

    &[type="button"], &[type="reset"], &[type="submit"] {
        appearance: none;
    }

    &.block {
        min-width: 100%;
        display: flex;
    }

    &.lg {
        min-width: 7.5rem;
        height: 2.5rem;
        text-align: center;
        font-size: 1rem;
        line-height: 1.125rem;
        &.block {
            min-width: 100%;
        }
        > .icon {
            font-size: 1.5rem;
        }
    }

    &.sm {
        min-width: 3.25rem;
        height: 1.5rem;
        padding: 0 0.5rem;
        text-align: center;
        font-size: 0.75rem;
        line-height: 0.875rem;
        &.block {
            min-width: 100%;
        }
        > .icon {
            font-size: 1rem;
        }
    }

    &.bold {
        @apply font-bold;
    }

    &.normal {
        @apply font-normal;
    }

    > .icon {
        flex-shrink: 0;
        margin-right: 0.25em;
        font-size: 1.25rem;
    }

    @mixin btn-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
    @mixin btn-color primary, theme('colors.primary'), theme('colors.white');
    @mixin btn-color primary1, theme('colors.primary1'), theme('colors.white');
    @mixin btn-color primary2, theme('colors.primary2'), theme('colors.white');
    @mixin btn-color secondary, theme('colors.secondary'), theme('colors.white');
    @mixin btn-color secondary-dark, theme('colors.secondary-dark'), theme('colors.white');
    @mixin btn-color secondary1, theme('colors.secondary1'), theme('colors.white');
    @mixin btn-color gray, theme('colors.gray.default'), theme('colors.white');
    @mixin btn-color gray900, theme('colors.gray.900'), theme('colors.white');
    @mixin btn-color alert, theme('colors.alert'), theme('colors.white');
    @mixin btn-color safe, theme('colors.safe'), theme('colors.white');

    &.gray-border {
        @apply bg-white text-gray-900 border-gray-300;
        &.outline {
            @apply border-gray-300;
        }
        &:hover {
            @apply bg-gray-dark text-white border-gray-dark;
        }
        &.disabled {
            @apply bg-transparent text-gray-300 border-gray-300;
            cursor: not-allowed;
        }
    }
    &.transparent {
        @apply bg-transparent text-gray-900;
        &:hover {
            @apply bg-blue-200 text-blue-600 bg-blue-200;
        }
        &.disabled {
            @apply bg-transparent text-gray-400;
            cursor: not-allowed;
        }
    }
}
</style>
