<script lang="ts">
import _ from 'lodash';
import PDictList from '@/components/molecules/lists/DictList.vue';

export default {
    name: 'PDynamicFieldDict',
    functional: true,
    components: { PDictList },
    props: {
        // eslint-disable-next-line camelcase,vue/prop-name-casing
        view_option: {
            type: Object,
            default: () => {},
        },
        data: {
            type: Object,
            required: true,
        },
    },
    render(h, { props }) {
        return h(PDictList, {
            props: {
                dict: props.data,
            },
        });
    },
};
</script>
