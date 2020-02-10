import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import PNewVerticalLayout from './NewVerticalLayout.vue';

export default {
    title: 'New-vertical-layout',
    component: PNewVerticalLayout,
    parameters: {
        info: {
            components: { PNewVerticalLayout },
        },
    },
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: { PNewVerticalLayout },
    template: '<PNewVerticalLayout ></PNewVerticalLayout>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
