<script>
import { mixin, getClass,getBindClass } from '@/components/atoms/table/styleMixin';

export default {
    name: 'PTh',
    functional: true,
    mixins: [mixin],
    props: {
        colspan: {
            type: Number,
            default: null,
        },
    },
    render(h, { props, data, children }) {
        const newData = {
            ...data,
            class: {
                ...getBindClass(data.class),
                ...getClass(props),
            },
        };
        if (props.colspan) {
            newData.attrs.colspan = props.colspan;
        }
        return h('th', newData, children);
    },
};
</script>
