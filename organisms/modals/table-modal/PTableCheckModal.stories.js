import { select, text } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PTableCheckModel from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import { sizeMapping } from '@/components/molecules/modals/type';

export default {
    title: 'others/table-check-modal',
    component: PTableCheckModel,
};

const data = {
    fields: ['name', 'phone', 'email'],
    sortable: true,
    sortBy: null,
    sortDesc: true,
    visible: false,
    items: [
        { name: 'stark', phone: '000-0000-0000', email: 'stark@marvel.com' },
    ],
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
    cancel: action('cancel'),
    close: action('close'),
    confirm: action('confirm'),

};


const pmProps = [
    { name: 'scrollable' },
    { name: 'centered' },
    { name: 'backdrop' },
    { name: 'fade' },
    { name: 'keyboard' },
];


export const modal = () => ({
    components: { PTableCheckModel, PButton },
    template: `
<div>
<p-button styleType="primary" @click="click">모달 띄우기</p-button>
<PTableCheckModel
    ref="modal"
    :size="size"
    :headerTitle="headerTitle"
    :subTitle="subTitle"
    :fields="fields"
    :items="items"
    :visible.sync="visible"
    :themeColor="themeColor"

    @cancel="cancel"
    @close="close"
    @confirm="confirm"
    >
    
</PTableCheckModel>
</div>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        themeColor: {
            default: select('color', ['primary', 'alert', 'safe']),
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
            default: text('sub', 'this is sub Title'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
    },
    computed: {
        ConfirmButtonBind() {
            return {
                styleType: 'primary',
                disabled: this.okDisabled,
            };
        },
    },
    methods: {
        click() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        ...actions,
    },
});
