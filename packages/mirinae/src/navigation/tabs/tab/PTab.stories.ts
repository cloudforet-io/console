import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/controls/buttons/button/PButton.vue';
import PCodeEditor from '@/controls/code-editor/PCodeEditor.vue';
import PBadge from '@/data-display/badge/PBadge.vue';
import { useProxyValue } from '@/hooks';
import {
    getTabArgTypes, getTabParameters, getTabArgs, Inner,
} from '@/navigation/tabs/tab/story-helper';


import PTab from './PTab.vue';

type PTabPropsAndCustomArgs = ComponentProps<typeof PTab>;

const meta : Meta<PTabPropsAndCustomArgs> = {
    title: 'navigation/Tabs/Tab',
    component: PTab,
    argTypes: {
        ...getTabArgTypes(),
    },
    parameters: {
        ...getTabParameters(),
    },
    args: {
        ...getTabArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTab>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTab },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-tab
                :tabs="tabs"
                :active-tab="proxyActiveTab"
                :stretch="stretch"
                @update:active-tab="onUpdateActiveTab"
                @change="onChange"
            >
                <div v-if="defaultSlot" v-html="defaultSlot"/>
            </p-tab>
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
        components: { PTab },
        template: `
          <div class="h-full w-full overflow p-8">
              <p-tab
                :tabs="tabs"
                :active-tab.sync="activeTab"
                ></p-tab>
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
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Stretch: Story = {
    render: () => ({
        components: { PTab },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
                    stretch
                    ></p-tab>
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
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const TabMenuType: Story = {
    render: () => ({
        components: { PTab, PCodeEditor },
        template: `
            <div class="w-full p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
                />
                <br/>
                <br/>
                <p-code-editor :code="JSON.stringify(tabs, null, 2)"
                               mode="readOnly"
                               style="height: 200px; max-height: 400px;"
                />
            </div>
            <!--<div>-->
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'divider', tabType: 'divider' },
                    { name: 'tags', label: 'Tags' },
                    {
                        name: 'Folder',
                        tabType: 'folder',
                        icon: 'ic_folder',
                        subItems: [
                            { name: 'sub1' },
                            { name: 'sub2' },
                        ],
                    },
                ],
                activeTab: 'detail',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const OverflowTabMenus: Story = {
    render: () => ({
        components: { PTab },
        template: `
            <div class="w-full p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
                />
            </div>
            <!--<div>-->
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                tabs: [
                    { name: 'detail', label: 'Detail' },
                    { name: 'info', label: 'Info' },
                    { name: 'divider', tabType: 'divider' },
                    { name: 'tags', label: 'Tags' },
                    { name: 'long menu', label: 'Long Menu' },
                    { name: 'long long menu', label: 'Long Long Long Menu' },
                    { name: 'long long long menu', label: 'Long Long Long Long Menu' },
                    { name: 'long long long long menu', label: 'Long Long Long Long Long Menu' },
                    { name: 'long long long long long menu', label: 'Long Long Long Long Long Long Menu' },
                    {
                        name: 'long long long long long long menu',
                        label: 'Long Long Long Long Long Long Long Menu',
                        tabType: 'folder',
                        icon: 'ic_folder',
                        subItems: [
                            { name: 'sub1' },
                            { name: 'sub2' },
                        ],
                    },
                ],
                activeTab: 'detail',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const SlotsforHeaderRightContents: Story = {
    render: () => ({
        components: { PTab, PButton },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
                >
                </p-tab>
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

export const SlotsforContents: Story = {
    render: () => ({
        components: { PTab },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
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
                </p-tab>
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
        components: { PTab, Inner },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
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
                </p-tab>
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

export const ExtraSlot: Story = {
    render: () => ({
        components: { PTab, PBadge },
        template: `
            <div class="h-full w-full overflow p-8">
                <p class="mb-6 font-bold text-xl">Slot Props: tab item (name, label, keepAlive)</p>
                <p-tab
                    :tabs="tabs"
                    :active-tab.sync="activeTab"
                >
                    <template #extra="tab">
                        <p-badge v-if="tab.name === 'info'" style-type="gray200">18</p-badge>
                    </template>
                </p-tab>
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
