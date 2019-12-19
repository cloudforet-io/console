<script>
export default {
    name: 'PDt',
    functional: true,
    render(h, { data, children }) {
        return h('dt', data, children);
    },
};
</script>
