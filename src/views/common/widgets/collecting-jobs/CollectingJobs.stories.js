import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PCollectingJobs from './CollectingJobs.vue';

export default {
    title: 'views/widgets/CollectingJobs',
    component: PCollectingJobs,
    parameters: {
        info: {
            summary: '',
            components: { PCollectingJobs },
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
    components: { PCollectingJobs },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PCollectingJobs v-bind="$props"></PCollectingJobs>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
