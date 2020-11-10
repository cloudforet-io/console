<script lang="ts">
import { DatetimeOptions } from '@/components/organisms/dynamic-field/type/field-schema';
import { DatetimeDynamicFieldProps } from '@/components/organisms/dynamic-field/templates/datetime/type';
import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import dayjs, {Dayjs} from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

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
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        beforeCreate: {
            type: Function,
            default: undefined,
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props, data }: {props: DatetimeDynamicFieldProps; data: any}) {
        let result = '';
        const options: DatetimeOptions = props.options;
        if (props.data) {
            let time: Dayjs;
            if (options.source_type === 'iso8601') {
                time = dayjs(props.data, options.source_format);
            } else if (options.source_format === 'seconds') {
                time = dayjs.unix(props.data);
            } else {
                time = dayjs(props.data);
            }

            time = dayjs.tz(time, props.typeOptions?.timezone || 'UTC');
            if (options.display_format) {
                result = time.format(options.display_format);
            } else {
                result = time.format('YYYY-MM-DD HH:mm:ss');
            }
        }

        let datetimeEl = h('span', data, result);


        if (options.link) {
            datetimeEl = h(PAnchor, {
                ...data,
                attrs: { href: props.options.link, target: '_blank' },
            }, [datetimeEl]);
        }

        return datetimeEl;
    },
};
</script>
