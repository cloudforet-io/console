<script lang="ts">
export default {
    name: 'Text',
    functional: true,
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: String,
            required: true,
        },
    },
    render(h, { props, data }) {
        const text:string = (typeof props.data === 'string') ? props.data : JSON.stringify(props.data);
        return h('span', data, text);
    },
};
</script>
