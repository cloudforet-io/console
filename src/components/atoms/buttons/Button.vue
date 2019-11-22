<script>
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';
import { getBindClass } from '@/components/atoms/utils/functional';

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
            font-weight: bold;
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
            font-weight: bold;
            color: $oposite-color;
            text-decoration: underline;
        }
    }
}

.btn{
    cursor:pointer;
    border-radius: 2px;
    opacity: 1;
    min-width:6rem;
    height: 2rem;
    text-align: center;
    font: 14px/16px Arial;
    letter-spacing: 0;
    line-height: 1.2rem;

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


    &.disabled{
        background-color: $gray2;
        background-repeat: no-repeat;
        background-clip: padding-box;
        border: 1px solid $gray3;
        color: $gray1;}
}
.btn-lg{
    min-width:7.5rem;
    height: 2.5rem;
    text-align: center;
    font-size: 16px/18px;
}
.btn-sm{
    min-width:3.25rem;
    height: 1.5rem;
    text-align: center;
    font-size: 112px/14px;
}
.btn-block {
    width: 100%;
}
</style>
