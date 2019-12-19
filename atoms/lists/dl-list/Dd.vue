<script>
export default {
    name: 'PDd',
    functional: true,
    render(h, { data, children }) {
        return h('dd', data, children);
    },
};
</script>
