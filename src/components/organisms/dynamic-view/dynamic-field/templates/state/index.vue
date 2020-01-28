<script lang="ts">
import _ from 'lodash';
import PStatus from '@/components/molecules/status/Status.vue';

export default {
    name: 'State',
    functional: true,
    components: { PStatus },
    props: {
        viewOption: {
            type: Object,
            default: () => {},
        },
        data: {
            type: String,
        },
    },
    render(h, { props }) {
        return h(PStatus, {
            props: {
                icon: _.get(props.viewOption, ['icon', 'image'], null),
                iconColor: _.get(props.viewOption, ['icon', 'color'], null),
                textColor: _.get(props.viewOption, ['text_color'], null),
                text: props.data,
            },
        });
    },
};
</script>
