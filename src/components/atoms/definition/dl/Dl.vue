<script>
export default {
    name: 'PDl',
    functional: true,
    render(h, { data, children }) {
        return h('dl', data, children);
    },
};
</script>
