import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

// eslint-disable-next-line import/extensions
import { PLink, PToolboxTable } from '@/components.ts';
import { getCollapsiblePanelArgTypes, getCollapsiblePanelArgs, getCollapsiblePanelParameters } from '@/data-display/collapsible/collapsible-panel-v2/story-helper';
import { useProxyValue } from '@/hooks';
import { I18nConnector } from '@/translations';

import PCollapsiblePanelV2 from './PCollapsiblePanelV2.vue';

type PCollapsiblePanelPropsAndCustomArgs = ComponentProps<typeof PCollapsiblePanelV2>;

const meta : Meta<PCollapsiblePanelPropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible Panel v2',
    component: PCollapsiblePanelV2,
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
type Story = StoryObj<typeof PCollapsiblePanelV2>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanelV2, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel-v2
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :line-clamp="2"
                >
                      <div style="width : 400px; height: 500px;  border: 1px solid blue; padding: 20px;">
                            <div class="target2">
                                  span1span1span1span1span1span1span1
                                  span1span1span1
                                  span1span1span1span1span1span1
                                <span >
                                     span2span2span2span2span2span2span2
                                  span2span2span2span
                                </span>
                              
                          </div>
                      </div>
                      <div style="width: 100px;">
                        <p-link :text="'fsdfsdffsdfsdffsdfsdffsdfsdf'"></p-link>
                      </div>
                </p-collapsible-panel-v2>
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

export const Template2: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanelV2, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel-v2
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :line-clamp="2"
                >
                      <div style="width: 100px;">
                        <p-link :text="'fsdfsdffsdfsdffsdfsdffsdfsdf'"></p-link>
                      </div>
                </p-collapsible-panel-v2>
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

export const Template3: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanelV2, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel-v2
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :line-clamp="1"
                >
                  <div>
                    <span>spanTest1</span>
                    <span>spanTest2</span>
                    <span>spanTest3</span>
                  </div>
                </p-collapsible-panel-v2>
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

export const Template4: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanelV2, PLink, PToolboxTable },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel-v2
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :line-clamp="1"
                >
                  <div>
                    <span>spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3
                    </span>
                    <span>spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3spanTest1spanTest2spanTest3
                    </span>
                  </div>
                </p-collapsible-panel-v2>
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


export const LineClamp: Story = {
    render: () => ({
        components: { PCollapsiblePanelV2 },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 5</p>
                    <p-collapsible-panel-v2 :line-clamp="5">
                        {{contents}}
                    </p-collapsible-panel-v2>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 1 </p>
                    <p-collapsible-panel-v2 :line-clamp="1">
                        {{contents}}
                    </p-collapsible-panel-v2>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2 border-b">Line Clamp: 0</p>
                    <p-collapsible-panel-v2 :line-clamp="0">
                        {{contents}}
                    </p-collapsible-panel-v2>
                </div>
                <div class="p-4 mb-8">
                    <p class="text-xl font-bold mb-2">Line Clamp: -1</p>
                    <p class="border-b mb-2">If the value is negative, the toggle will be not shown.</p>
                    <p-collapsible-panel-v2 :line-clamp="-1">
                        {{contents}}
                    </p-collapsible-panel-v2>
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

export const Playground: Story = {
    ...Template,
};
