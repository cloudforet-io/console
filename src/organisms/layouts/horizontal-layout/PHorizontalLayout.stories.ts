import PHorizontalLayout from '@/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import { action } from '@storybook/addon-actions';
import { autoProps } from '@/util/storybook-util';

export default {
    title: 'Layouts/HorizontalLayout',
    component: PHorizontalLayout,
};

export const horizontalLayout = () => ({
    components: { PHorizontalLayout },
    props: {
        ...autoProps(PHorizontalLayout),
    },
    template: `<div style="border: 1px solid red;">
                   <p-horizontal-layout :height="height" 
                                      :line="line" 
                                      :left-width="leftWidth"
                                      :min-left-width="minLeftWidth"
                                      :max-left-width="maxLeftWidth"
                                      :total-width="totalWidth"
                                      :hide-f-n-b="hideFNB"
                                      @start="start" 
                                      @move="move" 
                                      @stop="stop" />
                </div>`,
    setup() {
        return {
            start: action('start'),
            move: action('move'),
            stop: action('stop'),
        };
    },
});
