import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getCollapsiblePanelArgTypes } from '@/data-display/collapsible/collapsible-panel/story-helper';
import { useProxyValue } from '@/hooks';
import { I18nConnector } from '@/translations';

import PCollapsiblePanel from './PCollapsiblePanel.vue';


type PCollapsiblePanelPropsAndCustomArgs = ComponentProps<typeof PCollapsiblePanel>;

const meta : Meta<PCollapsiblePanelPropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible Panel',
    component: PCollapsiblePanel,
    argTypes: {
        ...getCollapsiblePanelArgTypes(),
        default: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
        },
    },
    args: {
        'v-model': '',
        isCollapsed: true,
        lineClamp: 2,
        defaultSlot: faker.lorem.sentence(40),
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
                    @update:isCollapsed="onUpdateIsCollapsed"
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

export const Playground: Story = {
    ...Template,
};
