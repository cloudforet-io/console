<script>
import { getBindClass, mergeBind } from '@/components/util/functional-helpers';

export default {
    name: 'PCol',
    functional: true,
    props: {
        col: {
            type: Number,
            default: undefined,
            validator: value => value <= 12 && value >= 1,
        },
        order: {
            type: Number,
            default: 0,
        },
        flexGrow: {
            type: Number,
            default: 1,
        },
        flexShrink: {
            type: Number,
            default: 1,
        },
        flexBasis: {
            type: [String, Number],
            default: 'auto',
        },
        alignSelf: {
            type: String,
            default: 'auto',
            validator: value => ['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline'].indexOf(value) !== -1,
        },
    },
    render(h, { props, data, children }) {
        const colSize = props.col ? `${8.3333333 * props.col}%` : 0;
        const flexStyle = {
            order: props.order,
            flexGrow: props.col ? 0 : props.flexGrow,
            flexShrink: props.col ? 0 : props.flexShrink,
            flexBasis: props.col ? colSize : props.flexBasis,
            alignSelf: props.alignSelf,
            maxWidth: props.col ? colSize : '100%',
        };
        const newData = {
            ...data,
            class: {
                'p-col': true,
                ...getBindClass(data.class),
            },
            style: mergeBind(data.style, flexStyle),
        };
        return h('div', newData, children);
    },
};
</script>
