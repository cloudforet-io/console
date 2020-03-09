<script>
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';
import { getBindClass } from '@/lib/functional';

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

<style lang="scss">

@mixin btn-color($theme, $color, $oposite-color) {
    &.btn-#{$theme} {
        background-color: $color;
        background-repeat: no-repeat;
        background-clip: padding-box;
        border: 1px solid $color;
        color: $oposite-color;
        &:not(:disabled):not(.disabled):hover {
            text-decoration: underline;
        }
    }
    &.btn-outline-#{$theme} {
        border: 1px solid $color;
        color: $color;
        background-color: transparent;
        &:not(:disabled):not(.disabled):hover {
            background-color: $color;
            background-repeat: no-repeat;
            background-clip: padding-box;
            color: $oposite-color;
            text-decoration: underline;
        }
    }
}

.btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0 .875rem;
    cursor:pointer;
    border-radius: 2px;
    opacity: 1;
    min-width:6rem;
    height: 2rem;
    text-align: center;
    letter-spacing: 0;
    font-weight: 400;
    font-size: .875rem;
    line-height: 1rem;
    border: 1px solid transparent;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

    @include btn-color('primary', $primary, $white);
    @include btn-color('primary-dark', $primary-dark, $white);
    @include btn-color('primary1', $primary1, $white);
    @include btn-color('primary2', $primary2, $white);
    @include btn-color('primary3', $primary3, $white);
    @include btn-color('primary4', $primary4, $white);

    @include btn-color('secondary', $secondary,$white);
    @include btn-color('secondary1', $secondary1,$white);
    @include btn-color('secondary2', $secondary2,$white);

    @include btn-color('alert', $danger, $white);
    @include btn-color('safe', $success, $white);
    @include btn-color('dark', $dark, $white);

    @include btn-color('gray', $gray, $white);
    @include btn-color('gray1', $gray1, $white);
    @include btn-color('gray2', $gray2, $white);
    @include btn-color('gray3', $gray3, $white);

    @include btn-color('other1', $other1, $white);
    @include btn-color('other2', $other2, $white);
    @include btn-color('other3', $other3, $white);
    @include btn-color('other4', $other4, $white);


    &.disabled {
        background-color: $gray2;
        background-repeat: no-repeat;
        background-clip: padding-box;
        border: 1px solid $gray3;
        color: $gray1;
    }
}

.btn-lg {
    min-width:7.5rem;
    height: 2.5rem;
    text-align: center;
    font-size: 1rem;
    line-height: 1.125rem;
    -webkit-appearance:none;
}
.btn-sm {
    min-width:3.25rem;
    height: 1.5rem;
    text-align: center;
    font-size: .75rem;
    line-height: .875rem;
    -webkit-appearance:none;
}
.btn-block {
    display: flex;
    width: 100%;
    -webkit-appearance:none;
}
</style>
