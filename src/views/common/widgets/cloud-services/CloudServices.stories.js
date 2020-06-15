import {
    toRefs, reactive,
} from '@vue/composition-api';
import PCloudServices from './CloudServices.vue';

export default {
    title: 'views/widgets/CloudServices',
    component: PCloudServices,
    parameters: {
        info: {
            summary: '',
            components: { PCloudServices },
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
    components: { PCloudServices },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PCloudServices v-bind="$props"></PCloudServices>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
