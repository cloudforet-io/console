<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PHr',
    functional: true,
    render(h, { data, children }) {
        return h('hr', {
            ...data,
            class: {
                line: true,
                ...getBindClass(data.class),
            },
        },
        children);
    },
};
</script>

<style lang="scss">
    .line{
        border: none;
        height: 1px;
        color: $gray2;
        background-color: $gray2;
        margin-top: 0px;
        margin-bottom: 0px;
    }
</style>
