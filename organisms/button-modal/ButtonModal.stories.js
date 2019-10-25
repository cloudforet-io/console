import { number, select } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import PContentModal from './ButtonModal.vue';
import PModal from '../../molecules/modals/Modal.vue';
import PButton from '../../atoms/buttons/Button.vue';
import PButtonModal from './ButtonModal.vue';
import { autoProps } from '../../../setup/storybook-util';
import { sizeMapping } from '../../molecules/modals/ModalMapping';

export default {
    title: 'organisms/button-modal',
    component: PButtonModal,
    parameters: {
        info: {
            summary: '',
            components: { PButtonModal },
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
    cancel: action('cancel'),
    close: action('close'),
    confirm: action('confirm'),

};

const pbmProps = [
    { name: 'headerTitle', default: 'this is title' },
    { name: 'headerCloseButtonVisible' },
    { name: 'footerCancelButtonVisible' },
    { name: 'footerConfirmButtonVisible' },
    { name: 'hideOnCancel' },
];
const pcmProps = [
    { name: 'headerVisible' },
    { name: 'bodyVisible' },
    { name: 'footerVisible' },
];
const pmProps = [
    { name: 'scrollable' },
    { name: 'centered' },
    { name: 'backdrop' },
    { name: 'fade' },
    { name: 'keyboard' },
];
export const modal = () => ({
    components: { PButtonModal, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">모달 띄우기</p-button>
<p-button-modal
    ref="modal"
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    :fade="fade"
    :keyboard="keyboard"
    :backdrop="backdrop"
    :headerTitle="headerTitle"
    :headerVisible="headerVisible"
    :bodyVisible="bodyVisible"
    :footerVisible="footerVisible"
    :headerCloseButtonVisible="headerCloseButtonVisible"
    :footerCancelButtonVisible="footerCancelButtonVisible"
    :footerConfirmButtonVisible="footerConfirmButtonVisible"
    :footerConfirmButtonBind="ConfirmButtonBind"
    @shown="shown"
    @hidden="hidden"
    @cancel="cancel"
    @close="close"
    @confirm="confirm"
    >
    <template v-slot="body">
        <p>{{lorem}}</p> 
    </template>  
    
</p-button-modal>
</div>`,
    data() {
        return {
            ...data,
        };
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
        okDisabled: {
            default: boolean('ok disabled', false),
        },
        ...autoProps(PButtonModal, pbmProps),
        ...autoProps(PContentModal, pcmProps),
        ...autoProps(PModal, pmProps),
    },
    computed: {
        lorem() {
            return faker.lorem.lines(this.loremLength);
        },
        ConfirmButtonBind() {
            return {
                styleType: 'primary',
                disabled: this.okDisabled,
            };
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
