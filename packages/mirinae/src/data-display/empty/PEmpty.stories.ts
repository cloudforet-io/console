import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getEmptyArgTypes, getEmptyParameters, getEmptyArgs } from '@/data-display/empty/story-helper';
import { i18n } from '@/translations';

import PEmpty from './PEmpty.vue';

type PEmptyPropsAndCustomArgs = ComponentProps<typeof PEmpty>;

const meta : Meta<PEmptyPropsAndCustomArgs> = {
    title: 'Data Display/Empty',
    component: PEmpty,
    argTypes: {
        ...getEmptyArgTypes(),
    },
    parameters: {
        ...getEmptyParameters(),
    },
    args: {
        ...getEmptyArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PEmpty>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n,
        components: { PEmpty },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-empty
                    :show-image="showImage"
                    :image-size="imageSize"
                    :title="title"
                    :show-button="showButton"
                    :button-style-type="buttonStyleType"
                    :button-title="buttonTitle"
                >
                    {{$props.defaultSlot}}
                </p-empty>
            </div>
        `,
    }),
};

export const ShowImage: Story = {
    render: () => ({
        components: { PEmpty },
        template: `
            <div class="h-full w-full overflow p-8">
            <p-empty
                show-image
                image-size="sm"
            >
                No Data
            </p-empty>
            </div>
        `,
    }),
};

export const ImageSize: Story = {
    render: () => ({
        components: { PEmpty },
        template: `
            <div class="flex justify-evenly h-full w-full overflow p-8">
                <p-empty
                    show-image
                    image-size="sm"
                >
                    No Data
                </p-empty>
                <p-empty
                    show-image
                    image-size="md"
                >
                    No Data
                </p-empty>
                <p-empty
                    show-image
                    image-size="lg"
                >
                    No Data
                </p-empty>
            </div>
        `,
    }),
};

export const Title: Story = {
    render: () => ({
        components: { PEmpty },
        template: `
            <div class="flex justify-evenly h-full w-full overflow p-8">
            <p-empty
                title="No Data"
            >
                No Data
            </p-empty>
            <p-empty
                show-image
                image-size="sm"
                title="No Data"
            >
                No Data
            </p-empty>
            </div>
        `,
    }),
};

export const Button: Story = {
    render: () => ({
        components: { PEmpty },
        template: `
            <div class="flex justify-evenly h-full w-full overflow p-8">
            <p-empty
                show-button
            >
                No Data
            </p-empty>
            <p-empty
                show-image
                image-size="sm"
                show-button
            >
                No Data
            </p-empty>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
