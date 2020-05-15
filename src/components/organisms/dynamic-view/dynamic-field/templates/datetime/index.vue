<script lang="ts">
import { DateTime as dt } from 'luxon';

import { getTimezone } from '@/lib/util';

export default {
    name: 'PDynamicFieldDatetime',
    functional: true,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            required: true,
        },
    },
    render(h, { props, data }) {
        let result = '';
        if (props.data) {
            let time: dt;
            if (props.options.source_type === 'iso861') {
                if (props.options.source_format) {
                    time = dt.fromFormat(props.data, props.options.source_format);
                } else {
                    time = dt.fromISO(props.data);
                }
            } else if (props.options.source_format === 'seconds') {
                time = dt.fromSeconds(Number(props.data));
            } else {
                time = dt.fromISO(props.data);
            }

            time = time.setZone(getTimezone());
            if (props.options.display_format) {
                result = time.toFormat(props.options.display_format);
            } else {
                result = time.toFormat('yyyy-LL-dd HH:mm:ss'); // 'yyyy-LL-dd HH:mm:ss ZZZZ' For display Timezone
                // result = time.toFormat('yyyy-LL-dd HH:mm:ss ZZZZ'); // 'yyyy-LL-dd HH:mm:ss ZZZZ' For display Timezone
            }
        }
        return h('span', data, result);
    },
};
</script>
