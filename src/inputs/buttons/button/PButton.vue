<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';
import { Button } from '@/inputs/buttons/button/type';
import PLottie from '@/foundation/lottie/PLottie.vue';
import { VNode } from 'vue/types/vnode';

const getClass = (attrs: Button) => {
    const cls = {
        'p-button': true,
        loading: !!attrs.loading,
        disabled: !!attrs.disabled,
        outline: !!attrs.outline,
        block: !!attrs.block,
    };
    if (attrs.size) {
        cls[attrs.size] = true;
    }
    if (attrs.styleType) {
        cls[attrs.styleType] = true;
    }
    return cls;
};

const LOADING_SIZE = {
    sm: 0.75,
    md: 1,
    lg: 1,
};
export default {
    name: 'PButton',
    functional: true,
    components: {
        PLottie,
    },
    render(h, {
        props, listeners, children, data,
    }) {
        const tag = props.href ? 'a' : 'button';

        const childrenEl: VNode[] = [...children];
        if (props.loading) {
            childrenEl.splice(0, 0, h(PLottie, {
                class: 'spinner',
                props: {
                    name: 'thin-spinner',
                    auto: true,
                    size: LOADING_SIZE[props.size] || LOADING_SIZE.md,
                },
            }));
        }

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
        childrenEl);
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
        &.loading {
            @apply bg-gray-200 text-gray-400 border-gray-100;
            cursor: not-allowed;
            .spinner {
                margin-right: 0.5em;
            }
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
        @apply bg-transparent text-gray-900;
        &:hover {
            @apply bg-blue-200 text-blue-500 bg-blue-200;
        }
        &.disabled {
            @apply bg-transparent text-gray-400;
            cursor: not-allowed;
        }
    }
}
</style>
