<script lang="ts">
import moment, { Moment } from 'moment';
import { DatetimeOptions, TextOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { DatetimeDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/datetime/type';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';

export default {
    name: 'PDynamicFieldDatetime',
    functional: true,
    components: { PAnchor },
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
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
    },
    render(h, { props, data }: {props: DatetimeDynamicFieldProps; data: any}) {
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

            time = moment.tz(time, props.typeOptions?.timezone || 'UTC');
            if (options.display_format) {
                result = time.format(options.display_format);
            } else {
                result = time.format('YYYY-MM-DD HH:mm:ss');
            }
        }
        if (props.options.link) {
            return h(PAnchor, {
                ...data,
                attrs: { href: (props.options as TextOptions).link, target: '_blank' },
            }, result);
        }
        return h('span', data, result);
    },
};
</script>
