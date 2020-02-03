<script lang="ts">
export default {
    name: 'PDynamicFieldText',
    functional: true,
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: '',
        },
    },
    render(h, { props, data }) {
        const text:string = (typeof props.data === 'string') ? props.data : JSON.stringify(props.data);
        return h('span', data, text);
    },
};
</script>
