import PDivider from '@/layouts/divider/PDivider.vue';

export default {
    title: 'Layouts/Divider',
    component: { PDivider },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6980%3A163403',
        },
    },
};

export const divider = () => ({
    components: { PDivider },
    template: `
        <div style="width: 50vw; height: 50vh; border: 1px dashed #415ee1">
            <h1>The hr tags defines a thematic horizontal break in an HTML page</h1>
            <p-divider/>
            <div class="grid grid-cols-2">
                <div class="col-span-1">
                    <p>split</p>
                    <p-divider style="margin-top:8px; margin-bottom:8px"/>
                    <p>split</p>
                </div>
                <div class="col-span-1">
                    <p>split</p>
                    <p-divider style="margin-top:8px; margin-bottom:8px"/>
                    <p>split</p>
                </div>
            </div>
        </div>`,
});
