import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDailyUpdates from './DailyUpdates.vue';

export default {
    title: 'views/widgets/DailyUpdates',
    component: PDailyUpdates,
    parameters: {
        info: {
            summary: '',
            components: { PDailyUpdates },
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
    components: { PDailyUpdates },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PDailyUpdates v-bind="$props"></PDailyUpdates>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
