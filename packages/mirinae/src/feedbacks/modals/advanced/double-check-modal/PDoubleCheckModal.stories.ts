import { ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getDoubleCheckModalArgs, getDoubleCheckModalArgTypes, getDoubleCheckModalParameters } from '@/feedbacks/modals/advanced/double-check-modal/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

import PDoubleCheckModal from './PDoubleCheckModal.vue';

type PDoubleCheckModalPropsAndCustomArgs = ComponentProps<typeof PDoubleCheckModal>;

const meta : Meta<PDoubleCheckModalPropsAndCustomArgs> = {
    title: 'Feedbacks/Modals/Advanced/Double Check Modal',
    component: PDoubleCheckModal,
    argTypes: {
        ...getDoubleCheckModalArgTypes(),
    },
    parameters: {
        ...getDoubleCheckModalParameters(),
    },
    args: {
        ...getDoubleCheckModalArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDoubleCheckModal>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDoubleCheckModal, PButton },
        template: `
            <div>
                <p-button @click="click">Open Modal</p-button>
                <p-double-check-modal
                    :modal-size="modalSize"
                    :verification-text="verificationText"
                    :header-title="headerTitle"
                    :visible.sync="visible"
                    :loading="loading"
                    @cancel="close"
                    @close="close"
                />
            </div>
        `,
        setup() {
            const visible = ref(false);
            return {
                visible,
                click() {
                    visible.value = true;
                },
                close() {
                    visible.value = false;
                },
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
