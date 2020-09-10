import {
    toRefs, reactive,
} from '@vue/composition-api';
import CollectorRuns from '@/views/common/widgets/collector-runs/CollectorRuns.vue';

export default {
    title: 'views/widgets/CollectingRuns',
    component: CollectorRuns,
    parameters: {
        info: {
            summary: '',
            components: { CollectorRuns },
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
    components: { CollectorRuns },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <collector-runs v-bind="$props"></collector-runs>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
