import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';


export default {
    title: 'Layouts/Pane Layout',
    component: PPaneLayout,
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6980%3A155646',
        },
    },
};


export const paneLayout = () => ({
    components: { PPaneLayout },
    template: `
        <p-pane-layout v-bind="$props" style="height: 100px; width: 200px; display: flex; justify-content: center; align-items: center;">
            <h3 style="">This is default slot</h3>
        </p-pane-layout>`,
});
