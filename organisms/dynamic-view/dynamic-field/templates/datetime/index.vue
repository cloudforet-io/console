<script lang="ts">
import { DateTime as dt } from 'luxon';

import { getTimezone } from '@/lib/util';

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
            type: [String, Object, Array, Boolean, Number],
            required: true,
        },
    },
    render(h, { props, data }) {
        let result:String = '';
        if (props.data) {
            let time:dt;
            if (props.view_option.source_type === 'iso861') {
                if (props.view_option.source_format) {
                    time = dt.fromFormat(props.data, props.view_option.source_format);
                } else {
                    time = dt.fromISO(props.data);
                }
            } else if (props.view_option.source_format === 'seconds') {
                time = dt.fromSeconds(Number(props.data));
            } else {
                time = dt.fromISO(props.data);
            }

            time = time.setZone(getTimezone());
            if (props.view_option.display_format) {
                result = time.toFormat(props.view_option.display_format);
            } else {
                result = time.toFormat('yyyy-LL-dd HH:mm:ss'); // 'yyyy-LL-dd HH:mm:ss ZZZZ' For display Timezone
            }
        }
        return h('span', data, result);
    },
};
</script>
