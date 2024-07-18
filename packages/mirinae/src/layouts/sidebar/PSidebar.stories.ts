import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/inputs/buttons/button/PButton.vue';
import { getSidebarArgTypes, getSidebarArgs, getSidebarParameters } from '@/layouts/sidebar/story-helper';

import PSidebar from './PSidebar.vue';

type PSidebarPropsAndCustomArgs = ComponentProps<typeof PSidebar>;

const meta : Meta<PSidebarPropsAndCustomArgs> = {
    title: 'Layouts/Sidebar',
    component: PSidebar,
    argTypes: {
        ...getSidebarArgTypes(),
    },
    parameters: {
        ...getSidebarParameters(),
    },
    args: {
        ...getSidebarArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSidebar>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes).filter((d) => d !== 'visible'),
        components: { PSidebar, PButton },
        template: `
            <div class="flex flex-col" style="height: 500px;">
                <p-button :style-type="visible ? 'primary' : 'highlight'"
                          @click="visible = !visible;">
                    {{visible ? 'close' : 'open' }}
                </p-button>
                <p-sidebar :title="title"
                            :style-type="styleType"
                            :size="size"
                            :hide-close-button="hideCloseButton"
                            :is-fixed-size="isFixedSize"
                            v-model="visible"
                            class="mt-4 flex-grow"
                            @close="onClose"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        {{contents || 'Non-sidebar area'}}
                    </div>
                    <template #sidebar>{{sidebarContents || 'Sidebar contents'}}</template>
                </p-sidebar>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                visible: true,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

const PlaygroundTemplate: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSidebar },
        template: `
            <div class="flex flex-col" style="height: 500px;">
                <p-sidebar :title="title"
                            :visible="visible"
                            :style-type="styleType"
                            :size="size"
                            :is-fixed-size="isFixedSize"
                            :hide-close-button="hideCloseButton"
                            class="mt-4 flex-grow"
                >
                    <div class="bg-primary3 h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #sidebar>Sidebar contents</template>
                </p-sidebar>
            </div>
        `,
    }),
};

export const Basic: Story = {
    ...Template,
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: '',
        },
    },
};

export const LongContents: Story = {
    ...Template,
    argTypes: {
        contents: {
            defaultValue: faker.lorem.lines(100),
        },
        sidebarContents: {
            defaultValue: faker.lorem.lines(50),
        },
    },
};

export const LongTitle: Story = {
    ...Template,
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: faker.lorem.lines(50),
        },
    },
    args: {
        title: faker.lorem.lines(2),
    },
};

export const NoTitle: Story = {
    ...Template,
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: faker.lorem.lines(50),
        },
    },
    args: {
        title: undefined,
    },
};

export const CustomTitle: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            class="mt-4"
                >
                    <div class="bg-primary3 h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #title>
                        <strong class="text-coral">This is Custom Title</strong> with title slot.
                    </template>
                    <template #sidebar>Sidebar Contents</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: '',
        },
    },
};

export const SecondaryStyleType: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="Secondary Style Type"
                            style-type="secondary"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        {{contents || 'Non-sidebar area'}}
                    </div>
                    <template #sidebar>{{sidebarContents || 'Sidebar contents'}}</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: 'Style Type - Secondary',
        },
    },
};

export const HideCloseButton: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="No Close Button"
                            :hide-close-button="true"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        {{contents || 'Non-sidebar area'}}
                    </div>
                    <template #sidebar>{{sidebarContents || 'Sidebar contents'}}</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
    argTypes: {
        contents: {
            defaultValue: '',
        },
        sidebarContents: {
            defaultValue: 'Style Type - Secondary',
        },
    },
};

export const LargeSize: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="Large Size"
                            :hide-close-button="true"
                            size="lg"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #sidebar>Large Size</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
};

export const MediumSize: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="Medium Size"
                            :hide-close-button="true"
                            size="md"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #sidebar>Medium Size</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
};

export const SmallSize: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="Small Size"
                            :hide-close-button="true"
                            size="sm"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #sidebar>Small Size</template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
};

export const FooterSlot: Story = {
    render: () => ({
        components: { PSidebar },
        template: `
            <div style="height: 500px;">
                <p-sidebar :visible="true"
                            title="Footer Sidebar"
                            :hide-close-button="true"
                            class="mt-4"
                >
                    <div class="bg-primary3 p-4 min-h-full flex justify-center items-center">
                        Non-sidebar area
                    </div>
                    <template #sidebar>content</template>
                    <template #footer>
                        <div class="bg-gray-200">Footer Area</div>
                    </template>
                </p-sidebar>
            </div>
            <!--<div>-->
        `,
    }),
};

export const Playground: Story = {
    ...PlaygroundTemplate,
};
