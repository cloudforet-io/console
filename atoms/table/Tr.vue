<script>
import { mixin, getClass, getBindClass } from '@/components/atoms/table/styleMixin';

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
