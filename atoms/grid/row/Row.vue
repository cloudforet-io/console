<script>
import { getBindClass, mergeBind } from '@/components/util/functional-helpers';

export default {
    name: 'PRow',
    functional: true,
    props: {
        inline: {
            type: Boolean,
            default: false,
        },
        direction: {
            type: String,
            default: 'row',
            validator: value => ['row', 'row-reverse', 'column', 'column-reverse'].indexOf(value) !== -1,
        },
        wrap: {
            type: String,
            default: 'nowrap',
            validator: value => ['nowrap', 'wrap', 'wrap-reverse'].indexOf(value) !== -1,
        },
        justifyContent: {
            type: String,
            default: 'flex-start',
            validator: value => ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].indexOf(value) !== -1,
        },
        alignContent: {
            type: String,
            default: 'stretch',
            validator: value => ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'].indexOf(value) !== -1,
        },
        alignItems: {
            type: String,
            default: 'stretch',
            validator: value => ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'].indexOf(value) !== -1,
        },
    },
    render(h, { props, data, children }) {
        const flexStyle = {
            display: props.inline ? 'inline-flex' : 'flex',
            flexWrap: props.wrap,
            flexDirection: props.direction,
            justifyContent: props.justifyContent,
            alignContent: props.alignContent,
            alignItems: props.alignItems,
        };
        const newData = {
            ...data,
            class: {
                'p-row': true,
                ...getBindClass(data.class),
            },
            style: mergeBind(data.style, flexStyle),
        };
        return h('div', newData, children);
    },
};
</script>

<style lang="postcss">
    .p-row {
        width: 100%;
    }
</style>
