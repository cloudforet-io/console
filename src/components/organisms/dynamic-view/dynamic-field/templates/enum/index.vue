<script lang="ts">
import _ from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

export default {
    name: 'Enum',
    functional: true,
    components: { PDynamicField },
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
        // eslint-disable-next-line camelcase
        const option = _.get(props.view_option, [props.data], { view_type: 'text' });
        return h(PDynamicField, { props: { ...option, data: props.data } });
    },
};
</script>
