import { ref } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTextListDeafultArgs, getTextListArgTypes } from '@/data-display/text-list/story-helper';

import PTextList from './PTextList.vue';

type PTextListPropsAndCustomArgs = ComponentProps<typeof PTextList>;

const meta : Meta<PTextListPropsAndCustomArgs> = {
    title: 'Data Display/Text List',
    component: PTextList,
    argTypes: {
        ...getTextListArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
        },
    },
    args: {
        ...getTextListDeafultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextList>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextList },
        template: `
            <PTextList
                :items="items"
                :delimiter="delimiter"
                :sub-key="subKey"
                :link="link"
                :link-target="linkTarget"
            />
        `,
    }),
};

export const ObjectArray: Story = {
    render: () => ({
        components: { PTextList },
        template: `
            <PTextList :items="items" />
        `,
        setup() {
            const items = ref(faker.datatype.array(10).map(() => ({
                name: faker.name.firstName(),
                phone: faker.phone.number(),
                group: faker.helpers.arrayElement([undefined, faker.random.word()]),
            })));
            return {
                items,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
