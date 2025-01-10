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
                    :line-clamp="lineClamp"
                >
                      <div style="width : 400px; height: 500px;  border: 1px solid blue; padding: 20px;">
                            <div style="width : 100px;  position: relative" class="target2">
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
                fields: [
                    {
                        name: 'name',
                        label: 'Name',
                    },
                    {
                        name: 'phone',
                        label: 'Phone',
                    },
                    {
                        name: 'email',
                        label: 'Email',
                    },
                    {
                        name: 'cost',
                        label: 'Cost',
                        textAlign: 'right',
                    },
                    {
                        name: 'homepage',
                        label: 'Home Page',
                    },
                ],
                items: [
                    {
                        name: 'Aurelia',
                        phone: '(664) 233-6067',
                        email: 'Ivory_Wehner@hotmail.com',
                        cost: '345.00',
                        homepage: 'http://perky-unique.name',
                    },
                    {
                        name: 'Verda',
                        phone: '896.518.5329',
                        email: 'Winifred30@yahoo.com',
                        cost: '625.00',
                        homepage: 'https://flat-mandate.biz',
                    },
                    {
                        name: 'Candido',
                        phone: '(835) 824-2428 x6397',
                        email: 'Anne33@yahoo.com',
                        cost: '789.00',
                        homepage: 'http://shiny-astrologer.org',
                    },
                    {
                        name: 'Meaghan',
                        phone: '844.500.5767 x430',
                        email: 'Buddy26@hotmail.com',
                        cost: '131.00',
                        homepage: 'http://apprehensive-control.info',
                    },
                    {
                        name: 'Ila',
                        phone: '215-621-0636 x109',
                        email: 'Leora38@gmail.com',
                        cost: '693.00',
                        homepage: 'https://appropriate-escort.net',
                    },
                    {
                        name: 'Arielle',
                        phone: '845.855.0437 x27740',
                        email: 'Lue_Bergstrom86@gmail.com',
                        cost: '868.00',
                        homepage: 'https://confused-potato.org',
                    },
                    {
                        name: 'John',
                        phone: '861-576-0313 x60830',
                        email: 'Hulda98@yahoo.com',
                        cost: '778.00',
                        homepage: 'https://annual-testament.com',
                    },
                ],
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
