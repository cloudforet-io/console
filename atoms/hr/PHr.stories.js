import PHr from '@/components/atoms/hr/PHr.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';

export default {
    title: 'atoms/hr',
    component: { PHr },
    parameters: {
        info: {
            summary: 'The hr tags defines a thematic horizontal break in an HTML page',
        },
    },
};

export const DefaultCase = () => ({
    components: { PHr, PRow, PCol },
    template: `<div style="width: 50vw; height: 50vh; border: 1px dashed #415ee1">
                <p-row>
                    <p-col :col="12">
                        <h1>hello</h1>
                    </p-col>
                </p-row>
                 <p-hr/>
                <p-row>
                    <p-col :col="6">
                            <p>split</p>
                                <p-hr style="margin-top:8px; margin-bottom:8px"/> 
                            <p>split</p>
                    </p-col>
                    <p-col :col="6">
                    <div style="width:100%">
                        <p>split</p>
                            <p-hr style="margin-top:8px; margin-bottom:8px"/> 
                        <p>split</p>
                     </div>
                    </p-col>
                </p-row>
            </div>`,
});
