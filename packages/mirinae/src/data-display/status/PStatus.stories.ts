import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PStatus from '@/data-display/status/PStatus.vue';
import { getStatusArgs, getStatusArgTypes, getStatusParameters } from '@/data-display/status/story-helper';


type PStatusPropsAndCustomArgs = ComponentProps<typeof PStatus>;

const meta : Meta<PStatusPropsAndCustomArgs> = {
    title: 'Data Display/Status',
    component: PStatus,
    argTypes: {
        ...getStatusArgTypes(),
    },
    parameters: {
        ...getStatusParameters(),
    },
    args: {
        ...getStatusArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PStatus>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PStatus },
        template: `
    <div style="display:flex; align-items:center; justify-content:center;">
        <p-status
            :icon="icon"
            :text="text"
            :text-color="textColor"
            :icon-color="iconColor"
            :theme="theme"
            :disable-icon="disableIcon"
            :icon-size="iconSize"
            :icon-animation="iconAnimation"
        >
            <div v-if="defaultSlot" v-html="defaultSlot"/>
        </p-status>
    </div>`,
    }),
};

export const Theme: Story = {
    render: () => ({
        components: { PStatus },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-status theme="green" text="Enabled" style="margin: 1rem" />
                <p-status theme="yellow" text="Pending" style="margin: 1rem" />
                <p-status theme="red" text="Error" style="margin: 1rem" />
                <p-status theme="gray" text="Deleted" style="margin: 1rem" />
            </div>
        `,
    }),
};

export const ThemeStatusWithoutIcon: Story = {
    render: () => ({
        components: { PStatus },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-status theme="green" :disable-icon="true" text="Enabled" style="margin: 1rem" />
                <p-status theme="yellow" :disable-icon="true" text="Pending" style="margin: 1rem" />
                <p-status theme="red" :disable-icon="true" text="Error" style="margin: 1rem" />
                <p-status theme="gray" :disable-icon="true" text="Deleted" style="margin: 1rem" />
            </div>
        `,
    }),
};

export const Icon: Story = {
    render: () => ({
        components: { PStatus },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-status icon="ic_check" text="Enabled" style="margin: 1rem" />
                <p-status icon="ic_plug-filled" text="Disconnected" style="margin: 1rem" />
                <p-status icon="ic_warning-filled" text="Duplicated" style="margin: 1rem" />
                <p-status icon="ic_spanner-filled" text="Manual" style="margin: 1rem" icon-animation="spin" />
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
