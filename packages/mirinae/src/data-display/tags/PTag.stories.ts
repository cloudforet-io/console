import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getBasicTagArgs } from '@/data-display/tags/mock';
import { getTagDefaultArgs, getTagArgTypes } from '@/data-display/tags/story-helper';

import PTag from './PTag.vue';

type PTagPropsAndCustomArgs = ComponentProps<typeof PTag>;

const meta : Meta<PTagPropsAndCustomArgs> = {
    title: 'Data Display/Tag',
    component: PTag,
    argTypes: {
        ...getTagArgTypes(),
        default: { table: { disable: true } },
        category: { table: { disable: true } },
        key: { table: { disable: true } },
        value: { table: { disable: true } },
        delete: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124044',
        },
    },
    args: {
        ...getTagDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTag>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTag },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:100px;">
                <p-tag
                    :category-item="categoryItem"
                    :key-item="keyItem"
                    :value-item="valueItem"
                    :deletable="deletable"
                    :outline="outline"
                    :selected="selected"
                    :invalid="invalid"
                    :error-message="errorMessage"
                />
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTag },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
            <p-tag :category-item="fullArgs.categoryItem" :key-item="fullArgs.keyItem" :value-item="fullArgs.valueItem" style="margin: 1rem"/>
            <p-tag :key-item="keyValueArgs.keyItem" :value-item="keyValueArgs.valueItem" style="margin: 1rem"/>
            <p-tag :value-item="onlyValueArg.valueItem" style="margin: 1rem"/>
            </div>
        `,
        setup() {
            const state = {
                fullArgs: getBasicTagArgs().fullArgs,
                keyValueArgs: getBasicTagArgs().keyValueArgs,
                onlyValueArg: getBasicTagArgs().onlyValueArg,
            };
            return {
                ...state,
            };
        },
    }),
};

export const DeletableTag: Story = {
    render: () => ({
        components: { PTag },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
            <p-tag style="margin: 1rem">solid</p-tag>
            <p-tag :outline="true" style="margin: 1rem">outline</p-tag>
            <p-tag :invalid="true" error-message="This is error message." style="margin: 1rem">error</p-tag>
            </div>
        `,
    }),
};

export const Tag: Story = {
    render: () => ({
        components: { PTag },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
            <p-tag :deletable="false" style="margin: 1rem">solid</p-tag>
            <p-tag :deletable="false" :outline="true" style="margin: 1rem">selected outline</p-tag>
            <p-tag :deletable="false" :invalid="true" error-message="This is error message." style="margin: 1rem">error</p-tag>
            </div>
        `,
    }),
};

export const Selected: Story = {
    render: () => ({
        components: { PTag },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
            <p-tag :selected="true" style="margin: 1rem">solid</p-tag>
            <p-tag :selected="true" :outline="true" style="margin: 1rem">outline</p-tag>
            <p-tag :selected="true" :invalid="true" error-message="This is error message." style="margin: 1rem">error</p-tag>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
