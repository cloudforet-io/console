import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { BALLOON_TAB_POSITION, BALLOON_TAB_SIZE, BALLOON_TAB_STYLE_TYPE } from '@/navigation/tabs/ballon-tab/config';
import { getBalloonTabArgTypes, getBalloonTabParameters, getBalloonTabArgs } from '@/navigation/tabs/ballon-tab/story-helper';

import PBalloonTab from './PBalloonTab.vue';

type PBalloonTabPropsAndCustomArgs = ComponentProps<typeof PBalloonTab>;

const meta : Meta<PBalloonTabPropsAndCustomArgs> = {
    title: 'Navigation/Tabs/Balloon Tab',
    component: PBalloonTab,
    argTypes: {
        ...getBalloonTabArgTypes(),
    },
    parameters: {
        ...getBalloonTabParameters(),
    },
    args: {
        ...getBalloonTabArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PBalloonTab>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PBalloonTab },
        template: `
        <p-balloon-tab
            :tabs="tabs"
            v-model="proxyActiveTab"
            :tail="tail"
            :size="size"
            :position="position"
            :stretch="stretch"
            @update:activeTab="onUpdateActiveTab"
            @change="onChange"
        ></p-balloon-tab>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyActiveTab: useProxyValue('activeTab', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <p-balloon-tab
                :tabs="tabs"
                v-model="activeTab"
            ></p-balloon-tab>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                ],
                activeTab: 'detail',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Tail: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <p-balloon-tab
                :tabs="tabs"
                v-model="activeTab"
                tail
            ></p-balloon-tab>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                ],
                activeTab: 'detail',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Stretch: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <div>
                <p class="text-2xl my-4 font-bold">Short Case</p>
                <p-balloon-tab
                    :tabs="tabs"
                    v-model="activeTab"
                    stretch
                ></p-balloon-tab>
                <p class="text-2xl my-4 font-bold">Long Case</p>
                <p-balloon-tab
                    :tabs="longTabs"
                    v-model="longActiveTab"
                    stretch
                ></p-balloon-tab>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                ],
                activeTab: 'detail',
                longTabs: range(10).map(() => faker.random.word()),
                longActiveTab: '',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <div>
                <div class="flex w-full mb-8" v-for="styleType in styleTypes" :key="styleType">
                    <p-balloon-tab :tabs="tabs"
                        v-model="activeTab"
                        :style-type="styleType"
                    >{{styleType}}</p-balloon-tab>
                </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                ],
                activeTab: 'detail',
                styleTypes: Object.values(BALLOON_TAB_STYLE_TYPE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Sizes: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <div>
                <div class="flex flex-wrap mb-8" v-for="size in sizes" :key="size">
                    <p-balloon-tab :tabs="tabs"
                        v-model="activeTab"
                        :size="size"
                        class="mr-8"
                    >{{size}}</p-balloon-tab>
                    <p-balloon-tab :tabs="tabs"
                        v-model="activeTab"
                        :size="size"
                        tail
                        class="mb-8"
                    >{{size}} with tail</p-balloon-tab>
                </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                ],
                activeTab: 'detail',
                sizes: Object.values(BALLOON_TAB_SIZE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Positions: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <div class="w-full h-full">
                <div class="mb-16" v-for="position in positions" :key="position">
                    <p class="font-bold text-2xl mb-4">{{position}}</p>
                    <p-balloon-tab :tabs="tabs"
                        v-model="activeTab"
                        :position="position"
                        tail
                    >
                        <div class="border border-coral-300 h-full min-h-32 flex justify-center items-center">
                            {{position}}
                        </div>
                    </p-balloon-tab>
                </div>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                    { name: 'many', label: 'Many tab items' },
                    { name: 'long', label: 'Long Long Long Long tab name' },
                ],
                activeTab: 'detail',
                positions: Object.values(BALLOON_TAB_POSITION),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const TabSlot: Story = {
    render: () => ({
        components: { PBalloonTab },
        template: `
            <div class="grid gap-8 grid-cols-1">
                <p-balloon-tab :tabs="tabs"
                    v-model="activeTab"
                    stretch
                    tail
                >
                    <div class="border border-coral-300 h-8 flex justify-center items-center"/>
                    <template #tab="{label, name}">
                        <div>
                            <div class="flex flex-col justify-between" style="height: 7.25rem; max-width: 12rem;">
                                <div class="text-4xl">
                                    <span>
                                        <span>$</span>
                                        <span class="font-bold">{{items[name].count}}</span>
                                    </span>
                                </div>
                                <div class="mb-2 whitespace-normal">
                                    {{ label }}
                                </div>
                            </div>
                        </div>
                    </template>
                </p-balloon-tab>
                <p-balloon-tab :tabs="tabs"
                    v-model="activeTab"
                    position="left"
                    :style-type="items[activeTab].styleType"
                    tail
                >
                    <div class="border border-coral-300 h-full flex justify-center items-center p-8">
                        You can give style type dynamically.
                    </div>
                    <template #tab="{label, name}">
                        <div class="flex justify-between items-center w-64 mobile:w-auto">
                            <span class="mr-4 flex-shrink-0">{{label}}</span>
                            <span class="text-lg flex-shrink-0">{{items[name].count}}</span>
                        </div>
                    </template>
                </p-balloon-tab>
            </div>
            <!--<div>-->
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'tags', label: 'Tags' },
                    { name: 'alert', label: 'Alerts' },
                ],
                items: {
                    detail: { count: '2,834', styleType: 'primary' },
                    info: { count: '3,234', styleType: 'peacock' },
                    tags: { count: '25,342', styleType: 'gray' },
                    alert: { count: '973,123', styleType: 'alert' },
                },
                activeTab: 'detail',
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
