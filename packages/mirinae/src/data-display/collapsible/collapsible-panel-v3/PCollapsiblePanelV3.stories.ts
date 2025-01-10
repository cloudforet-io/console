import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

// eslint-disable-next-line import/extensions
import { PLink } from '@/components.ts';
import { getCollapsiblePanelArgTypes, getCollapsiblePanelArgs, getCollapsiblePanelParameters } from '@/data-display/collapsible/collapsible-panel-v3/story-helper';
import { useProxyValue } from '@/hooks';
import { I18nConnector } from '@/translations';

import PCollapsiblePanelV3 from './PCollapsiblePanelV3.vue';

type PCollapsiblePanelPropsAndCustomArgs = ComponentProps<typeof PCollapsiblePanelV3>;

const meta : Meta<PCollapsiblePanelPropsAndCustomArgs> = {
    title: 'Data Display/Collapsible/Collapsible Panel v3',
    component: PCollapsiblePanelV3,
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
type Story = StoryObj<typeof PCollapsiblePanelV3>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PCollapsiblePanelV3, PLink },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-collapsible-panel-v3
                    v-model="proxyIsCollapsed"
                    @update:isCollapsed="onUpdateIsCollapsed"
                    :line-clamp="lineClamp"
                >
<!--                  <div style="width : 400px; height: 500px;  border: 1px solid blue; padding: 20px;">-->
<!--                    <div style="width : 100px;  position: relative" class="target2">-->
<!--                              span1span1span1span1span1span1span1-->
<!--                              span1span1span1-->
<!--                              span1span1span1span1span1span1-->
<!--                            <span >-->
<!--                                 span2span2span2span2span2span2span2-->
<!--                              span2span2span2span-->
<!--                            </span>-->
<!--                      </div>-->
<!--                  </div>-->
                  <div style="width: 50px;">
                    <p-link :text="'fsdfsdffsdfsdffsdfsdffsdfsdf'"></p-link>
                  </div>
                </p-collapsible-panel-v3>
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
