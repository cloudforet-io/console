import { ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTreeNodeArgs, getTreeNodeArgTypes, getTreeNodeParameters } from '@/data-display/tree/new-tree/story-helper';

import PTreeNode from './PTreeNode.vue';

type PTreeNodePropsAndCustomArgs = ComponentProps<typeof PTreeNode>;

const meta: Meta<PTreeNodePropsAndCustomArgs> = {
    title: 'Data Display/Tree/Tree Node',
    component: PTreeNode,
    argTypes: {
        ...getTreeNodeArgTypes(),
    },
    parameters: {
        ...getTreeNodeParameters(),
    },
    args: {
        ...getTreeNodeArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTreeNode>;

// Basic story
export const Basic: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="node-1"
                    name="Basic Tree Node"
                    :selectable="true"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Reusable template
const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    v-bind="$props"
                ></p-tree-node>
            </div>
        `,
    }),
};

// Playground story
export const Playground: Story = {
    ...Template,
};

// Tree structure story
export const TreeStructure: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="parent"
                    name="Parent Node"
                    icon="ic_collect"
                    :hasChildren="true"
                    :expanded="expanded"
                    @update:expanded="expanded = $event"
                >
                    <template #children>
                        <p-tree-node
                            id="child-1"
                            name="Child Node 1"
                            icon="ic_service_policy"
                            :depth="1"
                        ></p-tree-node>
                        <p-tree-node
                            id="child-2"
                            name="Child Node 2"
                            icon="ic_service_policy"
                            :depth="1"
                        ></p-tree-node>
                    </template>
                </p-tree-node>
            </div>
        `,
        setup() {
            const expanded = ref(true);
            return {
                expanded,
            };
        },
    }),
};

// Slots usage story
export const WithSlots: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="custom"
                    name="Node with Custom Slots"
                    icon="ic_tree_folder"
                >
                    <template #outer-left>
                        outer-left
                    </template>
                    <template #inner-left>
                        inner-left
                    </template>
                    <template #inner-right>
                        inner-right
                    </template>
                    <template #outer-right>
                        outer-right
                    </template>
                    <template #action>
                        <button class="px-2 py-1 bg-blue-100 rounded text-xs">Action</button>
                    </template>
                </p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Selectable node story
export const Selectable: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="selectable"
                    name="Selectable Node"
                    icon="ic_tree_folder"
                    :selectable="true"
                    :selected="selected"
                    @update:selected="selected = $event"
                ></p-tree-node>
            </div>
        `,
        setup() {
            const selected = ref(false);
            return {
                selected,
            };
        },
    }),
};

// Loading state story
export const Loading: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="loading"
                    name="Loading Node"
                    :hasChildren="true"
                    :loading="true"
                    :expanded="true"
                    displayType="tree"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Draggable node story
export const Draggable: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="draggable"
                    name="Draggable Node"
                    :hasChildren="true"
                    :draggable="true"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// With link story
export const WithLink: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="with-link"
                    name="Node with Link"
                    :selectable="true"
                    :link="{ to: { path: '/example' } }"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Display type story
export const DisplayType: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="display-type"
                    name="Display Type: Tree"
                    displayType="tree"
                    :hasChildren="true"
                ></p-tree-node>
                <p-tree-node
                    id="display-type-list"
                    name="Display Type: List"
                    displayType="list"
                    class="mt-2"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Icon types story
export const IconTypes: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="icon-string"
                    name="Icon as String"
                    icon="ic_collect"
                ></p-tree-node>
                <p-tree-node
                    id="icon-object"
                    name="Icon as Object"
                    :icon="{ iconName: 'ic_collect' }"
                    class="mt-2"
                ></p-tree-node>
                <p-tree-node
                    id="icon-custom"
                    name="Icon with Custom Color"
                    :icon="{ iconName: 'ic_collect', iconColor: 'red' }"
                    class="mt-2"
                ></p-tree-node>
                <p-tree-node
                    id="icon-img"
                    name="Icon with Image URL"
                    :icon="{ imgUrl: 'https://example.com/icon.png' }"
                    class="mt-2"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Depth story
export const Depth: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="depth-0"
                    name="Depth 0"
                    icon="ic_collect"
                    :depth="0"
                    displayType="tree"
                ></p-tree-node>
                <p-tree-node
                    id="depth-1"
                    name="Depth 1"
                    icon="ic_collect"
                    :depth="1"
                    displayType="tree"
                    class="mt-2"
                ></p-tree-node>
                <p-tree-node
                    id="depth-2"
                    name="Depth 2"
                    icon="ic_collect"
                    :depth="2"
                    displayType="tree"
                    class="mt-2"
                ></p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

// Default slot story
export const DefaultSlot: Story = {
    render: () => ({
        components: { PTreeNode },
        template: `
            <div class="bg-white p-4 max-w-sm">
                <p-tree-node
                    id="default-slot"
                    name="Default Slot"
                    icon="ic_tree_folder"
                >
                    <template #default="{ name }">
                        <span class="font-bold text-blue-500">{{ name }}</span>
                    </template>
                </p-tree-node>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};
