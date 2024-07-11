import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';


import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import { getCollapsibleListArgTypes } from '@/data-display/collapsible/collapsible-list/story-helper';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';
import { useProxyValue } from '@/hooks';
import { I18nConnector } from '@/translations';

import PCollapsibleList from './PCollapsibleList.vue';

type PCollapsibleListPropsAndCustomArgs = ComponentProps<typeof PCollapsibleList>;

const meta : Meta<PCollapsibleListPropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible List',
    component: PCollapsibleList,
    argTypes: {
        ...getCollapsibleListArgTypes(),
        title: { table: { disable: true } },
        'no-styled-title': { table: { disable: true } },
        default: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=13560%3A296687',
        },
    },
    args: {
        items: range(10).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(60) })),
        unfoldedIndices: [],
        lineClamp: 2,
        multiUnfoldable: false,
        togglePosition: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
        toggleType: COLLAPSIBLE_TOGGLE_TYPE.text,
        theme: COLLAPSIBLE_LIST_THEME.plain,
        'v-model': [],
    },
};

export default meta;
type Story = StoryObj<typeof PCollapsibleList>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsibleList },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-collapsible-list
                :items="items"
                v-model="proxyUnfoldedIndices"
                :line-clamp="lineClamp"
                :multi-unfoldable="multiUnfoldable"
                :toggle-position="togglePosition"
                :toggle-type="toggleType"
                :theme="theme"
                @update:unfoldedIndices="onUpdateUnfoldedIndices"
            >
                <template v-if="titleSlot" #title>
                    <div v-html="titleSlot" />
                </template>
                <div v-if="defaultSlot" v-html="defaultSlot" />
            </p-collapsible-list>
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyUnfoldedIndices: useProxyValue('unfoldedIndices', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-list :items="items" v-model="unfolded"></p-collapsible-list>
            </div>
        `,
        setup() {
            const state = reactive({
                items: range(5).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
                unfolded: [0],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultiUnfoldable: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-list :items="items" v-model="unfolded" multi-unfoldable></p-collapsible-list>
            </div>
        `,
        setup() {
            const state = reactive({
                items: range(5).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
                unfolded: [0, 1],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const TogglePositions: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <div>
                    <p class="text-xl font-bold mb-4">Toggle Position: title</p>
                    <p-collapsible-list :items="items" toggle-position="title" />
                </div>
                <div class="mt-6">
                    <p class="text-xl font-bold mb-4">Toggle Position: contents</p>
                    <p-collapsible-list :items="items" toggle-position="contents" />
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                items: range(3).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const LineClamp: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
                <div class="h-full w-full overflow p-8">
                    <p class="italic mb-4">Line Clamp works only when the toggle position is contents.</p>
                    <div class="p-4 mb-4">
                        <p class="text-xl font-bold mb-2">Line Clamp: 5</p>
                        <p-collapsible-list :items="items" toggle-position="contents" :line-clamp="5" />
                    </div>
                    <div class="p-4 mb-4">
                        <p class="text-xl font-bold mb-2">Line Clamp: 1 </p>
                        <p-collapsible-list :items="items" toggle-position="contents"  :line-clamp="1" />
                    </div>
                    <div class="p-4 mb-4">
                        <p class="text-xl font-bold mb-2">Line Clamp: 0</p>
                        <p-collapsible-list :items="items" toggle-position="contents"  :line-clamp="0" />
                    </div>
                    <div class="p-4 mb-4">
                        <p class="text-xl font-bold mb-2">Line Clamp: -1</p>
                        <p-collapsible-list :items="items" toggle-position="contents"  :line-clamp="-1" />
                    </div>
                </div>
            `,
        setup() {
            const state = reactive({
                items: range(3).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Themes: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <div class="p-4 mb-4">
                    <p class="text-xl font-bold mb-6">Theme: plain</p>
                    <p-collapsible-list :items="items" theme="plain" />
                </div>
                <div class="p-4 mb-4">
                    <p class="text-xl font-bold mb-6">Theme: card</p>
                    <p-collapsible-list :items="items" theme="card"  />
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                items: range(3).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PCollapsibleList },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <div>
                    <p class="text-xl font-bold mb-4">Title Slot</p>
                    <p-collapsible-list :items="items">
                        <template #title={title}>
                            <span class="text-xl font-bold text-secondary">
                                <{{title}}>
                            </span>
                        </template>
                    </p-collapsible-list>
                </div>
                <div>
                    <p class="text-xl font-bold mb-4">No Styled Title Slot</p>
                    <p-collapsible-list :items="items">
                        <template #no-styled-title={title}>
                            <span class="text-xl font-bold text-secondary">
                                <{{title}}>
                            </span>
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="mt-6">
                    <p class="text-xl font-bold mb-4">Default Slot</p>
                    <p-collapsible-list :items="items" toggle-position="contents">
                        <template #default="{data}">
                            <strong class="text-peacock">{{data}}</strong>
                        </template>
                    </p-collapsible-list>
                </div>
                <div class="mt-6">
                    <p class="text-xl font-bold mb-4">Slot Props</p>
                    <pre>
                    {
                        data: string;
                        title?: string;
                        index: number;
                        isCollapsed: boolean;
                    }
                    </pre>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                items: range(3).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(faker.datatype.number({ min: 30, max: 200 })) })),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
