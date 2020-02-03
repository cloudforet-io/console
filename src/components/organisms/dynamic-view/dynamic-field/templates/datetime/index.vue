<script lang="ts">
import moment, { Moment } from 'moment-timezone';

export default {
    name: 'PDynamicFieldDatetime',
    functional: true,
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: [String, Number, undefined],
            required: true,
        },
    },
    render(h, { props, data }) {
        let result:String = '';
        if (props.data) {
            let time:Moment;
            if (props.view_option.source_type === 'iso861') {
                const args = [props.data];
                if (props.view_option.source_format) {
                    args.push(props.view_option.source_format);
                }
                time = moment(...args);
            } else if (props.view_option.source_format === 'seconds') {
                time = moment.unix(Number(props.data));
            } else {
                time = moment(Number(props.data));
            }
            const tz:string|null = localStorage.getItem('timezone');
            if (tz) {
                time = time.tz(tz);
            }
            if (props.view_option.display_format) {
                result = time.format(props.view_option.display_format);
            } else {
                result = time.format();
            }
        }
        return h('span', data, result);
    },
};
</script>
