import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getCollapsibleToggleArgTypes, getCollapsibleToggleParameters, getCollapsibleToggleArgs } from '@/data-display/collapsible/collapsible-toggle/story-helper';
import { useProxyValue } from '@/hooks';
import { I18nConnector } from '@/translations';

import PCollapsibleToggle from './PCollapsibleToggle.vue';

type PCollapsibleTogglePropsAndCustomArgs = ComponentProps<typeof PCollapsibleToggle>;

const meta : Meta<PCollapsibleTogglePropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible Toggle',
    component: PCollapsibleToggle,
    argTypes: {
        ...getCollapsibleToggleArgTypes(),
    },
    parameters: {
        ...getCollapsibleToggleParameters(),
    },
    args: {
        ...getCollapsibleToggleArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PCollapsibleToggle>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsibleToggle },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-toggle
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :toggle-type="toggleType"
                >
                    <span v-if="defaultSlot" v-html="defaultSlot"/>
                </p-collapsible-toggle>
                <div v-if="!proxyIsCollapsed">sample text</div>
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
        components: { PCollapsibleToggle },
        i18n: I18nConnector.i18n,
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-toggle v-model="isCollapsed" />
                <div v-if="!isCollapsed">sample text</div>
            </div>
        `,
        setup() {
            const state = reactive({
                isCollapsed: true,
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
