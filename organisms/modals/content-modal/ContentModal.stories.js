import { number, select } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import PButton from '../../../atoms/buttons/Button.vue';
import { autoProps } from '../../../../setup/storybook-util';
import { sizeMapping } from '../../../molecules/modals/ModalMapping';
import PContentModal from './ContentModal.vue';
import PModal from '../../../molecules/modals/Modal.vue';

export default {
    title: 'organisms/content-modal',
    component: PContentModal,
    parameters: {
        info: {
            summary: '',
            components: { PContentModal },
        },
        centered: { disable: true },
    },
};

const data = {
    visible: true,
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
};


export const modal = () => ({
    components: { PContentModal },
    template: `
<p-content-modal
    ref="modal"
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    :headerVisible="headerVisible"
    :bodyVisible="bodyVisible"
    :footerVisible="footerVisible"
    @shown="shown"
    @hidden="hidden"
    >
    <template #header><h3>This is Header</h3></template>
    <template #body>
        <p>{{lorem}}</p> 
    </template>  
    <template #footer>this is footer</template>
    
</p-content-modal>`,
    data() {
        return {
            ...data,
        };
    },
    mounted() {
        this.$refs.modal.show();
    },
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        size: {
            default: select('size', [null, ...Object.keys(sizeMapping)]),
        },
        ...autoProps(PContentModal, [
            { name: 'headerVisible' },
            { name: 'bodyVisible' },
            { name: 'footerVisible' },
        ]),
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' },

        ]),
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        },
    },
});

export const fade = () => ({
    components: { PContentModal, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">모달 띄우기</p-button>
<p-content-modal
    ref="modal" 
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    :fade="fade"
    :keyboard="keyboard"
    :backdrop="backdrop"
    :headerVisible="headerVisible"
    :bodyVisible="bodyVisible"
    :footerVisible="footerVisible"
    @shown="shown"
    @hidden="hidden"
    >
    <template #header><h3>This is Header</h3></template>
    <template>
        <p>{{lorem}}</p> 
    </template>  
    <template #footer><p-button styleType="danger" @click="close">닫기</p-button></template>
</p-content-modal>
</div>`,
    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        size: {
            default: select('size', [null, ...Object.keys(sizeMapping)]),
        },
        ...autoProps(PContentModal, [
            { name: 'headerVisible' },
            { name: 'bodyVisible' },
            { name: 'footerVisible' },
        ]),
        ...autoProps(PModal, [
            { name: 'scrollable' },
            { name: 'centered' },
            { name: 'backdrop' },
            { name: 'fade' },
            { name: 'keyboard' },
        ]),
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        },
    },
    methods: {
        click() {
            this.$refs.modal.show();
        },
        close() {
            this.$refs.modal.hide();
        },
        ...actions,
    },
});
