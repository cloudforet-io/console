<script>
import { getBindClass } from '@/lib/functional';

export default {
    name: 'PEmpty',
    functional: true,
    render(h, {
        props, listeners, children, data,
    }) {
        return h('div', {
            ...data,
            class: {
                ...getBindClass(data.class),
                'p-empty': true,
            },
            on: {
                ...listeners,
            },
        },
        children);
    },
};
</script>

<style lang="scss">
    .p-empty {
        display: flex;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        line-height: 2rem;
        color: $primary2;
    }
</style>
