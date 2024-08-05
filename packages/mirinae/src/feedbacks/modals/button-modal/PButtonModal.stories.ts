import {
    computed, reactive, toRefs, ref,
} from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButtonModal from '@/feedbacks/modals/button-modal/PButtonModal.vue';
import { getButtonModalArgs, getButtonModalArgTypes, getButtonModalParameters } from '@/feedbacks/modals/button-modal/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PSelectDropdown from '@/inputs/dropdown/select-dropdown/PSelectDropdown.vue';




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
                menu: [
                    {
                        type: 'item', label: 'Add', name: 'add', disabled: false,
                    },
                    {
                        type: 'item', label: 'Hello', name: 'hello', disabled: false,
                    },
                    { type: 'divider' },
                    { type: 'header', label: 'this is header' },
                    {
                        type: 'item', label: 'Update', name: 'update', disabled: false,
                    },
                    {
                        type: 'item', label: 'Delete', name: 'delete', disabled: false,
                    },
                    { type: 'divider' },
                    {
                        type: 'item', label: 'Collect', name: 'collect', disabled: false,
                    },
                    { type: 'divider' },
                    {
                        type: 'item', label: 'Remove', name: 'remove', disabled: true,
                    },
                ],
                items: [
                    { type: 'item', label: 'one', name: 'one' },
                    { type: 'item', label: 'two', name: 'two' },
                    { type: 'item', label: 'three', name: 'three' },
                    { type: 'item', label: 'four', name: 'four' },
                    { type: 'item', label: 'five', name: 'five' },
                    { type: 'item', label: 'six', name: 'six' },
                    { type: 'item', label: 'one', name: 'one' },
                    { type: 'item', label: 'two', name: 'two' },
                    { type: 'item', label: 'three', name: 'three' },
                    { type: 'item', label: 'four', name: 'four' },
                    { type: 'item', label: 'five', name: 'five' },
                    { type: 'item', label: 'six', name: 'six' },
                    { type: 'item', label: 'one', name: 'one' },
                    { type: 'item', label: 'two', name: 'two' },
                    { type: 'item', label: 'three', name: 'three' },
                    { type: 'item', label: 'four', name: 'four' },
                    { type: 'item', label: 'five', name: 'five' },
                    { type: 'item', label: 'six', name: 'six' },
                    { type: 'item', label: 'one', name: 'one' },
                    { type: 'item', label: 'two', name: 'two' },
                    { type: 'item', label: 'three', name: 'three' },
                    { type: 'item', label: 'four', name: 'four' },
                    { type: 'item', label: 'five', name: 'five' },
                    { type: 'item', label: 'six', name: 'six' },
                    { type: 'item', label: 'one', name: 'one' },
                    { type: 'item', label: 'two', name: 'two' },
                    { type: 'item', label: 'three', name: 'three' },
                    { type: 'item', label: 'four', name: 'four' },
                    { type: 'item', label: 'five', name: 'five' },
                    { type: 'item', label: 'six', name: 'six' },
                ],
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

export const Playground: Story = {
    ...Template,
};
