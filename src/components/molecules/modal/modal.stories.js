import PModal from './modal';
import { number } from '@storybook/addon-knobs/vue';
import { autoProps } from '../../../setup/storybook-util';
import { action } from '@storybook/addon-actions';
import  faker from 'faker';
export default {
    title: 'molecules/modal',
    component: PModal,
    parameters: {
        info: {
            summary: '',
            components: { PModal }
        },
        knobs:{
            escapeHTML:false
        }
    }
};
const actions = {
    change:action('change')
};
const data = {
    visible:true
};

export const modal = () => ({
    components: { PModal },
    template: `
<p-modal
    ref="modal"
    v-model="visible" 
    :scrollable="scrollable" 
    :centered="centered"
    >
    <p style="min-width: 300px;min-height: 200px;">{{lorem}}</p>
</p-modal>
`,
    data() {
        return {
            ...data
        };
    },
    props: {
        loremLength:{
            default:number('loremLength',10, { range:true,min:1,max:80,step:10 })
        },
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' }
        ]),
    },
    computed:{
        lorem(){
            return faker.lorem.lines(this.loremLength);
        }
    },
    methods: {
        ...actions,
        click(event){
            console.log(this.visible);
            if (!this.visible){
                this.$refs.modal.show();
            }
        }
    }
});


