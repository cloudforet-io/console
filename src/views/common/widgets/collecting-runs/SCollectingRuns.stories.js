import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
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

const getState = (props, context) => {
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
