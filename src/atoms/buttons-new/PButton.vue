<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';
import { Button } from '@/atoms/buttons-new/type';

export default {
    name: 'PButton',
    functional: true,
    render(h, {
        props, listeners, children, data,
    }) {
        function getClass(attrs: Button) {
            const cls = {
                'p-button': true,
                loading: !!attrs.loading,
                disabled: !!attrs.disabled,
                outline: !!attrs.outline,
                link: !!attrs.href,
                block: !!attrs.block,
            };
            if (attrs.size) {
                cls[attrs.size] = true;
            }
            if (attrs.styleType) {
                cls[attrs.styleType] = true;
            }
            return cls;
        }

        const tag = props.href ? 'a' : 'div';

        return h(tag, {
            ...data,
            attrs: {
                ...data.attrs,
                href: props.disabled ? undefined : props.href,
            },
            class: {
                ...getClass({ ...data.attrs, ...props }),
                ...getBindClass(data.class),
            },
            on: {
                ...listeners,
                click: (event) => {
                    if (!props.disabled && !props.loading) {
                        if (listeners.click) {
                            if (typeof listeners.click === 'function') listeners.click(event);
                            else listeners.click.forEach(func => func(event));
                        }
                    }
                },
            },
        },
        children);
    },
};
</script>

<style lang="postcss">

@define-mixin btn-color $theme, $bg-color, $text-color {
    &.$(theme) {
        background-color: $bg-color;
        color: $text-color;
        &.outline {
            border-color: $bg-color;
            color: $bg-color;
            background-color: transparent;
            &:not(.disabled):hover {
                background-color: $bg-color;
                color: $text-color;
            }
        }
        &.disabled {
            @apply bg-gray-200 text-gray-400 border-gray-100;
            cursor: not-allowed;
        }
        &.link {
            border-color: transparent;
        }
        &.loading {
            @apply bg-gray-200 text-gray-400 border-gray-100;
            cursor: not-allowed;
        }
    }
}

.p-button {
    @apply font-bold inline-flex justify-center items-center cursor-pointer text-center border border-transparent;
    padding: 0 0.875rem;
    border-radius: 2px;
    opacity: 1;
    min-width: 6rem;
    height: 2rem;
    letter-spacing: 0;
    font-size: 0.875rem;
    line-height: 2rem;
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
    }

    &.lg {
        min-width: 7.5rem;
        height: 2.5rem;
        text-align: center;
        font-size: 1rem;
        line-height: 1.125rem;
    }

    &.sm {
        min-width: 3.25rem;
        height: 1.5rem;
        text-align: center;
        font-size: 0.75rem;
        line-height: 0.875rem;
    }

    @mixin btn-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
    @mixin btn-color primary, theme('colors.primary'), theme('colors.white');
    @mixin btn-color primary1, theme('colors.primary1'), theme('colors.white');
    @mixin btn-color primary2, theme('colors.primary2'), theme('colors.white');
    @mixin btn-color secondary, theme('colors.secondary'), theme('colors.white');
    @mixin btn-color secondary1, theme('colors.secondary1'), theme('colors.white');
    @mixin btn-color gray, theme('colors.gray.default'), theme('colors.white');
    @mixin btn-color gray900, theme('colors.gray.900'), theme('colors.white');
    @mixin btn-color gray900-hover, theme('colors.white'), theme('colors.gray.900');
    @mixin btn-color alert, theme('colors.alert'), theme('colors.white');
    @mixin btn-color safe, theme('colors.safe'), theme('colors.white');

    &.gray900-hover {
        @apply bg-white text-gray-900;
    }
    &.gray-border {
        @apply bg-white text-gray-900 border-gray-300;
        &.outline {
            @apply border-gray-300;
        }
        &:hover {
            @apply bg-white text-blue-500 border-blue-500;
        }
    }
    &.transparent {
        @apply bg-white text-gray-900 border-white;
        &.outline {
            @apply border-white;
        }
        &:hover {
            @apply bg-blue-200 text-blue-500 bg-blue-200;
        }
    }
}

.loading-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    .spinner {
        display: inline-flex;
        padding-right: 0.25rem;
    }
}
</style>
