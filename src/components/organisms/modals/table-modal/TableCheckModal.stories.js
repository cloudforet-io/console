import { number, select, text } from '@storybook/addon-knobs/vue';
import faker from 'faker';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import PModal from '../../../molecules/modals/Modal';
import PButton from '../../../atoms/buttons/Button';
import PTableCheckModel from './TableCheckModal';
import { autoProps } from '../../../../setup/storybook-util';
import { sizeMapping } from '../../../molecules/modals/ModalMapping';

export default {
    title: 'organisms/modals/table-check-modal',
    component: PTableCheckModel,
    parameters: {
        info: {
            summary: '',
            components: { PTableCheckModel },
        },
        centered: { disable: true },
    },
};

const data = {
    fields: ['name', 'phone', 'email'],
    sortable: true,
    sortBy: null,
    sortDesc: true,
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
    cancel: action('cancel'),
    close: action('close'),
    confirm: action('confirm'),

};

const ptcmProps = [
    { name: 'headerTitle', default: 'this is title' },
    { name: 'subTitle', default: 'this is sub title' },
];

const pmProps = [
    { name: 'scrollable' },
    { name: 'centered' },
    { name: 'backdrop' },
    { name: 'fade' },
    { name: 'keyboard' },
];

const mockupMixin = {
    methods: {
        getUser() {
            return {
                name: faker.name.firstName(),
                phone: faker.phone.phoneNumberFormat(),
                email: faker.internet.email(),
            };
        },
    },
    computed: {
        items() {
            const data = [];
            for (let step = 0; step < 5; step++) {
                data.push(this.getUser());
            }
            return data;
        },
    },
};

export const modal = () => ({
    components: { PTableCheckModel, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">모달 띄우기</p-button>
<PTableCheckModel
    ref="modal"
    :scrollable="scrollable" 
    :centered="centered"
    :size="size"
    :fade="fade"
    :keyboard="keyboard"
    :backdrop="backdrop"
    :headerTitle="headerTitle"
    :subTitle="subTitle"
    :fields="fields"
    :items="items"
    
    @shown="shown"
    @hidden="hidden"
    @cancel="cancel"
    @close="close"
    @confirm="confirm"
    >
    <template #body>
        <p>{{lorem}}</p> 
    </template>  
    
</PTableCheckModel>
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
        headerTitle: {
            default: text('header', 'this is header'),
        },
        subTitle: {
            default: text('sub', 'sub Title'),
        },
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
