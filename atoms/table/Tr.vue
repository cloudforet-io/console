<script>
import { mixin, getClass } from '@/components/atoms/table/styleMixin';
import { getBindClass } from '@/components/utils/functional';

export default {
    name: 'PTr',
    functional: true,
    mixins: [mixin],
    render(h, {
        props, data, children,
    }) {
        const newData = {
            ...data,
            class: {
                ...getBindClass(data.class),
                ...getClass(props),
            },
        };
        return h('tr', newData, children);
    },
};
</script>
