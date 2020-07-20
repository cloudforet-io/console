import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PLoadingButton from './PLoadingButton.vue';

export default {
    title: 'molecules/buttons/LoadingButton',
    component: PLoadingButton,
    parameters: {
        info: {
            summary: '',
            components: { PLoadingButton },
        },
        knobs: { escapeHTML: false },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({
    loading: {
        default: boolean('loading', true),
    },
    disabled: {
        default: boolean('disabled', false),
    },
    buttonBind: {
        default: object('buttonBind', { styleType: 'primary-dark' }),
    },
});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PLoadingButton },
    props: getProps(),
    template: `
    <div style="width: 80vw;">
        <PLoadingButton v-bind="$props">Loading Button</PLoadingButton>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
