<script>
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';
import { getBindClass } from '@/components/utils/functional';

export default {
    name: 'PButton',
    functional: true,
    mixins: [ButtonMixin],
    render(h, {
        props, listeners, children, data,
    }) {
        function getClass(prop) {
            if (!prop.forceClass) {
                const cls = {
                    'p-button': true,
                    btn: true,
                    disabled: prop.disabled,
                    'btn-block': prop.block,
                    'btn-link': prop.link,
                };
                if (prop.size) {
                    cls[`btn-${prop.size}`] = true;
                }
                if (!prop.link && prop.styleType) {
                    cls[`btn${prop.outline ? '-outline' : ''}-${prop.styleType}`] = true;
                }
                return cls;
            }
            return prop.forceClass;
        }
        return h('div', {
            ...data,
            class: {
                ...getClass(props),
                ...getBindClass(data.class),
            },
            on: {
                ...listeners,
                click: (event) => {
                    if (!props.disabled) {
                        if (props.href != null && props.href.trim()) {
                            window.open(props.href);
                        }
                        if (listeners.click) listeners.click(event);
                    }
                },
            },
        },
        children);
    },
};
</script>

<style lang="postcss">

@define-mixin btn-color $theme, $color, $opposite-color {
    &.btn-$(theme) {
        background-color: $color;
        color: $opposite-color;
    }
    &.btn-outline-$(theme) {
        border: 1px solid $color;
        color: $color;
        background-color: transparent;
        &:not(:disabled):not(.disabled):hover {
            background-color: $color;
            background-repeat: no-repeat;
            background-clip: padding-box;
            color: $opposite-color;
            text-decoration: none;
        }
    }
}

.btn {
    @apply font-bold;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0 0.875rem;
    cursor: pointer;
    border-radius: 2px;
    opacity: 1;
    min-width: 6rem;
    height: 2rem;
    text-align: center;
    letter-spacing: 0;
    font-size: 0.875rem;
    line-height: 2rem;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    &[type="button"], &[type="reset"], &[type="submit"] {
        appearance: none;
    }

    &.disabled {
        @apply bg-gray-200 text-gray-400 border-gray-100;
        background-color: theme('colors.gray.100') !important;
        border-color: theme('colors.gray.200') !important;
        color: theme('colors.gray.400') !important;
        background-repeat: no-repeat;
        background-clip: padding-box;
        border-width: 1px;
        border-style: solid;
    }

    @mixin btn-color primary, theme('colors.primary'), theme('colors.white');
    @mixin btn-color primary-dark, theme('colors.primary-dark'), theme('colors.white');
    @mixin btn-color primary1, theme('colors.primary1'), theme('colors.white');
    @mixin btn-color primary2, theme('colors.primary2'), theme('colors.white');
    @mixin btn-color primary3, theme('colors.primary3'), theme('colors.white');
    @mixin btn-color primary4, theme('colors.primary4'), theme('colors.white');

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

    &.btn-gray900-hover {
        background-color: theme('colors.gray.900');
        color: theme('colors.white');
        &:not(:disabled):not(.disabled):hover {
            border: 1px solid theme('colors.blue.500');
            background-color: theme('colors.blue.200');
            color: theme('colors.blue.500');
        }
    }
    &.btn-outline-gray900-hover {
        border: 1px solid theme('colors.gray.900');
        color: theme('colors.gray.900');
        background-color: transparent;
        &:not(:disabled):not(.disabled):hover {
            border: 1px solid theme('colors.blue.500');
            background-color: theme('colors.blue.200');
            color: theme('colors.blue.500');
        }
    }
}

.btn-lg {
    min-width:7.5rem;
    height: 2.5rem;
    text-align: center;
    font-size: 1rem;
    line-height: 1.125rem;
}
.btn-sm {
    min-width:3.25rem;
    height: 1.5rem;
    text-align: center;
    font-size: .75rem;
    line-height: .875rem;
}
.btn-block {
    display: flex;
    width: 100%;
}
</style>
