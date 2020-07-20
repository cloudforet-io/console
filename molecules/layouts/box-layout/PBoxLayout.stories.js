import { withKnobs, select } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PBoxLayout from '@/components/molecules/layouts/box-layout/PBoxLayout.vue';


export default {
    title: 'molecules/layouts/BoxLayout',
    component: PBoxLayout,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { PBoxLayout },
    props: {
        ...autoProps(PBoxLayout, [
            { boxStyle: { default: select('boxStyle', ['primary4']) } },
        ]),
    },
    template: `
<div  style="height: 100vh; width: 100vw; background-color: white; position: relative;">
    <p-box-layout v-bind="$props"   
                  style="
                     height: 300px; 
                     width: 400px; 
                     position: absolute; 
                     top: 50%; 
                     left: 50%; 
                     transform: translate(-50%, -50%);
                 "
     />                
</div>`,
});
