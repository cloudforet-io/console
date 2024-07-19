import { ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTableCheckModalArgs, getTableCheckModalArgTypes, getTableCheckModalParameters } from '@/feedbacks/modals/advanced/table-check-modal/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

import PTableCheckModal from './PTableCheckModal.vue';


type PTableCheckModalPropsAndCustomArgs = ComponentProps<typeof PTableCheckModal>;

const meta : Meta<PTableCheckModalPropsAndCustomArgs> = {
    title: 'Feedbacks/Modals/Advanced/Table Check Modal',
    component: PTableCheckModal,
    argTypes: {
        ...getTableCheckModalArgTypes(),
    },
    parameters: {
        ...getTableCheckModalParameters(),
    },
    args: {
        ...getTableCheckModalArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTableCheckModal>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTableCheckModal, PButton },
        template: `
            <div>
                <p-button @click="click">Open Modal</p-button>
                <p-table-check-modal
                    :modal-size="modalSize"
                    :theme-color="themeColor"
                    :header-title="headerTitle"
                    :sub-title="subTitle"
                    :fields="fields"
                    :items="items"
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
