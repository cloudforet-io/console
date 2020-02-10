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
        },
    },
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    template: '',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
