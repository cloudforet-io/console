<script lang="ts">
import moment from 'moment';

export default {
    name: 'Datetime',
    functional: true,
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: String,
            required: true,
        },
    },
    render(h, { props, data }) {
        let args = [props.data];
        if (props.view_option.source_type === 'timestamp') {
            args = [Number(props.data)];
        }
        if (props.view_option.source_type === 'iso861' && props.view_option.source_format) {
            args.push(props.view_option.source_format);
        }
        const time = moment(...args);
        let result:String;
        if (props.view_option.display_format) {
            result = time.format(props.view_option.display_format);
        } else {
            result = time.format();
        }
        return h('span', data, result);
    },
};
</script>
