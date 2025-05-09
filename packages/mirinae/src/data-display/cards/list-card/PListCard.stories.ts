
import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import dayjs from 'dayjs';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PBadge from '@/data-display/badge/PBadge.vue';
import { CARD_STYLE_TYPE } from '@/data-display/cards/card/config';
import { getListCardArgTypes, getListCardParameters, getListCardArgs } from '@/data-display/cards/list-card/story-helper';
import PI from '@/foundation/icons/PI.vue';

import PListCard from './PListCard.vue';

type PListCardPropsAndCustomArgs = ComponentProps<typeof PListCard>;

const meta : Meta<PListCardPropsAndCustomArgs> = {
    title: 'Data Display/Cards/List Card',
    component: PListCard,
    argTypes: {
        ...getListCardArgTypes(),
    },
    parameters: {
        ...getListCardParameters(),
    },
    args: {
        ...getListCardArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PListCard>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PListCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-list-card
                    :header="header"
                    :style-type="styleType"
                    :items="items"
                    :loading="loading"
                    :hoverable="hoverable"
                >
                    <template v-if="headerSlot" #header><div v-html="headerSlot"/></template>
                    <template v-if="itemSlot" #item><div v-html="itemSlot"/></template>
                </p-list-card>
            </div>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PListCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-list-card
                    header="Basic List Card"
                    :items="items"
                >
                </p-list-card>
            </div>
        `,
        setup() {
            return {
                items: range(10).map(() => faker.lorem.sentence(8)),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PListCard },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-wrap">
                <p-list-card v-for="styleType in styleTypes" :key="styleType" :header="styleType" :style-type="styleType"
                    :items="items"
                    class="m-4"
                    style="width: 20rem;"
                >
                </p-list-card>
            </div>
        `,
        setup() {
            return {
                styleTypes: Object.values(CARD_STYLE_TYPE),
                items: range(4).map(() => faker.lorem.sentence(8)),
            };
        },
    }),
};

export const WithoutHeader: Story = {
    render: () => ({
        components: { PListCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-list-card
                    :header="false"
                    :items="items"
                >
                </p-list-card>
            </div>
        `,
        setup() {
            return {
                items: range(10).map(() => faker.lorem.sentence(8)),
            };
        },
    }),
};

export const CustomizeWithSlots: Story = {
    render: () => ({
        components: { PListCard, PI, PBadge },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-list-card :items="items">
                    <template #header>Slot Case</template>
                    <template #item="{item, index}">
                        <div class="flex flex-col">
                            <div class="flex justify-between">
                                <span class="flex-grow inline-flex items-center text-sm">
                                    <p-i :name="item.icon" width="1em" height="1em" class="mr-1 flex-shrink-0" />
                                    <span class="leading-5">{{item.value}}</span>
                                </span>
                                <span class="flex-shrink-0">
                                    <p-badge :style-type="item.badge === 'Acknowledged' ? 'red100' : 'blue200'" class="mr-2 text-xs text-gray-400">{{item.badge}}</p-badge>
                                    <span class="text-xs text-gray-500">{{item.date}}</span>
                                </span>
                            </div>
                            <div v-if="item.description">
                                <p-i name="ic_subdirectory-arrow-right" width="1rem" height="1rem" class="ml-4" />
                                <strong class="text-xs leading-5 text-gray-500 mr-1">{{item.description.message}}</strong>
                                <span class="text-xs leading-5 text-gray-400">{{item.date}}</span>
                            </div>
                        </div>
                    </template>
                </p-list-card>
            </div>
            <!--<br>-->
        `,
        setup() {
            return {
                items: range(10).map(() => ({
                    value: faker.lorem.sentence(6),
                    icon: faker.helpers.arrayElement(['ic_error-filled', 'ic_warning-filled']),
                    badge: faker.helpers.arrayElement(['Acknowledged', 'Triggered']),
                    date: dayjs(faker.date.past(2021)).format('MM/DD hh:mm'),
                    description: faker.helpers.arrayElement([{
                        message: faker.lorem.sentence(6),
                        date: dayjs(faker.date.past(2021)).format('MM/DD hh:mm'),
                    }, undefined]),
                })),
            };
        },
    }),
};

export const CustomizeLoader: Story = {
    render: () => ({
        components: { PListCard, PButton },
        template: `
            <div class="h-full w-full overflow p-8" style="height: 200px;">
                <p-button class="mb-4" icon-left="ic_refresh"
                        @click="updateItems"
                >
                    Refresh
                </p-button>
                <p-list-card
                    header="Customize Loader of List Card"
                    :items="items"
                    :loading="loading"
                >
                    <template #loader><div class="leading-6">Loading...</div></template>
                </p-list-card>
            </div>
        `,
        setup() {
            const state = reactive({
                loading: true,
                items: [] as string[],
            });
            const updateItems = () => {
                state.loading = true;
                setTimeout(() => {
                    state.items = range(faker.datatype.number({ min: 0, max: 3 }))
                        .map(() => faker.lorem.sentence(8));
                    state.loading = false;
                }, 300);
            };
            updateItems();
            return {
                ...toRefs(state),
                updateItems,
            };
        },
    }),
};

export const CustomizeLoaderAndEmptyCase: Story = {
    render: () => ({
        components: { PListCard, PButton },
        template: `
            <div class="h-full w-full overflow p-8" style="height: 200px;">
                <p-button class="mb-4" icon-left="ic_refresh"
                        @click="updateItems"
                >
                    Refresh
                </p-button>
                <p-list-card
                    header="Customize No Data Case of List Card"
                    :items="items"
                    :loading="loading"
                >
                    <template #loader><div class="leading-6">Loading...</div></template>
                    <template #no-data><div class="leading-6">EMPTY ㅠㅠ</div></template>
                </p-list-card>
            </div>
            <!--<div>-->
        `,
        setup() {
            const state = reactive({
                loading: true,
                items: [],
            });
            const updateItems = () => {
                state.loading = true;
                setTimeout(() => {
                    state.items = [];
                    state.loading = false;
                }, 300);
            };
            updateItems();
            return {
                ...toRefs(state),
                updateItems,
            };
        },
    }),
};

export const Hoverable: Story = {
    render: () => ({
        components: { PListCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-list-card
                    header="Hoverable List Card"
                    :items="items"
                    :hoverable="true"
                >
                </p-list-card>
            </div>
        `,
        setup() {
            return {
                items: range(10).map(() => faker.lorem.sentence(8)),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
