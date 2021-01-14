import faker from 'faker';
import { action } from '@storybook/addon-actions';
import {
    boolean, number, select, text, array,
} from '@storybook/addon-knobs';
import PButton from '@/atoms/buttons/PButton.vue';
import PButtonModal from '@/organisms/modals/button-modal/PButtonModal.vue';
import { sizeMapping } from '@/molecules/modals/type';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

export default {
    title: 'Feedbacks/Modals/Button Modal',
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
    cancel: action('cancel'),
    close: action('close'),
    confirm: action('confirm'),
};


export const buttonModal = () => ({
    components: { PButtonModal, PButton },
    template: `<div>
                <p-button styleType="primary" @click="launchModal">Launch a modal</p-button>
                <p-button-modal v-bind="$props"
                                :visible.sync="visible"
                                @close="closeModal"
                                v-on="actions"
                >
                    <template #body>
                        <p>{{contents}}</p> 
                    </template>  
                </p-button-modal>
            </div>`,

    props: {
        contentsHeight: {
            default: number('contentsHeight', 10, {
                range: true, min: 1, max: 80, step: 10,
            }),
        },

        fade: {
            default: boolean('fade', false),
        },
        scrollable: {
            default: boolean('scrollable', false),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], 'md'),
        },
        centered: {
            default: boolean('centered', false),
        },
        backdrop: {
            default: boolean('backdrop', true),
        },
        themeColor: {
            default: text('themeColor', 'primary'),
        },
        headerClass: {
            default: array('headerClass', []),
        },
        bodyClass: {
            default: array('bodyClass', []),
        },
        footerClass: {
            default: array('footerClass', []),
        },
        headerVisible: {
            default: boolean('headerVisible', true),
        },
        bodyVisible: {
            default: boolean('bodyVisible', true),
        },
        footerVisible: {
            default: boolean('footerVisible', true),
        },
        headerTitle: {
            default: text('headerTitle', 'This is title'),
        },
        headerCloseButtonVisible: {
            default: boolean('headerCloseButtonVisible', true),
        },
        footerCancelButtonVisible: {
            default: boolean('footerCancelButtonVisible', true),
        },
        footerConfirmButtonVisible: {
            default: boolean('footerConfirmButtonVisible', true),
        },
        hideOnCancel: {
            default: boolean('hideOnCancel', true),
        },
        loading: {
            default: boolean('loading', false),
        },
        disabled: {
            default: boolean('disabled', false),
        },
    },

    setup(props) {
        const state = reactive({
            visible: props.visible,
            contents: computed(() => faker.lorem.lines(props.contentsHeight)),
        });

        const launchModal = () => {
            state.visible = true;
        };
        const closeModal = () => {
            state.visible = false;
        };


        return {
            ...toRefs(state),
            actions,
            launchModal,
            closeModal,
        };
    },
});
