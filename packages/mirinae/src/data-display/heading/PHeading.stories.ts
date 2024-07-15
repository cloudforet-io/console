import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { HEADING_TYPE } from '@/data-display/heading/config';
import { getHeadingArgTypes } from '@/data-display/heading/story-helper';


import PHeading from './PHeading.vue';

type PHeadingPropsAndCustomArgs = ComponentProps<typeof PHeading>;

const meta : Meta<PHeadingPropsAndCustomArgs> = {
    title: 'Data Display/Heading',
    component: PHeading,
    argTypes: {
        ...getHeadingArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=7823%3A421870&t=tyr8RcRHt8hwP1dM-4',
        },
    },
    args: {
        title: 'Page Title',
        headingType: HEADING_TYPE.MAIN,
        showBackButton: false,
        useTotalCount: true,
        totalCount: 0,
        useSelectedCount: false,
        selectedCount: 0,
        defaultSlot: undefined,
        titleSlot: undefined,
        titleLeftExtraSlot: undefined,
        totalCountSLot: undefined,
        titleRightExtraSlot: undefined,
        extraSlot: undefined,
    },
};

export default meta;
type Story = StoryObj<typeof PHeading>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PHeading },
        template: `
            <div class="w-full">
                <p-heading
                    :title="title"
                    :heading-type="headingType"
                    :show-back-button="showBackButton"
                    :use-total-count="useTotalCount"
                    :total-count="totalCount"
                    :use-selected-count="useSelectedCount"
                    :selected-count="selectedCount"
                    @goBack="onGoBack"
                >
                </p-heading>
            </div>
        `,
    }),
};

export const HeadingType: Story = {
    render: () => ({
        components: { PHeading },
        template: `
            <div class="w-full">
                <div class="bg-gray-200">
                    <p-heading heading-type="main">Main Heading Type</p-heading>
                </div>
                <br/>
                <div class="bg-gray-200">
                    <p-heading heading-type="sub">Sub Heading Type</p-heading>
                </div>
            </div>
        `,
    }),
};

export const BackButtonMode: Story = {
    render: () => ({
        components: { PHeading },
        template: `
            <div class="w-full">
            <p-heading show-back-button>Page Title</p-heading>
            <p class="my-4">When the title is ''</p>
            <p-heading show-back-button title=""></p-heading>
            </div>
        `,
    }),
};

export const TotalCount: Story = {
    render: () => ({
        components: { PHeading },
        template: `
            <div class="w-full">
            <p-heading use-total-count :total-count="32">Main Heading With Total Count</p-heading>
            <br/>
            <p-heading heading-type="sub" use-total-count :total-count="32">Sub Heading With Total Count</p-heading>
            </div>
        `,
    }),
};

export const SelectedCount: Story = {
    render: () => ({
        components: { PHeading },
        template: `
            <div class="w-full">
            <p-heading use-total-count :total-count="32" use-selected-count :selected-count="2">Page Title With Selected Count</p-heading>
            </div>
        `,
    }),
};

export const LongTitle: Story = {
    render: () => ({
        components: { PHeading },
        template: `
            <div class="w-full">
            <p-heading use-total-count :total-count="32">
                long long long long long long long long long long long long long long long long long long long long title
            </p-heading>
            </div>
        `,
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PHeading },
        template: `
        <div class="w-full">
            <p-heading use-total-count show-back-button>
                <template #title-left-extra><span class="border border-primary">title-left-extra slot</span></template>
                <span class="border border-red">default slot with long long long long long long long long long long long long long long long long title</span>
                <template #title-right-extra><span class="border border-secondary">title-right-extra slot</span></template>
                <template #total-count><span class="border border-primary-1">total count slot</span></template>
                <template #extra><span class="border border-peacock-600 inline-block">extra slot</span></template>
            </p-heading>
        </div>
        <!-- <div> -->
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
