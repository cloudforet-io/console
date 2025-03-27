import type { Meta, StoryObj } from '@storybook/vue';

import PStatus from '@/data-display/status/PStatus.vue';

import * as colors from '@/styles/colors.cjs';
import { BASIC_CHART_COLORS } from '@/styles/colorsets';

import { getColorsArgTypes, getColorsParameters, getColorsArgs } from './story-helper';

const { semanticColors, palette } = colors;

const meta : Meta = {
    title: 'Foundation/Styles/Colors',
    argTypes: {
        ...getColorsArgTypes(),
    },
    parameters: {
        ...getColorsParameters(),
    },
    args: {
        ...getColorsArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PStatus },
        template: `
            <p-status v-if="typeof color !== 'object'"
                        :icon-color="color"
                        :text="color"
                        class="text-lg"
            />
        `,
    }),
};

export const AllColors: Story = {
    render: () => ({
        props: {
            allColors: {
                default: () => palette,
            },
        },
        components: { PStatus },
        template: `
            <div>
                <template v-for="(col, name, idx) in allColors">
                    <p-status v-if="typeof col !== 'object'"
                                :key="col + idx" :icon-color="col"
                                :text="name"
                                class="mr-4 text-lg"
                    />
                    <template v-else>
                        <div :key="name + idx" class="my-4">
                            <p class="mb-3">
                                <strong class="text-lg capitalize">{{name}}</strong>
                                <span class="ml-2">
                                <p-status :icon-color="col[500]"
                                        class="ml-1 text-lg"
                                        />
                                </span>
                            </p>
                            <p-status v-for="(c, n, i) in col"
                                        :key="c" :icon-color="c"
                                        :text="n"
                                        class="mr-4 text-lg"
                            />
                        </div>
                    </template>
                </template>
            </div>
        `,
    }),
};

export const Semantic: Story = {
    render: () => ({
        props: {
            allColors: {
                default: () => semanticColors,
            },
        },
        components: { PStatus },
        template: `
            <div>
                <div v-for="(col, name, idx) in allColors" :key="col + idx"
                    class="my-2">
                    <p-status :icon-color="col"
                            :text="name"
                                class="text-lg"
                    />
                </div>
            </div>
        `,
    }),
};

export const ChartTheme: Story = {
    render: () => ({
        props: {
            allColors: {
                default: () => BASIC_CHART_COLORS,
            },
        },
        components: { PStatus },
        template: `
            <div class="p-4">
                <div v-for="(col, idx) in allColors" :key="col + idx"
                    class="inline-block my-2 mr-4">
                    <p-status :icon-color="col"
                                class="text-lg"
                                :icon-size="2"
                                :style="{color: col}"
                    >
                        {{ idx + 1 }}
                    </p-status>
                </div>
            </div>
        `,
    }),
};
