import {
    toRefs, reactive,
} from '@vue/composition-api';
import PToggleButton from './PToggleButton.vue';

export default {
    title: 'Inputs/Buttons/ToggleButton',
    component: PToggleButton,
    parameters: {
        info: {
            summary: '',
            components: { PToggleButton },
        },
        knobs: { escapeHTML: false },
    },
};

const getState = (props, context) => {
    const state = reactive({});
    return state;
};

export const toggleButton = () => ({
    components: { PToggleButton },
    template: `
        <div style="width: 80vw;">
            <p-toggle-button :theme="'secondary'"
                             :height="20"
            />
        </div> `,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
