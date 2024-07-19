import { toRefs, reactive } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PDefinition from '@/data-display/tables/definition-table/definition/PDefinition.vue';
import { getDefinitionArgs, getDifinitionParameters, getDefinitionArgTypes } from '@/data-display/tables/definition-table/definition/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

type PDefinitionPropsAndCustomArgs = ComponentProps<typeof PDefinition>;

const meta : Meta<PDefinitionPropsAndCustomArgs> = {
    title: 'Data Display/Tables/Definition Table/Definition',
    component: PDefinition,
    argTypes: {
        ...getDefinitionArgTypes(),
    },
    parameters: {
        ...getDifinitionParameters(),
    },
    args: {
        ...getDefinitionArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDefinition>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDefinition },
        template: `
            <p-definition
                :name="name"
                :label="label"
                :data="data"
                :disable-copy="disableCopy"
                :formatter="formatter"
                :block="block"
                :copy-value="copyValue"
                :auto-key-width="autoKeyWidth"
                :custom-key-width="customKeyWidth"
            >
            </p-definition>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <table>
                <tbody>
                    <p-definition
                        name="string data"
                        :data="data.stringData"
                    />
                    <p-definition
                        name="object data"
                        :data="data.objectData"
                    />
                    <p-definition
                        name="array data"
                        :data="data.arrayData"
                    />
                    <p-definition
                        name="boolean data"
                        :data="data.booleanData"
                    />
                    <p-definition
                        name="number data"
                        :data="data.numberData"
                    />
                </tbody>
            </table>
        `,
        setup() {
            const state = reactive({
                data: {
                    stringData: 'string data',
                    objectData: { name: 'object data' },
                    arrayData: ['array', 'data'],
                    booleanData: true,
                    numberData: 13,
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DisableCopy: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <div>
                <p-definition
                    :label="label"
                    :data="data"
                    disable-copy
                />
                <p-definition
                    :label="label2"
                    :data="data2"
                    disable-copy
                />
                <p-definition
                    :label="label3"
                    :data="data3"
                    disable-copy
                />
            </div>
        `,
        setup() {
            return {
                label: faker.lorem.sentence(5),
                data: faker.lorem.sentence(20),
                label2: faker.lorem.sentence(15),
                data2: faker.lorem.sentence(5),
                label3: faker.lorem.sentence(5),
                data3: faker.lorem.sentence(5),
            };
        },
    }),
};

export const CustomCopyValue: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <div>
                <p class="mb-4">Copy Value: {{copyValue}}</p>
                <p-definition
                    :label="label"
                    :data="data"
                    :copy-value="copyValue"
                />
                <p class="my-4">Copy Value Formatter:</p>
                <pre class="mb-4">
                (data) => {
                    return data + ' [' + copyValue + ']'
                }
                </pre>
                <p-definition
                    :label="label"
                    :data="data"
                    :copy-value-formatter="copyValueFormatter"
                />
            </div>
        `,
        setup() {
            const copyValue = faker.datatype.uuid();
            return {
                label: faker.lorem.sentence(5),
                data: faker.lorem.sentence(20),
                copyValue,
                copyValueFormatter: (data) => `${data} [${copyValue}]`,
            };
        },
    }),
};

export const WithFormatter: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <table>
                <tbody>
                    <p-definition
                        name="without formatter"
                        :data="numberData"
                    />
                    <p-definition
                        name="with formatter"
                        :data="numberData"
                        :formatter="commaFormatter"
                    />
                </tbody>
            </table>
        `,
        setup() {
            const state = reactive({
                numberData: 1234567890,
            });
            const commaFormatter = (num) => {
                if (num) return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return num;
            };
            return {
                ...toRefs(state),
                commaFormatter,
            };
        },
    }),
};

export const Block: Story = {
    render: () => ({
        components: { PDefinition, PButton },
        template: `
            <table class="w-full">
                <tbody>
                    <p-definition
                        name="Default(block: false)"
                        label="Default(block: false)"
                        :data="data"
                    >
                        <template #extra>
                            <p-button style-type="highlight" size="sm">Edit</p-button>
                        </template>
                    </p-definition>
                    <p-definition
                        name="Block(block: true)"
                        label="Block(block: true)"
                        :data="data"
                        block
                    >
                        <template #extra>
                            <p-button style-type="highlight" size="sm">Edit</p-button>
                        </template>
                    </p-definition>
                </tbody>
            </table>
            <!-- <div> -->
        `,
        setup() {
            return {
                data: faker.lorem.sentence(1),
            };
        },
    }),
};

export const AutoKeyWidth: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <table>
                <tbody>
                    <p-definition
                        name="string data"
                        :data="data.stringData"
                        auto-key-width
                    />
                    <p-definition
                        name="object data"
                        :data="data.objectData"
                        auto-key-width
                    />
                    <p-definition
                        name="array data"
                        :data="data.arrayData"
                        auto-key-width
                    />
                    <p-definition
                        name="boolean data"
                        :data="data.booleanData"
                        auto-key-width
                    />
                    <p-definition
                        name="number data"
                        :data="data.numberData"
                        auto-key-width
                    />
                    <p-definition
                        name="long string data"
                        :data="data.longStringData"
                        auto-key-width
                    />
                    <p-definition
                        name="long string data with long, long, long, long, long, long key"
                        :data="data.longStringData"
                        auto-key-width
                    />
                    <p-definition
                        name="long string data with long, long, long, long, long, long key & disable copy"
                        :data="data.longStringData"
                        auto-key-width
                        disable-copy
                    />
                    <p-definition
                        name="short string data with long, long, long, long, long, long key"
                        :data="data.stringData"
                        auto-key-width
                    />
                    <p-definition
                        name="short string data with long, long, long, long, long,
                            long, long, long, long, long, long, long, long, long, long, long, long, long, long, long, long, long key & disable copy"
                        :data="data.stringData"
                        auto-key-width
                        disable-copy
                    />
                </tbody>
            </table>
        `,
        setup() {
            const state = reactive({
                data: {
                    stringData: 'string data',
                    objectData: { name: 'object data' },
                    arrayData: ['array', 'data'],
                    booleanData: true,
                    numberData: 13,
                    longStringData: faker.lorem.sentence(30),
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const CustomWidthofKey: Story = {
    render: () => ({
        components: { PDefinition },
        template: `
            <table>
                <tbody>
                    <p-definition
                        name="string data"
                        :data="data.stringData"
                        custom-key-width="10rem"
                    />
                    <p-definition
                        name="object data"
                        :data="data.objectData"
                        custom-key-width="20rem"
                    />
                    <p-definition
                        name="array data"
                        :data="data.arrayData"
                        custom-key-width="30rem"
                    />
                </tbody>
            </table>
        `,
        setup() {
            const state = reactive({
                data: {
                    stringData: 'string data',
                    objectData: { name: 'object data' },
                    arrayData: ['array', 'data'],
                },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PDefinition, PButton },
        template: `
            <table class="w-full">
                <tbody>
                    <p-definition
                        name="Key Slot"
                        data="Slot: key"
                    >
                        <template #key="{value}">
                            <span class="text-peacock">{{value}}</span>
                        </template>
                    </p-definition>
                    <p-definition
                        name="Default Slot"
                        data="Slot: default"
                    >
                        <template #default="{value}">
                            <span class="ext-peacock'">{{value}}</span>
                        </template>
                    </p-definition>
                    <p-definition
                        name="Extra Slot"
                        data="Slot: extra"
                    >
                        <template #extra>
                            <p-button style-type="highlight" size="sm">Edit</p-button>
                        </template>
                    </p-definition>
                </tbody>
            </table>
            <!--<div>-->
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
