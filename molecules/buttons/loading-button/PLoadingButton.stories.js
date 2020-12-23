import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PLoadingButton from './PLoadingButton.vue';

export default {
    title: 'Others/Buttons(old)/LoadingButton',
    component: PLoadingButton,
    parameters: {
        info: {
            summary: '',
            components: { PLoadingButton },
        },
        knobs: { escapeHTML: false },
    },
};

export const defaultCase = () => ({
    components: { PLoadingButton },
    props: {
        loading: {
            default: boolean('loading', true),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        buttonBind: {
            default: object('buttonBind', { styleType: 'primary-dark' }),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p-loading-button
                    :loading="loading"
                    :disabled="disabled"
                    :button-bind="buttonBind"
            >
                Loading Button
            </p-loading-button>
        </div>`,
});
