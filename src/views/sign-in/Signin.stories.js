import PSignin from './Signin.vue';
import md from './Signin.md';
import {autoProps} from '@/setup/storybook-util';
import {toRefs, reactive, ref, computed} from '@vue/composition-api';
import {action} from '@storybook/addon-actions';

export default {
    title: '$3Title$',
    component: PSignin,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: {PSignin}
        }
    }
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: {PSignin},
    template: "<PSignin $END$></PSignin>",
    setup(props, context) {
        return {
            ...actions,
        };
    },
});