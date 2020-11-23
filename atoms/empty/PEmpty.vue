<script>
import { getBindClass } from '@/components/util/functional-helpers';

export default {
    name: 'PEmpty',
    functional: true,
    render(h, { listeners, children, data }) {
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

<style lang="postcss">
.p-empty {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.2;

    @apply text-gray-300;
}
</style>
