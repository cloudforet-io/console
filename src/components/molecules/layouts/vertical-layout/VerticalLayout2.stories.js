import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PVerticalLayout2 from './VerticalLayout2.vue';

export default {
    title: 'test/VerticalLayout2',
    component: PVerticalLayout2,
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: { PVerticalLayout2 },
    template: '<p-vertical-layout2 ></p-vertical-layout2>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
