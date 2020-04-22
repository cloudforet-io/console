<script lang="ts">
import _ from 'lodash';
import PBadge from '@/components/atoms/badges/Badge.vue';

export default {
    name: 'PDynamicFieldBadge',
    functional: true,
    components: { PBadge },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            required: true,
        },
    },
    render(h, { props }) {
        return h(PBadge, {
            props: {
                backgroundColor: _.get(props.options, ['background_color'], null),
                textColor: _.get(props.options, ['text_color'], null),
            },
        },
        props.data);
    },
};
</script>
