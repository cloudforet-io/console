import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import {
    getButtonTabArgTypes, getButtonTabArgs, getButtonTabParameters, Inner,
} from '@/navigation/tabs/button-tab/story-helper';

import PButtonTab from './PButtonTab.vue';

type PButtonTabPropsAndCustomArgs = ComponentProps<typeof PButtonTab>;

const meta : Meta<PButtonTabPropsAndCustomArgs> = {
    title: 'Navigation/Tabs/Button Tab',
    component: PButtonTab,
    argTypes: {
        ...getButtonTabArgTypes(),
    },
    parameters: {
        ...getButtonTabParameters(),
    },
    args: {
        ...getButtonTabArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PButtonTab>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PButtonTab },
        template: `
            <p-button-tab
                :tabs="tabs"
                v-model="proxyActiveTab"
                @update:activeTab="onUpdateActiveTab"
                @change="onChange"
            >
                <div v-if="defaultSlot" v-html="defaultSlot"/>
            </p-button-tab>
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
        components: { PButtonTab },
        template: `
            <p-button-tab
                :tabs="['Basic Information', 'EC2']"
                v-model="activeTab"
            >
            </p-button-tab>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                activeTab: 'Basic Information',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const SlotsforContents: Story = {
    render: () => ({
        components: { PButtonTab },
        template: `
            <p-button-tab
                :tabs="tabs"
                v-model="activeTab"
            >
                <template #detail="slotProps">
                    <div class="p-4">
                        This is detail slot. <br/>
                        slot Props: <br/>
                        <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                    </div>
                </template>
                <template #info="slotProps">
                    <div class="p-4">
                        This is info slot. <br/>
                        slot Props: <br/>
                        <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                    </div>
                </template>
                <template #tags="slotProps">
                    <div class="p-4">
                        This is tags slot. <br/>
                        slot Props: <br/>
                        <pre class="mt-4 p-8 rounded bg-gray-200 w-full leading-6">{{slotProps}}</pre>
                    </div>
                </template>
            </p-button-tab>
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
        components: { PButtonTab, Inner },
        template: `
            <p-button-tab
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
            </p-button-tab>
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
