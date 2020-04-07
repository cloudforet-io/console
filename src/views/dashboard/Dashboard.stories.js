import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PDashboard from './Dashboard.new.vue';

export default {
    title: 'views/dashboard/renewal',
    component: PDashboard,
    parameters: {
        info: {
            summary: '',
            components: { PDashboard },
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
    components: { PDashboard },
    props: getProps(),
    template: `
    <div style="width: 100vw;">
        <PDashboard v-bind="$props"></PDashboard>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
