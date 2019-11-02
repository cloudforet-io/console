<script>
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';

export default {
    name: 'PButton',
    functional: true,
    mixins: [ButtonMixin],
    render(h, {
        props, listeners, children, data,
    }) {
        function getBindClass(cls) {
            let bindClass = {};
            if (Array.isArray(cls)) {
                cls.forEach((value) => {
                    if (typeof value === 'object') {
                        for (const key of value.keys()) {
                            bindClass[key] = value[key];
                        }
                    } else {
                        bindClass[value] = true;
                    }
                });
            } else {
                bindClass = cls;
            }
            return bindClass;
        }
        function getClass() {
            if (!props.forceClass) {
                const cls = {
                    btn: true,
                    disabled: props.disabled,
                    'btn-block': props.block,
                    'btn-link': props.link,
                    ...getBindClass(data.class),
                };
                if (props.size) {
                    cls[`btn-${props.size}`] = true;
                }
                if (!props.link && props.styleType) {
                    cls[`btn${props.outline ? '-outline' : ''}-${props.styleType}`] = true;
                }
                return cls;
            }
            return props.forceClass;
        }
        return h('button', {
            class: getClass(),
            staticClass: data.staticClass,
            staticStyle: data.staticStyle,
            attrs: data.attrs,
            style: data.style,
            on: {
                click: (event) => {
                    if (!props.disabled) {
                        if (props.href != null && props.href.trim()) {
                            window.open(props.href);
                        }
                        listeners.click(event);
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
    border-radius: 2px;
    opacity: 1;
    min-width: 96px;
    height: 32px;
    text-align: center;
    font-size: 14px/16px;
    font: Regular 14px/16px Arial;
    letter-spacing: 0;

    @include btn-color('primary', #3C2C84, $white);
    @include btn-color('secondary', #0080FB,$white);
    @include btn-color('light', $light, $white);
    @include btn-color('danger', #EF3817, $white);
    @include btn-color('success', #60B731, $white);
    @include btn-color('warning', $warning, $white);
    @include btn-color('dark', #222532, $white);
    @include btn-color('info', $info, $white);

    &.disabled{
        background-color: #DCDDE2;
        background-repeat: no-repeat;
        background-clip: padding-box;
        border: 1px solid #F2F2F2;
        color: #A7A9B2;}
}
.btn-lg{
    min-width: 120px;
    height: 40px;
    text-align: center;
    font-size: 16px/18px;
}
.btn-sm{
    min-width: 52px;
    height: 24px;
    text-align: center;
    font-size: 112px/14px;
}
.btn-block {
    width: 100%;
}
</style>
