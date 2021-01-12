<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';
import { Button } from '@/atoms/buttons/type';

export default {
    name: 'PButton',
    functional: true,
    render(h, {
        props, listeners, children, data,
    }) {
        function getClass(attrs: Button) {
            const cls = {
                'p-button': true,
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

        const tag = attrs.href ? 'a' : 'div';

        return h(tag, {
            ...data,
            class: {
                ...getClass({ ...data.attrs, ...props }),
                ...getBindClass(data.class),
            },
            on: {
                ...listeners,
                click: (event) => {
                    if (!props.disabled) {
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
        }
        &.link {
            border-color: transparent;
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

    &.disabled {
        @apply bg-gray-200 text-gray-400 border-gray-100 cursor-default;
    }

    &.outline {
        border-color: currentColor;
    }

    &.block {
        display: flex;
        width: 100%;
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

    /* primary */
    @mixin btn-color primary, theme('colors.primary'), theme('colors.white');
    @mixin btn-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
    @mixin btn-color primary1, theme('colors.primary1'), theme('colors.white');
    @mixin btn-color primary2, theme('colors.primary2'), theme('colors.white');
    @mixin btn-color primary3, theme('colors.primary3'), theme('colors.white');
    @mixin btn-color primary4, theme('colors.primary4'), theme('colors.white');

    /* secondary */
    @mixin btn-color secondary, theme('colors.secondary'), theme('colors.white');
    @mixin btn-color secondary1, theme('colors.secondary1'), theme('colors.white');
    @mixin btn-color secondary2, theme('colors.secondary2'), theme('colors.white');
    @mixin btn-color alert, theme('colors.alert'), theme('colors.white');
    @mixin btn-color safe, theme('colors.safe'), theme('colors.white');
    @mixin btn-color gray900, theme('colors.gray.900'), theme('colors.white');
    @mixin btn-color black, theme('colors.black'), theme('colors.white');
    @mixin btn-color gray, theme('colors.gray.default'), theme('colors.white');
    @mixin btn-color gray200, theme('colors.gray.200'), theme('colors.white');
    @mixin btn-color gray100, theme('colors.gray.100'), theme('colors.white');
    @mixin btn-color coral, theme('colors.coral.default'), theme('colors.white');
    @mixin btn-color yellow, theme('colors.yellow.default'), theme('colors.white');

    /* &.btn-gray900-hover { */

    /*    background-color: theme('colors.gray.900'); */

    /*    color: theme('colors.white'); */

    /*    &:hover { */

    /*        border: 1px solid theme('colors.blue.500'); */

    /*        background-color: theme('colors.blue.200'); */

    /*        color: theme('colors.blue.500'); */

    /*    } */

    /* } */

    /* &.outline-gray900-hover { */

    /*    border: 1px solid theme('colors.gray.900'); */

    /*    color: theme('colors.gray.900'); */

    /*    background-color: transparent; */

    /*    &:not(:disabled):not(.disabled):hover { */

    /*        border: 1px solid theme('colors.blue.500'); */

    /*        background-color: theme('colors.blue.200'); */

    /*        color: theme('colors.blue.500'); */

    /*    } */

    /* } */
}

</style>
