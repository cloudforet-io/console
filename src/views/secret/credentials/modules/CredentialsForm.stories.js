import { action } from '@storybook/addon-actions';
import PCredentialsForm from '@/views/secret/credentials/modules/CredentialsForm.vue';

export default {
    title: 'view/secret/credentials/form',
    component: PCredentialsForm,
    parameters: {
        info: {
            summary: '',
            components: { PCredentialsForm },
        },
    },
};

export const create = () => ({
    components: { PCredentialsForm },
    template: '<PCredentialsForm :visible="true" header-title="Add user" @confirm="confirm"></PCredentialsForm>',
    setup(props, context) {
        return {
            confirm: action('confirm'),
        };
    },

});
