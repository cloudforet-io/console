import {
    toRefs, reactive,
} from '@vue/composition-api';
import { withKnobs } from '@storybook/addon-knobs';
import PToggleButton from './PToggleButton.vue';

export default {
    title: 'Inputs/Buttons/Toggle Button',
    component: PToggleButton,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5131%3A127311',
        },
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
