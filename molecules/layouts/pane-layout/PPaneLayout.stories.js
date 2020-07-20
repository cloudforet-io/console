import { withKnobs } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PPaneLayout from '@/components/molecules/layouts/pane-layout/PPaneLayout.vue';


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
    template: `<PPaneLayout v-bind="$props" style="height: 100px; width: 200px; display: flex; justify-content: center; align-items: center;">
        <h3 style="">This is default slot</h3>
    </PPaneLayout>`,
});
