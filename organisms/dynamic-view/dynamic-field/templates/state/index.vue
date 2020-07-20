<script lang="ts">
import _ from 'lodash';
import PStatus from '@/components/molecules/status/PStatus.vue';
import { getColor } from '@/components/organisms/dynamic-view/dynamic-field/toolset';

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
        return h(PStatus, {
            props: {
                icon: _.get(props.options, ['icon', 'image'], null),
                iconColor: getColor(_.get(props.options, ['icon', 'color'], null)),
                textColor: getColor(_.get(props.options, ['text_color'], null)),
                text: props.data,
            },
        });
    },
};
</script>
