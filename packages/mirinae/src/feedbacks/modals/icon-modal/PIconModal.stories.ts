import {
    computed, reactive, toRefs, ref,
} from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getIconModalArgs, getIconModalArgTypes, getIconModalParameters } from '@/feedbacks/modals/icon-modal/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

import PIconModal from './PIconModal.vue';

type PIconModalPropsAndCustomArgs = ComponentProps<typeof PIconModal>;

const meta : Meta<PIconModalPropsAndCustomArgs> = {
    title: 'Feedbacks/Modals/Icon Modal',
    component: PIconModal,
    argTypes: {
        ...getIconModalArgTypes(),
    },
    parameters: {
        ...getIconModalParameters(),
    },
    args: {
        ...getIconModalArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PIconModal>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PIconModal, PButton },
        template: `
            <div>
                <p-button @click="launchModal">Launch a modal</p-button>
                <p-icon-modal :visible.sync="modalVisible"
                                :size="size"
                                :icon-name="iconName"
                                :icon-color="iconColor"
                                :emoji="emoji"
                                :header-title="headerTitle"
                                :header-desc="headerDesc"
                                :button-text="buttonText"
                                :button-style-type="buttonStyleType"
                                :backdrop="backdrop"
                                :hide-button="hideButton"
                                @close="closeModal"
                />
            </div>
        `,
        setup(props) {
            const selectItem = ref('init');
            const state = reactive({
                modalVisible: props.visible,
                contents: computed(() => faker.lorem.lines()),
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
