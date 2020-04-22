<script lang="ts">
export default {
    name: 'PDynamicFieldText',
    functional: true,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number, typeof null],
            default: '',
        },
    },
    render(h, { props, data }) {
        let text: string = (typeof props.data === 'string') ? props.data : JSON.stringify(props.data);
        text = text === 'null' ? '' : text;
        return h('span', data, text);
    },
};
</script>
