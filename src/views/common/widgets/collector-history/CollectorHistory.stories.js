import {
    toRefs, reactive,
} from '@vue/composition-api';
import CollectorHistory from '@/views/common/widgets/collector-history/CollectorHistory.vue';

export default {
    title: 'views/widgets/CollectionHistory',
    component: CollectorHistory,
    parameters: {
        info: {
            summary: '',
            components: { CollectorHistory },
        },
        knobs: { escapeHTML: false },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { CollectorHistory },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <collector-history v-bind="$props"></collector-history>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
