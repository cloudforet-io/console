<script>
export default {
    name: 'PLabel',
    functional: true,
    render(h, { data, children }) {
        return h('label', data, children);
    },
};
</script>
