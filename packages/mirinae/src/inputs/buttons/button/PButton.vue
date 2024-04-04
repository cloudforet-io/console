<template>
    <component :is="component"
               :href="disabled ? undefined : href"
               class="p-button"
               :class="{
                   [styleType]: true,
                   [size]: true,
                   'loading': !!loading,
                   'block': !!block,
                   'disabled': !!disabled,
                   readonly
               } "
               v-on="{
                   ...$listeners,
                   click: (event) => {
                       if (!disabled && !readonly && !loading) {
                           if (!$listeners.click) return;

                           if (typeof $listeners.click === 'function') $listeners.click(event);
                           else if(Array.isArray($listeners.click)) $listeners.click.forEach(func => func(event));
                           else console.error(new Error(`[p-button] Wrong type of click listener: ${typeof $listeners.click}`))
                       }
                   }
               }"
    >
        <p-spinner v-if="loading"
                   :size="loadingIconSize"
                   :style-type="spinnerStyleType"
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
    </component>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import type { SpinnerStyleType } from '@/feedbacks/loading/spinner/type';
import { SPINNER_SIZE, SPINNER_STYLE_TYPE } from '@/feedbacks/loading/spinner/type';
import PI from '@/foundation/icons/PI.vue';
import type { ButtonProps, ButtonSize } from '@/inputs/buttons/button/type';
import { BUTTON_SIZE, BUTTON_STYLE } from '@/inputs/buttons/button/type';


const ICON_SIZE: Record<ButtonSize, string> = {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
};
const LOADING_SIZE: Record<ButtonSize, string> = {
    sm: SPINNER_SIZE.xs,
    md: SPINNER_SIZE.sm,
    lg: SPINNER_SIZE.sm,
};
const WHITE_SPINNER_TYPES: string[] = [BUTTON_STYLE.primary, BUTTON_STYLE.substitutive, BUTTON_STYLE.highlight, BUTTON_STYLE.positive, BUTTON_STYLE['negative-primary']];

export default defineComponent<ButtonProps>({
    name: 'PButton',
    components: {
        PI,
        PSpinner,
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
        iconLeft: {
            type: String,
            default: undefined,
        },
        iconRight: {
            type: String,
            default: undefined,
        },
        block: {
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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            component: computed(() => (props.href ? 'a' : 'button')),
            iconSize: computed(() => ICON_SIZE[props.size ?? ''] ?? ICON_SIZE.md),
            loadingIconSize: computed(() => LOADING_SIZE[props.size ?? ''] ?? LOADING_SIZE.md),
            spinnerStyleType: computed<SpinnerStyleType>(() => {
                if (WHITE_SPINNER_TYPES.includes(props.styleType)) return SPINNER_STYLE_TYPE.white;
                return SPINNER_STYLE_TYPE.gray;
            }),
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
@define-mixin btn-color $theme, $default-color, $text-color, $hover-color, $active-color, $border-color {
    &.$(theme) {
        background-color: $default-color;
        color: $text-color;
        border-color: $border-color;
        &:not(.readonly):not(.disabled):hover {
            background-color: $hover-color;
            &:active {
                background-color: $active-color;
            }
        }
        &.disabled {
            @apply bg-gray-200 text-gray-400 border-transparent;
            cursor: not-allowed;
            &:hover, &:active, &:focus {
                @apply bg-gray-200;
            }
        }
        &.readonly {
            cursor: not-allowed;
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

    &:focus {
        outline-color: theme('colors.blue.500');
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
    }

    &.normal {
        @apply font-normal;
    }

    &.loading {
        cursor: not-allowed;
        > .p-spinner {
            margin-right: 0.25em;
        }
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

    @mixin btn-color primary, theme('colors.primary-dark'), theme('colors.white'), theme('colors.violet.900'), theme('colors.violet.900');
    @mixin btn-color substitutive, theme('colors.primary1'), theme('colors.white'), theme('colors.violet.500'), theme('colors.primary');
    @mixin btn-color secondary, theme('colors.white'), theme('colors.primary'), theme('colors.primary3'), theme('colors.primary2'), theme('colors.primary1');
    @mixin btn-color tertiary, theme('colors.white'), theme('colors.gray.900'), theme('colors.gray.100'), theme('colors.gray.300'), theme('colors.gray.300');
    @mixin btn-color transparent, theme('colors.transparent'), theme('colors.gray.900'), theme('colors.blue.200'), theme('colors.blue.300');
    @mixin btn-color highlight, theme('colors.blue.600'), theme('colors.white'), theme('colors.blue.700'), theme('colors.blue.800');
    @mixin btn-color positive, theme('colors.green.600'), theme('colors.white'), theme('colors.green.700'), theme('colors.green.800');
    @mixin btn-color negative-primary, theme('colors.red.500'), theme('colors.white'), theme('colors.red.600'), theme('colors.red.700');
    @mixin btn-color negative-secondary, theme('colors.white'), theme('colors.gray.900'), theme('colors.red.100'), theme('colors.red.200'), theme('colors.gray.300');
    @mixin btn-color negative-transparent, theme('colors.transparent'), theme('colors.gray.900'), theme('colors.red.400'), theme('colors.red.500');

    &.transparent {
        &:hover, &:focus {
            @apply text-blue-600;
        }
        &.disabled {
            &:hover, &:active, &:focus {
                @apply bg-gray-200 text-gray-400 border-transparent;
            }
        }
    }
    &.negative-secondary {
        &:hover, &:active {
            @apply text-red-500 border-red-200;
        }
        &.disabled {
            &:hover, &:active, &:focus {
                @apply bg-gray-200 text-gray-400 border-transparent;
            }
        }
    }
    &.negative-transparent {
        @apply bg-transparent text-gray-900;
        &:hover {
            @apply bg-red-400 border-red-400 text-white;
        }
        &:active {
            @apply text-white;
        }
        &.disabled {
            &:hover, &:active, &:focus {
                @apply bg-gray-200 text-gray-400 border-transparent;
            }
        }
    }
}
</style>
