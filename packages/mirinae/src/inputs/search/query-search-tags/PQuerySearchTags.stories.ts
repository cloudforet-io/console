import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getQuerySearchTagsParameters, getQuerySearchTagsArgs, getQuerySearchTagsArgTypes } from '@/inputs/search/query-search-tags/story-helper';

import PQuerySearchTags from './PQuerySearchTags.vue';

type PQuerySearchTagsPropsAndCustomArgs = ComponentProps<typeof PQuerySearchTags>;

const meta : Meta<PQuerySearchTagsPropsAndCustomArgs> = {
    title: 'Inputs/Search/QuerySearchTags',
    component: PQuerySearchTags,
    argTypes: {
        ...getQuerySearchTagsArgTypes(),
    },
    parameters: {
        ...getQuerySearchTagsParameters(),
    },
    args: {
        ...getQuerySearchTagsArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PQuerySearchTags>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PQuerySearchTags },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-query-search-tags :tags="tags"
                :timezone="timezone"
                :read-only="readonly"
            >
            </p-query-search-tags>
        </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
