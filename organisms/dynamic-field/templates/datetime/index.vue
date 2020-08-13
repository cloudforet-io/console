<script lang="ts">
import { DateTime as dt } from 'luxon';
import { DatetimeOptions } from '@/components/organisms/dynamic-field/type';
import moment, { Moment } from 'moment';

export default {
    name: 'PDynamicFieldDatetime',
    functional: true,
    props: {
        options: {
            type: Object,
            default: () => ({
                // eslint-disable-next-line camelcase
                source_type: 'timestamp',
            }),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            required: true,
        },
        extra: {
            type: Object,
            default: () => ({}),
        },
    },
    render(h, { props, data }) {
        let result = '';
        const options: DatetimeOptions = props.options;
        if (props.data) {
            let time: Moment;
            if (options.source_type === 'iso8601') {
                time = moment(props.data, options.source_format);
            } else if (options.source_format === 'seconds') {
                time = moment.unix(props.data);
            } else {
                time = moment(props.data);
            }

            time = moment.tz(time, props.extra.timezone || 'UTC');
            if (options.display_format) {
                result = time.format(options.display_format);
            } else {
                result = time.format('YYYY-MM-DD HH:mm:ss');
            }
        }
        return h('span', data, result);
    },
};
</script>
