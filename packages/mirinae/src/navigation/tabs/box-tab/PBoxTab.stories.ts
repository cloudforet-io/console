import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { BOX_TAB_STYLE_TYPE } from '@/navigation/tabs/box-tab/config';
import {
    getBoxTabArgTypes, getBoxTabParameters, getBoxTabArgs, Inner,
} from '@/navigation/tabs/box-tab/story-helper';

import PBoxTab from './PBoxTab.vue';

type PBoardItemPropsAndCustomArgs = ComponentProps<typeof PBoxTab>;

const meta : Meta<PBoardItemPropsAndCustomArgs> = {
    title: 'Navigation/Tabs/Box Tab',
    component: PBoxTab,
    argTypes: {
        ...getBoxTabArgTypes(),
    },
    parameters: {
        ...getBoxTabParameters(),
    },
    args: {
        ...getBoxTabArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PBoxTab>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PBoxTab },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-box-tab
                    :tabs="tabs"
                    v-model="proxyActiveTab"
                    :style-type="styleType"
                    @update:activeTab="onUpdateActiveTab"
                    @change="onChange"
                >
                    <div v-if="defaultSlot" v-html="defaultSlot"/>
                </p-box-tab>
            </div>
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
        components: { PBoxTab },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-box-tab
                    :tabs="['Google Oauth2', 'Local', 'API only']"
                    v-model="activeTab"
                >
                </p-box-tab>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                activeTab: 'Local',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypes: Story = {
    render: () => ({
        components: { PBoxTab },
        template: `
            <div>
                <div class="flex w-full mb-8" v-for="styleType in styleTypes" :key="styleType">
                    <p-box-tab :tabs="tabs"
                        v-model="activeTab"
                        :style-type="styleType"
                    >{{styleType}}</p-box-tab>
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
                styleTypes: Object.values(BOX_TAB_STYLE_TYPE),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const SlotsforContents: Story = {
    render: () => ({
        components: { PBoxTab },
        template: `
            <div class="p-6 w-full">
                <p-box-tab
                    :tabs="tabs"
                    v-model="activeTab"
                >
                    <template #detail="slotProps">
                        <div>
                            This is detail slot. <br/>
                            slot Props: <br/>
                            <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                        </div>
                    </template>
                    <template #info="slotProps">
                        <div>
                            This is info slot. <br/>
                            slot Props: <br/>
                            <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                        </div>
                    </template>
                    <template #tags="slotProps">
                        <div>
                            This is tags slot. <br/>
                            slot Props: <br/>
                            <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                        </div>
                    </template>
                </p-box-tab>
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
                ],
                activeTab: 'detail',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const KeepAlive: Story = {
    render: () => ({
        components: { PBoxTab, Inner },
        template: `
            <div class="p-6 w-full h-full">
                <p-box-tab
                    :tabs="tabs"
                    v-model="activeTab"
                >
                    <template #detail="{name}">
                        <inner key="detail" name="Detail. this tab is keep alive."/>
                    </template>
                    <template #info>
                        <inner name="info. this tab is NOT keep alive. If you select another tab and then return to this tab, it will return to the initial state." />
                    </template>
                    <template #tags="{name}">
                        <inner key="tags" name="Tags. this tab is keep alive."/>
                    </template>
                </p-box-tab>
            </div>
            <!--<div>-->
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail', keepAlive: true },
                    { name: 'info', label: 'Info', keepAlive: false },
                    { name: 'tags', label: 'Tags', keepAlive: true },
                ],
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
