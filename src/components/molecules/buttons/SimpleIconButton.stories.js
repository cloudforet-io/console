import PSimpleIconButton from './SimpleIconButton.vue';
import md from './SimpleIconButton.md';
import {autoProps} from '@/setup/storybook-util';
import {toRefs, reactive, ref, computed} from '@vue/composition-api';
import {action} from '@storybook/addon-actions';

export default {
    title: '$3Title$',
    component: PSimpleIconButton,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: {PSimpleIconButton}
        }
    }
};
const actions = {};
const getState = () => reactive({});
export const defaultCase = () => ({
    components: {PSimpleIconButton},
    template: "<PSimpleIconButton $END$></PSimpleIconButton>",
    setup(props, context) {
        return {
            ...actions,
        };
    },
});