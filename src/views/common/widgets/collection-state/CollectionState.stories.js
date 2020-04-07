import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PCollectionState from './CollectionState.vue';

export default {
    title: 'views/widgets/CollectionState',
    component: PCollectionState,
    parameters: {
        info: {
            summary: '',
            components: { PCollectionState },
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
    components: { PCollectionState },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PCollectionState v-bind="$props"></PCollectionState>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
