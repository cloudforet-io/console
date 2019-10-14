import {withKnobs, number} from '@storybook/addon-knobs/vue';
import BaseChart from './BACT_001_BaseChart.vue';

export default {
    title:'Base/BaseChart',
    component: BaseChart,
    decorators:[withKnobs],
};

export const chart = ()=>({
    components:{BaseChart},
    props:{
        width:{
            default:number('width',500,'사이즈')
        },
        height:{
            default: number('height',300,'사이즈')
        }
    },
    template:`<BaseChart :width="width" :height="height"></BaseChart>`,
    data(){
        return{

        };
    },
});

