<script lang="ts">
import _ from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

export default {
    name: 'PDynamicFieldEnum',
    functional: true,
    components: { PDynamicField },
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
    render(h, { props }) {
        // eslint-disable-next-line camelcase
        const option = _.get(props.options, [props.data], { view_type: 'text' });
        return h(PDynamicField, { props: { ...option, data: props.data } });
    },
};
</script>
