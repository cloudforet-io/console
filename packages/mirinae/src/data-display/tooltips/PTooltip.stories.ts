import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import PBadge from '@/data-display/badge/PBadge.vue';
import { getTooltipDefaultArgs, getTooltipArgTypes } from '@/data-display/tooltips/story-helpers';
import { POSITIONS } from '@/data-display/tooltips/type';

import PTooltip from './PTooltip.vue';


type PTooltipPropsAndCustomArgs = ComponentProps<typeof PTooltip>;

const meta : Meta<PTooltipPropsAndCustomArgs> = {
    title: 'Data Display/Tooltips',
    component: PTooltip,
    argTypes: {
        ...getTooltipArgTypes(),
        default: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124040',
        },
    },
    args: {
        ...getTooltipDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTooltip>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTooltip, PBadge },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-badge>
                    <p-tooltip  :tag="tag"
                                :contents="contents"
                                :position="position"
                                :options="options"
                    >
                        Show Tooltip
                    </p-tooltip>
                </p-badge>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PTooltip, PBadge },
        template: `
            <div class="h-full w-full overflow p-8 text-center">
                <p-badge>
                    <p-tooltip :contents="contents" position="top">Top</p-tooltip>
                </p-badge>
            </div>
        `,
        setup() {
            return {
                contents: range(10).map(() => faker.lorem.sentence(5)),
            };
        },
    }),
};

export const Position: Story = {
    render: () => ({
        components: { PTooltip, PBadge },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-wrap gap-2">
                <p-badge v-for="position in positions">
                    <p-tooltip :contents="contents" :position="position">
                            {{position}}
                    </p-tooltip>
                </p-badge>
            </div>
        `,
        setup() {
            return {
                positions: Object.values(POSITIONS),
                contents: range(10).map(() => faker.lorem.sentence(5)),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
