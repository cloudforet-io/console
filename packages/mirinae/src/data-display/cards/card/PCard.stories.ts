import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { CARD_STYLE_TYPE, CARD_SIZE } from '@/data-display/cards/card/config';
import { getCardArgTypes } from '@/data-display/cards/card/story-helper';
import PI from '@/foundation/icons/PI.vue';

import PCard from './PCard.vue';

type PCardPropsAndCustomArgs = ComponentProps<typeof PCard>;

const meta : Meta<PCardPropsAndCustomArgs> = {
    title: 'Data Display/Cards/Card',
    component: PCard,
    argTypes: {
        ...getCardArgTypes(),
        default: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
        },
    },
    args: {
        header: 'This is header!',
        styleType: CARD_STYLE_TYPE.gray100,
        size: CARD_SIZE.md,
        defaultSlot: 'This is card body!',
        headerSlot: '',

    },
};

export default meta;
type Story = StoryObj<typeof PCard>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-card
                    :header="header"
                    :style-type="styleType"
                    :size="size"
                    style="width: 20rem;"
                >
                    <template #header><div v-if="headerSlot" v-html="headerSlot" /></template>
                    <div v-if="defaultSlot" v-html="defaultSlot" />
                </p-card>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-card
                    header="Basic Case Card"
                    style="width: 12rem;"
                >
                    Hello World!
                </p-card>
            </div>
        `,
    }),
};

export const WithoutHeader: Story = {
    render: () => ({
        components: { PCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-card :header="false" v-for="styleType in styleTypes" :key="styleType" :style-type="styleType"
                    style="width: 30rem; margin: 1rem;"
                >
                    It has no header.
                </p-card>
            </div>
        `,
        setup() {
            const state = reactive({
                styleTypes: Object.values(CARD_STYLE_TYPE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PCard },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-wrap">
                <p-card v-for="styleType in styleTypes" :key="styleType" :header="styleType" :style-type="styleType"
                    style="min-width: 20rem; margin: 1rem;"
                >
                    This is {{styleType}} type.
                </p-card>
            </div>
        `,
        setup() {
            const state = reactive({
                styleTypes: Object.values(CARD_STYLE_TYPE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Size: Story = {
    render: () => ({
        template: `
            <div class="h-full w-full overflow p-8 flex flex-wrap">
                <p-card v-for="size in sizes" :key="size" :header="size" :size="size"
                    style="min-width: 20rem; margin: 1rem;"
                >
                    This is {{size}} size.
                </p-card>
            </div>
        `,
        setup() {
            const state = reactive({
                sizes: Object.values(CARD_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PCard, PI },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-card style="width: 209px;">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-900">Created</span>
                            <span class="text-alert">1 <p-i name="ic_caret-down-filled-alt" height="12px" width="12px" color="inherit" /></span>
                        </div>
                    </template>
                    <div class="flex justify-between items-center">
                        <span>8.5</span><span>145</span>
                    </div>
                    <div class="flex justify-between items-center text-gray text-xs mt-1">
                        <span>Dail Average</span><span class="text-right">Monthly Total</span>
                    </div>
                </p-card>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
