import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PVerticalLayout from './VerticalLayout.vue';

export default {
    title: 'VerticalLayout',
    component: PVerticalLayout,
    parameters: {
        info: {
            components: { PVerticalLayout },
        },
    },
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: { PVerticalLayout },
    template: '<PVerticalLayout ></PVerticalLayout>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
