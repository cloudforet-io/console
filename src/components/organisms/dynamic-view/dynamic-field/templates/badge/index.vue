<script lang="ts">
import _ from 'lodash';
import PBadge from '@/components/atoms/badges/Badge.vue';

export default {
    name: 'PDynamicFieldBadge',
    functional: true,
    components: { PBadge },
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
        return h(PBadge, {
            props: {
                backgroundColor: _.get(props.view_option, ['background_color'], null),
                textColor: _.get(props.view_option, ['text_color'], null),
            },
        },
        props.data);
    },
};
</script>
