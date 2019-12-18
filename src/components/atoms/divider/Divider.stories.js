import PDivider from '@/components/atoms/divider/Divider';


export default {
    title: 'atoms/divider',
    component: PDivider,
    parameters: {
        info: {
            summary: '',
            components: { PDivider },
        },
    },
};
const actions = {};
const data = {};

export const defaultCase = () => ({
    components: { PDivider },
    template: `
<div style="width: 50vw; height: 50vh; border: 1px dashed #415ee1">
    <div class="row">
        <div class="col-12">
            <h>hellow</h>
        </div>
        <div class="col-12">
            <PDivider/>
        </div>
        <div class="col-12">
            <p>bottom of the divider</p>
        </div>
    </div>
    <div class="row">
        <div class="col-6">
            <p>split</p>
            <PDivider/> 
            <p>split</p>
        </div>
        <div class="col-6">
            <p>split</p>
            <PDivider/>
            <p>split</p>
        </div>
    </div>
</div>
    `,
});
