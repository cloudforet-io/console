import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import { action } from '@storybook/addon-actions';
import { autoProps } from '@sb/storybook-util';

export default {
    title: 'organisms/layouts/Horizontal-layout',
    component: PHorizontalLayout,
};

export const defaultCase = () => ({
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
    methods: {
        start: action('start'),
        move: action('move'),
        stop: action('stop'),
    },
});
