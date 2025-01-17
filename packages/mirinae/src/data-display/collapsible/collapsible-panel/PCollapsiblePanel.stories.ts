import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getCollapsiblePanelArgTypes, getCollapsiblePanelArgs, getCollapsiblePanelParameters } from '@/data-display/collapsible/collapsible-panel/story-helper';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import { useProxyValue } from '@/hooks';
import PLink from '@/navigation/link/PLink.vue';
import { I18nConnector } from '@/translations';

import PCollapsiblePanel from './PCollapsiblePanel.vue';

type PCollapsiblePanelPropsAndCustomArgs = ComponentProps<typeof PCollapsiblePanel>;

const meta : Meta<PCollapsiblePanelPropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible Panel',
    component: PCollapsiblePanel,
    argTypes: {
        ...getCollapsiblePanelArgTypes(),
    },
    parameters: {
        ...getCollapsiblePanelParameters(),
    },
    args: {
        ...getCollapsiblePanelArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCollapsiblePanel>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanel },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel
                    v-model="proxyIsCollapsed"
                    :line-clamp="lineClamp"
                >
                    <div v-if="defaultSlot" v-html="defaultSlot"/>
                </p-collapsible-panel>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PCollapsiblePanel },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel>
                    {{contents}}
                </p-collapsible-panel>
            </div>
        `,
        setup() {
            const state = reactive({
                contents: faker.lorem.sentence(80),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const LineClamp: Story = {
    render: () => ({
        components: { PCollapsiblePanel },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 5</p>
                    <p-collapsible-panel :line-clamp="5">
                        {{contents}}
                    </p-collapsible-panel>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 1 </p>
                    <p-collapsible-panel :line-clamp="1">
                        {{contents}}
                    </p-collapsible-panel>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 0</p>
                    <p-collapsible-panel :line-clamp="0">
                        {{contents}}
                    </p-collapsible-panel>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2">Line Clamp: -1</p>
                    <p class="border-b mb-2">If the value is negative, the toggle will be not shown.</p>
                    <p-collapsible-panel :line-clamp="-1">
                        {{contents}}
                    </p-collapsible-panel>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                contents: faker.lorem.sentence(100),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const RecursiveBasic: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanel, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel
                    v-model="proxyIsCollapsed"
                    :recursive="true"
                    :line-clamp="1"
                >
                  <div>
                    <span>{{contents1}}</span>
                    <span>{{contents2}}</span>
                    <span>{{contents3}}</span>
                  </div>
                </p-collapsible-panel>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
                contents1: faker.lorem.sentence(50),
                contents2: faker.lorem.sentence(10),
                contents3: faker.lorem.sentence(10),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultiElements: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanel, PLink, PToolboxTable },
        template: `
                  <div class="h-full w-full overflow p-8">
                    <div class="p-4 mb-8">
                      <p class="text-xl font-bold mb-2 border-b">Line Clamp: 5</p>
                      <p-collapsible-panel :line-clamp="5" :recursive="true">
                        <div style=" height: 300px; border: 1px solid gray; padding: 20px;">
                          <div class="target2">
                            {{contents1}}
                            <span >{{contents2}}</span>
                          </div>
                        </div>
                        <div >
                          <span>{{ contents3 }}</span>
                        </div>
                      </p-collapsible-panel>
                    </div>
                    <div class="p-4 mb-8">
                      <p class="text-xl font-bold mb-2 border-b">Line Clamp: 7</p>
                      <p-collapsible-panel :line-clamp="7" :recursive="true">
                        <div style=" height: 300px; border: 1px solid gray; padding: 20px;">
                          <div class="target2">
                            {{contents1}}
                            <span >{{contents2}}</span>
                          </div>
                        </div>
                        <div>
                          <span>{{ contents3 }}</span>
                        </div>
                      </p-collapsible-panel>
                    </div>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
                contents1: faker.lorem.sentence(50),
                contents2: faker.lorem.sentence(50),
                contents3: faker.lorem.sentence(50),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};


export const MultiInlineElements: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanel, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel
                    v-model="proxyIsCollapsed"
                    :recursive="true"
                    :line-clamp="2"
                >
                  <div>  
                    <span>{{ contents1 }}
                        <span>{{ contents2 }}</span>
                        <span>{{ contents3 }}</span>
                        <span>{{ contents4 }}</span>
                    </span>
                  </div>
                </p-collapsible-panel>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
                contents1: faker.lorem.sentence(5),
                contents2: faker.lorem.sentence(5),
                contents3: faker.lorem.sentence(5),
                contents4: faker.lorem.sentence(5),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Advance: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanel, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel
                    v-model="proxyIsCollapsed"
                    :recursive="true"
                    :line-clamp="1"
                >
                  <p-link :text="contents"></p-link>
                </p-collapsible-panel>
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyIsCollapsed: useProxyValue('isCollapsed', props, emit),
                contents: faker.lorem.sentence(40),
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
