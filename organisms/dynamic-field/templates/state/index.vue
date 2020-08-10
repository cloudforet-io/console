<script lang="ts">
import { get } from 'lodash';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { getColor } from '@/components/organisms/dynamic-field/PDynamicField.toolset';
import { StatusProps } from '@/components/molecules/status/type';
import { StateOptions } from '@/components/organisms/dynamic-field/type';

export default {
    name: 'PDynamicFieldState',
    functional: true,
    components: { PStatus },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: '',
        },
    },
    render(h, { props }) {
        const options: StateOptions = props.options;
        const statusProps: StatusProps = {
            icon: get(options, ['icon', 'image'], null),
            iconColor: getColor(get(options, ['icon', 'color'], null)),
            textColor: getColor(get(options, ['text_color'], null)),
            text: props.data,
        };
        return h(PStatus, {
            props: statusProps,
        });
    },
};
</script>
