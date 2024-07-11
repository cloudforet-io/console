import { reactive, toRefs, computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { standardIconActionSet, extraIconActionSet } from '@/data-display/board-item/mock';
import { getBoardItemArgTypes } from '@/data-display/board-item/story-helper';
import PTextButton from '@/inputs/buttons/text-button/PTextButton.vue';
import { I18nConnector } from '@/translations';

import PBoardItem from './PBoardItem.vue';

type PBoardItemPropsAndCustomArgs = ComponentProps<typeof PBoardItem>;

const meta : Meta<PBoardItemPropsAndCustomArgs> = {
    title: 'Data Display/Board Item',
    component: PBoardItem,
    argTypes: {
        ...getBoardItemArgTypes(),
        'left-content': { table: { disable: true } },
        content: { table: { disable: true } },
        'overlay-content': { table: { disable: true } },
        'custom-right-content': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'figma url',
        },
    },
    args: {
        leftIcon: undefined,
        IconButtonSets: standardIconActionSet,
        rounded: false,
        selected: false,
    },
};

export default meta;
type Story = StoryObj<typeof PBoardItem>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item
                    :left-icon="leftIcon"
                    :rounded="rounded"
                    :icon-button-sets="iconActionSets"
                >
                    <template #content>
                        <p>Content</p>
                    </template>
                </p-board-item>
            </div>
        `,
        setup(props) {
            const state = reactive({
                leftIcon: computed(() => props.leftIcon),
                rounded: computed(() => props.rounded),
                iconActionSets: computed(() => props.iconButtonSets ?? []),
            });
            return { ...toRefs(state) };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item
                    left-icon="ic_ellipsis-horizontal"
                    :icon-button-sets="standardIconActionSet"
                >
                    <template #content>
                        <strong>Content Slot Area</strong>
                        <p>This area is content slot</p>
                        <p>Put the content you want in this space</p>
                    </template>
                </p-board-item>
            </div>
        `,
        setup() {
            return {
                standardIconActionSet,
            };
        },
    }),
};

export const LeftIcon: Story = {
    render: () => ({
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item
                    left-icon="ic_resource_hexagon"
                >
                    <template #content>
                        <strong>Left Icon</strong>
                        <p>Collector tags icon</p>
                    </template>
                </p-board-item>
            </div>
        `,
    }),
};

export const Rounded: Story = {
    render: () => ({
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item
                    rounded
                >
                    <template #content>
                        <strong>Rounded Card List Item</strong>
                        <p>Rounded edge</p>
                    </template>
                </p-board-item>
            </div>
        `,
    }),
};

export const Selected: Story = {
    render: () => ({
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item :selected="selected"
                    @click="handleSelect"
                >
                    <template #content>
                        <p>Hover your mouse over here</p>
                    </template>
                </p-board-item>
            </div>
        `,
        setup() {
            const state = reactive({ selected: undefined }) as { selected: undefined | boolean };
            const handleSelect = () => {
                state.selected = !state.selected;
            };
            return { ...toRefs(state), handleSelect };
        },
    }),
};

export const IconButtonSets: Story = {
    render: () => ({
        components: { PBoardItem },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item
                    rounded
                    :icon-button-sets="extraIconActionSet"
                >
                    <template #content>
                        <strong>Right Icon Actions</strong>
                        <p>Hover your mouse over here</p>
                    </template>
                </p-board-item>
            </div>
        `,
        setup() {
            return {
                extraIconActionSet,
            };
        },
    }),
};

export const CustomRightContentSlot: Story = {
    render: () => ({
        components: { PBoardItem, PTextButton },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board-item>
                    <template #content>
                        <strong>Custom Right Overlay Content - Preview </strong>
                        <p>Hover your mouse over here</p>
                    </template>
                    <template #custom-right-content>
                        <p-text-button icon-right="ic_external-link">Preview</p-text-button>
                    </template>
                </p-board-item>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
