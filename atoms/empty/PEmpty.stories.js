import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';

export default {
    title: 'atoms/Empty',
    component: PEmpty,
    parameters: {
        info: {
            summary: '',
            components: { PEmpty },
        },
    },
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: { PEmpty },
    template: '<p-empty>No Items</p-empty>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
