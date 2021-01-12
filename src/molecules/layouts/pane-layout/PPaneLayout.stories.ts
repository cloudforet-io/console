import { withKnobs } from '@storybook/addon-knobs';
import { autoProps } from '@/util/storybook-util';
import PPaneLayout from '@/molecules/layouts/pane-layout/PPaneLayout.vue';


export default {
    title: 'Layouts/PaneLayout',
    component: PPaneLayout,
    decorators: [withKnobs],
};


export const paneLayout = () => ({
    components: { PPaneLayout },
    props: {
        ...autoProps(PPaneLayout),
    },
    template: `
        <PPaneLayout v-bind="$props" style="height: 100px; width: 200px; display: flex; justify-content: center; align-items: center;">
            <h3 style="">This is default slot</h3>
        </PPaneLayout>`,
});
