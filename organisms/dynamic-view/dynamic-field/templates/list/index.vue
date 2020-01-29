<script lang="ts">
import _ from 'lodash';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';

export default {
    name: 'PDynamicFieldList',
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
        const option = _.get(props.view_option, ['item'], {});
        const children = props.data.map(value => h(PDynamicField, { props: { ...option, data: value } }));
        return h('span', children);
    },
};
</script>
