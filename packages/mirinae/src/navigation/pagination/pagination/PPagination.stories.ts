import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getPaginationArgTypes, getPaginationArgs, getPaginationParameters } from '@/navigation/pagination/pagination/story-helper';

import PPagination from './PPagination.vue';

type PPaginationPropsAndCustomArgs = ComponentProps<typeof PPagination>;

const meta : Meta<PPaginationPropsAndCustomArgs> = {
    title: 'Navigation/Pagination/Pagination',
    component: PPagination,
    argTypes: {
        ...getPaginationArgTypes(),
    },
    parameters: {
        ...getPaginationParameters(),
    },
    args: {
        ...getPaginationArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PPagination>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PPagination },
        template: `
            <p-pagination
                :this-page.sync="thisPage"
                :page-size.sync="pageSize"
                :total-count="totalCount"
            />
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
