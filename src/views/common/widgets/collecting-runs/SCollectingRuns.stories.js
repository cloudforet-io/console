import {
    toRefs, reactive,
} from '@vue/composition-api';
import PCollectingRuns from '@/views/common/widgets/collecting-runs/SCollectingRuns.vue';

export default {
    title: 'views/widgets/CollectingRuns',
    component: PCollectingRuns,
    parameters: {
        info: {
            summary: '',
            components: { PCollectingRuns },
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

const getState = () => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PCollectingRuns },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PCollectingRuns v-bind="$props"></PCollectingRuns>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
