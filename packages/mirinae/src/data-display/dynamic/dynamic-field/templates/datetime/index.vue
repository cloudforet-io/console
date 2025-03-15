<script lang="ts">
import { h, defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import type { DatetimeTypeOptions } from '@/data-display/dynamic/dynamic-field/templates/datetime/type';
import type { DynamicFieldHandler } from '@/data-display/dynamic/dynamic-field/type';
import type { DatetimeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PLink from '@/navigation/link/PLink.vue';
import { ACTION_ICON } from '@/navigation/link/type';


dayjs.extend(utc);
dayjs.extend(tz);

export default defineComponent({
    name: 'PDynamicFieldDatetime',
    components: { PLink },
    props: {
        options: {
            type: Object as PropType<DatetimeOptions>,
            default: () => ({
                source_type: 'timestamp',
            }),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object as PropType<DatetimeTypeOptions>,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function as PropType<DynamicFieldHandler|undefined>,
            default: undefined,
        },
    },
    setup(props, { attrs }) {
        let result = '';
        // eslint-disable-next-line vue/no-setup-props-destructure
        const options: DatetimeOptions = props.options;
        const value = props.data === undefined || props.data === null ? props.options.default : props.data;

        if (value) {
            let time: Dayjs;
            if (options.source_type === 'iso8601') {
                time = dayjs(value, options.source_format);
            } else if (options.source_format === 'seconds') {
                if (typeof value === 'object') time = dayjs.unix(value.seconds);
                else time = dayjs.unix(value);
            } else {
                time = dayjs(value);
            }

            if (time.isValid()) {
                time = dayjs.tz(time, props.typeOptions?.timezone || 'UTC');
                if (options.display_format) {
                    result = time.format(options.display_format);
                } else {
                    result = time.format('YYYY-MM-DD HH:mm:ss');
                }
            }
        }

        let datetimeEl = h('span', { ...attrs }, `${options.prefix ?? ''}${result}${options.postfix ?? ''}`);

        if (options.link) {
            datetimeEl = h(PLink, {
                ...attrs,
                attrs: { href: props.options.link, actionIcon: value ? ACTION_ICON.INTERNAL_LINK : ACTION_ICON.NONE, newTab: true },
            }, [datetimeEl]);
        }

        return () => datetimeEl;
    },
});
</script>
