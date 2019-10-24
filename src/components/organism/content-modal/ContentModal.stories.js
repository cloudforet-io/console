import PContentModal from './ContentModal';
import PModal from '../../molecules/modals/Modal';
import PButton from '../../atoms/buttons/Button';
import { number,select } from '@storybook/addon-knobs/vue';
import { autoProps } from '../../../setup/storybook-util';
import faker from 'faker';
import { size_mapping } from '../../molecules/modals/ModalMapping';

export default {
    title: 'organism/content-modal',
    component: PContentModal,
    parameters: {
        info: {
            summary: '',
            components: { PContentModal }
        }
    }
};

const data = {
    visible: true
};


export const modal = () => ({
    components: { PContentModal },
    template: `
<PContentModal
    ref="modal"
    v-model="visible" 
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    >
    <template #header><h3>This is Header</h3></template>
    <template #body>
        <p>{{lorem}}</p> 
    </template>  
    <template #footer>this is footer</template>
    
</PContentModal>`,
    data() {
        return {
            ...data
        };
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, { range: true, min: 1, max: 80, step: 10 })
        },
        size:{
            default: select('size',[null, ...Object.keys(size_mapping)])
        },
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' }
        ])
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        }
    }
});

export const fade = () => ({
    components: { PContentModal, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">모달 띄우기</p-button>
<p-content-modal
    ref="modal"
    v-model="visible" 
    :fade="fade" 
    :scrollable="scrollable" 
    :centered="centered"
    >
    <template #header><h3>This is Header</h3></template>
    <template #body>
        <p>{{lorem}}</p> 
    </template>  
    <template #footer><p-button styleType="danger" @click="close">닫기</p-button></template>
</p-content-modal>
</div>`,
    data() {
        return { visible: false };
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, { range: true, min: 1, max: 80, step: 10 })
        },
        size: {
            default: select('size', [null, ...Object.keys(size_mapping)])
        },
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' },
            { name: 'fade' }
        ])
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        }
    },
    methods: {
        click(event) {
            this.visible = true;
        },
        close(event){
            this.visible = false;
        }
    }
});