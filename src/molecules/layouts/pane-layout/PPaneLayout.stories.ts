import PPaneLayout from '@/molecules/layouts/pane-layout/PPaneLayout.vue';


export default {
    title: 'Layouts/PaneLayout',
    component: PPaneLayout,
};


export const paneLayout = () => ({
    components: { PPaneLayout },
    template: `
        <p-pane-layout v-bind="$props" style="height: 100px; width: 200px; display: flex; justify-content: center; align-items: center;">
            <h3 style="">This is default slot</h3>
        </p-pane-layout>`,
});
