import { withKnobs, text, boolean, number } from '@storybook/addon-knobs/vue';
import BaseDragHorizontal from './BADG_002_BaseDragHorizontal';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Base/Drag/BaseDragHorizontal',
    component: BaseDragHorizontal,
    decorators: [withKnobs],
    parameters:{
        info: {
            summary: ``,
            components: { BaseDragHorizontal }
        }
    }
};

export const drag = () => ({
    name: 'drag',
    components: { BaseDragHorizontal },
    template: '<BaseDragHorizontal ></BaseDragHorizontal>',
    data() {
        return {};
    }
});


