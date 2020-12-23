import faker from 'faker';
import { action } from '@storybook/addon-actions';
import {
    boolean, number, select, text,
} from '@storybook/addon-knobs';
import { autoProps } from '@sb/storybook-util';
import PContentModal from '@/components/organisms/modals/content-modal/PContentModal.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { sizeMapping } from '@/components/molecules/modals/type';
import { computed, ref } from '@vue/composition-api';

export default {
    title: 'Feedbacks/Modals',
    component: PButtonModal,
    parameters: {
        info: {
            summary: '',
            components: { PButtonModal },
        },
        centered: { disable: true },
    },
};

const actions = {
    shown: action('shown'),
    hidden: action('hidden'),
    cancel: action('cancel'),
    close: action('close'),
    confirm: action('confirm'),
};

const pbmProps = [
    { name: 'headerTitle', default: 'This is title.' },
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

export const buttonModal = () => ({
    components: { PButtonModal, PButton },
    template: `<div>
                <p-button styleType="primary" @click="click">Launch a modal</p-button>
                <p-button-modal
                    ref="modal"
                    :scrollable="scrollable" 
                    :centered="centered"
                    :size="size"
                    :fade="fade"
                    :backdrop="backdrop"
                    :headerTitle="headerTitle"
                    :headerVisible="headerVisible"
                    :bodyVisible="bodyVisible"
                    :footerVisible="footerVisible"
                    :headerCloseButtonVisible="headerCloseButtonVisible"
                    :footerCancelButtonVisible="footerCancelButtonVisible"
                    :footerConfirmButtonVisible="footerConfirmButtonVisible"
                    :footerConfirmButtonBind="ConfirmButtonBind"
                    :visible.sync="visible"
                    @cancel="cancel"
                    @close="close"
                    @confirm="confirm"
                    >
                    <template #body>
                        <p>{{lorem}}</p> 
                    </template>  
                    
                </p-button-modal>
            </div>`,

    props: {
        loremLength: {
            default: number('loremLength', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'sm'),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        centered: {
            default: boolean('centered', false),
        },
        backdrop: {
            default: boolean('backdrop', true),
        },
        fade: {
            default: boolean('fade', true),
        },
        okDisabled: {
            default: boolean('ok disabled', false),
        },
        headerTitle: {
            default: text('header title', 'this is titel'),
        },
        ...autoProps(PButtonModal, pbmProps),
        ...autoProps(PContentModal, pcmProps),
    },

    setup(props) {
        const visible = ref(false);
        const lorem = computed(() => faker.lorem.lines(props.loremLength));
        const ConfirmButtonBind = computed(() => ({
            styleType: 'primary',
            disabled: props.okDisabled,
        }));
        const click = () => {
            visible.value = true;
        };
        const close = () => {
            visible.value = false;
        };

        return {
            ...actions,
            visible,
            lorem,
            ConfirmButtonBind,
            click,
            close,
        };
    },
});
