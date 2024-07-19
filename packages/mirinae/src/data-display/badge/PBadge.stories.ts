import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getBadgesArgTypes, getBadgesArgs, getBadgesParameters } from '@/data-display/badge/story-helper';
import { SOLID_STYLE_TYPE, SOLID_OUTLINE_STYLE_TYPE, SUBTLE_STYLE_TYPE } from '@/data-display/badge/type';

import PBadge from './PBadge.vue';

type PBadgePropsAndCustomArgs = ComponentProps<typeof PBadge>;

const meta : Meta<PBadgePropsAndCustomArgs> = {
    title: 'Data Display/Badge',
    component: PBadge,
    argTypes: {
        ...getBadgesArgTypes(),
    },
    parameters: {
        ...getBadgesParameters(),
    },
    args: {
        ...getBadgesArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PBadge>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PBadge },
        template: `
            <div style="display:flex; align-items:center; justify-content:center; height:100px;">
                <p-badge
                    :badge-type="badgeType"
                    :style-type="styleType"
                    :text-color="textColor"
                    :background-color="backgroundColor"
                    :outline-color="outlineColor"
                    :shape="shape"
                    :font-weight="fontWeight"
                >{{$props.defaultSlot}}</p-badge>
            </div>
        `,
    }),
};

export const BadgeTypes: Story = {
    render: () => ({
        components: { PBadge },
        setup() {
            return {
                solidStyleTypes: Object.values(SOLID_STYLE_TYPE),
                solidOutlineStyleTypes: Object.values(SOLID_OUTLINE_STYLE_TYPE),
                subtleStyleTypes: Object.values(SUBTLE_STYLE_TYPE),
            };
        },
        template: `
            <div class="w-full h-full">
                <p style="font-weight: bold">Solid</p>
                <p-badge
                    v-for="styleType in solidStyleTypes"
                    :badge-type="'solid'"
                    :style-type="styleType"
                    :key="\`solid-\${styleType}\`"
                    class="m-2"
                >
                    {{ styleType }}
                </p-badge>
                <br/><br/>
                <p style="font-weight: bold">Solid-Outline</p>
                <p-badge
                    v-for="styleType in solidOutlineStyleTypes"
                    :badge-type="'solid-outline'"
                    :style-type="styleType"
                    :key="\`outline-\${styleType}\`"
                    class="m-2"
                >
                    {{ styleType }}
                </p-badge>
                <br/><br/>
                <p style="font-weight: bold">Subtle</p>
                <p-badge
                    v-for="styleType in subtleStyleTypes"
                    :badge-type="'subtle'"
                    :style-type="styleType"
                    :key="\`subtle-\${styleType}\`"
                    class="m-2"
                >
                    {{ styleType }}
                </p-badge>
            </div>`,
    }),
};

export const Shapes: Story = {
    render: () => ({
        components: { PBadge },
        template: `
            <div style="display: flex; align-items: center; justify-content: center; height: 100px">
                <p-badge shape="round">
                    <div>round</div>
                </p-badge>
                <p-badge shape="square" style="margin-left: 20px">
                    <div>square</div>
                </p-badge>
            </div>`,
    }),
};

export const FontWeight: Story = {
    render: () => ({
        components: { PBadge },
        template: `
            <div style="display: flex; align-items: center; justify-content: center; height: 100px">
                <p-badge shape="round">
                    <div>Regular</div>
                </p-badge>
                <p-badge shape="round" style="margin-left: 20px" font-weight="medium">
                    <div>Medium</div>
                </p-badge>
            </div>`,
    }),
};

export const Playground: Story = {
    ...Template,
};
