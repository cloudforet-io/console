import { withKnobs } from '@storybook/addon-knobs/vue';
import PSignIn from '@/views/sign-in/Signin.vue';

export default {
    title: 'views/sign-in/Singin',
    component: PSignIn,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PSignIn },
        },
    },
};

export const defaultCase = () => ({
    components: { PSignIn },
    props: {
    },
    template: `<div>
        <p-sign-in>
        </p-sign-in>
    </div>`,
    setup() {

    },
});
