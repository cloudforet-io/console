<script>
export default {
    name: 'PButton',
    functional: true,
    events: ['click'],
    props: {
        forceClass: {
            type: Array,
            default: null,
        },
        /** @type {string} */
        href: {
            type: String,
            default: null,
        },
        /** @type {boolean} */
        disabled: {
            type: Boolean,
            default: false,
        },
        /** @type {boolean} */
        outline: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        styleType: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'primary',
                    'secondary',
                    'success',
                    'danger',
                    'warning',
                    'info',
                    'light',
                    'dark',
                ].indexOf(value) !== -1;
            },
        },
        /** @type {boolean} */
        link: {
            type: Boolean,
            default: false,
        },
        /** @type {boolean} */
        block: {
            type: Boolean,
            default: false,
        },
        /** @type {string} */
        size: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'sm',
                    'lg',
                ].indexOf(value) !== -1;
            },
        },
        /** @type {string} */
        shape: {
            type: String,
            default: null,
            validator(value) {
                return [
                    null,
                    'circle',
                ].indexOf(value) !== -1;
            },
        },
    },
    render(h, { props, listeners, children }) {
        function getClass() {
            if (!props.forceClass) {
                const cls = {
                    btn: true,
                    disabled: props.disabled,
                    'btn-block': props.block,
                    'btn-link': props.link,
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

<style scoped>

</style>
