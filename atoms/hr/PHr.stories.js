import PHr from '@/components/atoms/hr/PHr.vue';

export default {
    title: 'Layouts/Divider',
    component: { PHr },
    parameters: {
        info: {
            summary: 'The hr tags defines a thematic horizontal break in an HTML page',
        },
    },
};

export const divider = () => ({
    components: { PHr },
    template: `
        <div style="width: 50vw; height: 50vh; border: 1px dashed #415ee1">
            <h1>hello</h1>
            <p-hr/>
            <div class="grid grid-cols-2">
                <div class="col-span-1">
                    <p>split</p>
                    <p-hr style="margin-top:8px; margin-bottom:8px"/>
                    <p>split</p>
                </div>
                <div class="col-span-1">
                    <p>split</p>
                    <p-hr style="margin-top:8px; margin-bottom:8px"/>
                    <p>split</p>
                </div>
            </div>
        </div>`,
});
