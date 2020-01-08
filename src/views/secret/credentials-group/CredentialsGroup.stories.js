import { toRefs, reactive } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PCredentialsGroup from './CredentialsGroup.template.vue';

export default {
    title: 'view/secret/credentialsGroup',
    component: PCredentialsGroup,
    parameters: {
        info: {
            summary: '',
            components: { PCredentialsGroup },
        },
    },
};
const actions = {};
export const defaultCase = () => ({
    components: { PCredentialsGroup },
    template: '<PCredentialsGroup ></PCredentialsGroup>',
    setup(props, context) {
        return {
            ...actions,
        };
    },
});
