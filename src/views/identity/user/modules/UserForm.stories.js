import { action } from '@storybook/addon-actions';
import PUserForm from './UserForm';

export default {
    title: 'view/identity/user/form',
    component: PUserForm,
    parameters: {
        info: {
            summary: '',
            components: { PUserForm },
        },
    },
};

export const create = () => ({
    components: { PUserForm },
    template: '<PUserForm :visible="true" header-title="Add user" @confirm="confirm"></PUserForm>',
    setup(props, context) {
        return {
            confirm: action('confirm'),
        };
    },

});
