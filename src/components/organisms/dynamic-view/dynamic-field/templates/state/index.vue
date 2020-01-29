<script lang="ts">
import _ from 'lodash';
import PStatus from '@/components/molecules/status/Status.vue';

export default {
    name: 'PDynamicFieldState',
    functional: true,
    components: { PStatus },
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
    render(h, { props }) {
        return h(PStatus, {
            props: {
                icon: _.get(props.view_option, ['icon', 'image'], null),
                iconColor: _.get(props.view_option, ['icon', 'color'], null),
                textColor: _.get(props.view_option, ['text_color'], null),
                text: props.data,
            },
        });
    },
};
</script>
