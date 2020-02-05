<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PHr',
    functional: true,
    render(h, { data, children }) {
        return h('hr', {
            ...data,
            class: {
                'p-hr': true,
                ...getBindClass(data.class),
            },
        },
        children);
    },
};
</script>

<style lang="scss">
    .p-hr {
        width: 100%;
        border: none;
        height: 1px;
        color: $gray2;
        background-color: $gray2;
        margin-top: 0px;
        margin-bottom: 0px;
    }
</style>
