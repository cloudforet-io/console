import type { ComponentProps } from 'vue-component-type-helpers';

import type { Meta, StoryObj } from '@storybook/vue';

import AutoSyncState from './AutoSyncState.vue';
import { getAutoSyncStateArgs, getAutoSyncStateArgTypes, getAutoSyncStateParameters } from './story-helper';


type PButtonPropsAndCustomArgs = ComponentProps<typeof AutoSyncState>;

const meta : Meta<PButtonPropsAndCustomArgs> = {
    title: 'Console Component/Badge/Auto Sync State',
    component: AutoSyncState,
    argTypes: {
        ...getAutoSyncStateArgTypes(),
    },
    parameters: {
        ...getAutoSyncStateParameters(),
    },
    args: {
        ...getAutoSyncStateArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof AutoSyncState>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { AutoSyncState },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:150px;">
                <auto-sync-state
                    :state="state"
                    :size="size"
                />
            </div>`,
    }),
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 150px;" />',
    })],
};
