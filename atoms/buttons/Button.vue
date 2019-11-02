<script>
import ButtonMixin from '@/components/atoms/buttons/ButtonMixin';

export default {
    name: 'PButton',
    functional: true,
    mixins: [ButtonMixin],
    render(h, {
        props, listeners, children, data,
    }) {
        function getClass() {
            if (!props.forceClass) {
                const cls = {
                    btn: true,
                    disabled: props.disabled,
                    'btn-block': props.block,
                    'btn-link': props.link,
                    ...data.class,
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
                        if (listeners.click) listeners.click(event);
                    }
                },
            },
        },
        children);
    },
};
</script>
