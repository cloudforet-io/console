import {
    computed, reactive, toRefs, ref,
} from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PSelectDropdown from '@/controls/dropdown/select-dropdown/PSelectDropdown.vue';
import { getMenuItems } from '@/feedbacks/modals/button-modal/mock';
import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import { getButtonModalArgs, getButtonModalArgTypes, getButtonModalParameters } from '@/feedbacks/modals/button-modal/story-helper';




type PButtonModalPropsAndCustomArgs = ComponentProps<typeof PButtonModal>;

const meta : Meta<PButtonModalPropsAndCustomArgs> = {
    title: 'Feedbacks/Modals/Button Modal',
    component: PButtonModal,
    argTypes: {
        ...getButtonModalArgTypes(),
    },
    parameters: {
        ...getButtonModalParameters(),
    },
    args: {
        ...getButtonModalArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PButtonModal>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PButtonModal, PButton, PSelectDropdown },
        template: `
            <div>
                <p-button @click="launchModal">Launch a modal</p-button>
                <p-button-modal :visible.sync="modalVisible"
                                :size="size"
                                :backdrop="backdrop"
                                :theme-color="themeColor"
                                :header-title="headerTitle"
                                :hide-header="hideHeader"
                                :hide-body="hideBody"
                                :hide-footer="hideFooter"
                                :hide-header-close-button="hideHeaderCloseButton"
                                :hide-footer-close-button="hideFooterCloseButton"
                                :hide-footer-confirm-button="hideFooterConfirmButton"
                                :footer-reset-button-visible="footerResetButtonVisible"
                                :loading="loading"
                                :loading-backdrop="loadingBackdrop"
                                :disabled="disabled"
                                :absolute="absolute"
                                :modal-body-id="modalBodyId"
                                @close="closeModal"
                >
                    <template #body>
                        <p-select-dropdown
                            :menu="items"
                            placeholder="select dropdown (default)"
                            use-fixed-menu-style
                        />
                        <p>{{ contents }}</p>
                    </template>
                </p-button-modal>
            </div>
        `,
        setup(props) {
            const selectItem = ref('init');
            const state = reactive({
                modalVisible: props.visible,
                contents: computed(() => faker.lorem.lines(props.contentsHeight)),
                items: getMenuItems(),
            });
            const launchModal = () => {
                state.modalVisible = true;
            };
            const closeModal = () => {
                state.modalVisible = false;
            };
            return {
                selectItem,
                ...toRefs(state),
                launchModal,
                closeModal,
            };
        },
    }),
};


export const Basic: Story = {
    render: () => ({
        components: { PButtonModal, PButton },
        template: `
            <div>
                <p-button @click="modalVisible = true">Launch a modal</p-button>
                <p-button-modal :visible.sync="modalVisible"
                                @confirm="handleConfirm"
                >
                    <template #body>
                        <p>{{ contents }}</p>
                    </template>
                </p-button-modal>
            </div>
        `,
        setup() {
            const state = reactive({
                modalVisible: false,
                contents: computed(() => faker.lorem.lines(5)),
            });
            const handleConfirm = () => {
                state.modalVisible = false;
            };
            return {
                ...toRefs(state),
                handleConfirm,
            };
        },
    }),
};

export const LoadingBackdrop: Story = {
    render: () => ({
        components: { PButtonModal, PButton },
        template: `
            <div>
                <p-button @click="launchModal">Launch a modal</p-button>
                <p-button-modal :visible.sync="modalVisible"
                                :loading-backdrop="loadingBackdrop"
                                @confirm="handleConfirm"
                >
                    <template #body>
                        <p>{{ contents }}</p>
                    </template>
                </p-button-modal>
            </div>
        `,
        setup() {
            const state = reactive({
                modalVisible: false,
                contents: computed(() => faker.lorem.lines(5)),
                loadingBackdrop: true,
            });

            const launchModal = () => {
                state.loadingBackdrop = true;
                state.modalVisible = true;
                setTimeout(() => {
                    state.loadingBackdrop = false;
                }, 3000);
            };
            const handleConfirm = () => {
                state.modalVisible = false;
            };
            return {
                ...toRefs(state),
                launchModal,
                handleConfirm,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
