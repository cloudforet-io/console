import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import PPaneLayout from './PaneLayout';


export default {
    title: 'molecules/layouts/PaneLayout',
    component: PPaneLayout,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PPaneLayout },
    props: {
        ...autoProps(PPaneLayout),
    },
    template: `<PPaneLayout v-bind="$props" :style="{height: '100px', 
                                                      width: '200px'}"/>`,
});
