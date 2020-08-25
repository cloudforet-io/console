<script lang="ts">
import { getBindClass } from '@/components/util/functional-helpers';

export default {
    name: 'PAnchor',
    functional: true,
    render(h, { data, children }) {
        return h('a', {
            ...data,
            class: {
                'p-anchor': true,
                ...getBindClass(data.class),
            },
        },
        children);
    },
};
</script>

<style lang="postcss">
.p-anchor {
    @apply cursor-pointer;
    &:hover {
       @apply text-secondary underline;
    }
}
</style>
