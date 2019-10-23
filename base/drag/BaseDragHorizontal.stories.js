import { withKnobs } from '@storybook/addon-knobs/vue';
import BaseDragHorizontal from './BaseDragHorizontal';

export default {
    title: 'Base/Drag/BaseDragHorizontal',
    component: BaseDragHorizontal,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
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


