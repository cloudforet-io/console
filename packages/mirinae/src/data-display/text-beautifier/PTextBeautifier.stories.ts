import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTextBeautifierDefaultArgs, getTextBeautifierArgTypes } from '@/data-display/text-beautifier/story-helper';

import PTextBeautifier from './PTextBeautifier.vue';



type PTextBeautifierPropsAndCustomArgs = ComponentProps<typeof PTextBeautifier>;

const meta : Meta<PTextBeautifierPropsAndCustomArgs> = {
    title: 'Data Display/Text Beautifier',
    component: PTextBeautifier,
    argTypes: {
        ...getTextBeautifierArgTypes(),
        // 'item-content': { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
        },
    },
    args: {
        ...getTextBeautifierDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextBeautifier>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextBeautifier },
        template: `
            <p-text-beautifier
                :value="value"
                :tag="tag"
            ></p-text-beautifier>
        `,
        setup() {
            return {};
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTextBeautifier },
        template: `
            <p-text-beautifier :value="value"></p-text-beautifier>
        `,
        setup() {
            return {
                value: `${faker.lorem.sentence(30)} ${faker.internet.url()} ${faker.lorem.sentence(30)}`,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
