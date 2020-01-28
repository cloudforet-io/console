<script lang="ts">
export default {
    name: 'Text',
    functional: true,
    props: {
        viewOption: {
            type: Object,
            default: () => {},
        },
        data: {
            type: [String, Object, Boolean, Array],
        },
    },
    render(h, { props, data }) {
        const text:string = (typeof props.data === 'string') ? props.data : JSON.stringify(props.data);
        return h('span', data, text);
    },
};
</script>
