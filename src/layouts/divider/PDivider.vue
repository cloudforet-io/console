<script lang="ts">
import { getBindClass } from '@/util/functional-helpers';

export default {
    name: 'PDivider',
    functional: true,
    render(h, { data, children }) {
        return h('hr', {
            ...data,
            class: {
                'p-divider': true,
                ...getBindClass(data.class),
            },
        },
        children);
    },
};
</script>

<style lang="postcss">
.p-divider {
    width: 100%;
    border: none;
    height: 1px;

    @apply text-gray-200 bg-gray-200;
    margin-top: 0;
    margin-bottom: 0;
}
</style>
