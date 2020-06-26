<script>
import { getBindClass } from '@/components/utils/functional';

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

<style lang="postcss">
    .p-hr {
        width: 100%;
        border: none;
        height: 1px;
        @apply text-gray-200 bg-gray-200;
        margin-top: 0px;
        margin-bottom: 0px;
    }
</style>
