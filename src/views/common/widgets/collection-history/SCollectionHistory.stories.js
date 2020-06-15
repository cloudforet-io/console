import {
    toRefs, reactive,
} from '@vue/composition-api';
import SCollectionHistory from '@/views/common/widgets/collection-history/SCollectionHistory.vue';

export default {
    title: 'views/widgets/CollectionHistory',
    component: SCollectionHistory,
    parameters: {
        info: {
            summary: '',
            components: { SCollectionHistory },
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
    components: { SCollectionHistory },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <SCollectionHistory v-bind="$props"></SCollectionHistory>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
