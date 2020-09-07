import {
    toRefs, reactive,
} from '@vue/composition-api';
import PDailyUpdates from './DailyUpdates_new.vue';

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

const getState = () => {
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
