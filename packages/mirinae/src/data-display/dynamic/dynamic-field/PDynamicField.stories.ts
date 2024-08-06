import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getDynamicFieldArgTypes, getDynamicFieldArgs } from '@/data-display/dynamic/dynamic-field/story-helper';

import PDynamicField from './PDynamicField.vue';

type PDynamicFieldPropsAndCustomArgs = ComponentProps<typeof PDynamicField>;

const meta : Meta<PDynamicFieldPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Field',
    component: PDynamicField,
    argTypes: {
        ...getDynamicFieldArgTypes(),
    },
    args: {
        ...getDynamicFieldArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDynamicField>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDynamicField },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-dynamic-field v-bind="$props"></p-dynamic-field>
            </div>
        `,
    }),
};

export const TextType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p-dynamic-field type="text" :options="{}" data="Basic text type"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="text" :options="{link: 'https://www.google.com'}" data="Text type with link"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="list" :options="{
                    sub_key: 'data',
                    item: {
                        options: {
                            link: 'https://www.google.com'
                        },
                        type: 'text'
                    }
                }" :data="'Text type with link in list(list will be deprecated)'.split(' ').map(d => ({ data: d}))"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold my-4 text-lg">postfix (%)</p>
                <p-dynamic-field type="text" :options="{postfix: '%'}" data="70"></p-dynamic-field>
                <p class="font-bold my-4 text-lg">prefix (-)</p>
                <p-dynamic-field type="text" :options="{prefix: '-'}" data="70"></p-dynamic-field>
            </div>
        `,
    }),
};

export const BadgeType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p-dynamic-field type="badge" :options="{}" data="Basic badge type"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="badge" :options="{link: 'https://github.com/cloudforet-io'}" data="Basic badge type with link"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="list" :options="{
                    sub_key: 'data',
                    item: {
                        options: {
                            link: 'https://www.google.com'
                        },
                        type: 'badge'
                    }
                }" :data="'Basic badge type with link in list(list will be deprecated)'.split(' ').map(d => ({ data: d}))"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="badge" :options="{outline_color: 'yellow.700', link: 'https://www.google.com'}" data="Outlined badge type with link"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="badge" :options="{shape: 'SQUARE'}" data="Square badge type"></p-dynamic-field>
                <br/><br/>
                <p-dynamic-field type="badge" :options="{text_color: 'peacock.700', background_color: 'coral.300'}" data="Custom Colored badge type"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold my-4 text-lg">postfix (%)</p>
                <p-dynamic-field type="badge" :options="{postfix: '%'}" data="70"></p-dynamic-field>
                <p class="font-bold my-4 text-lg">prefix (-)</p>
                <p-dynamic-field type="badge" :options="{prefix: '-'}" data="70"></p-dynamic-field>
            </div>
        `,
    }),
};

export const DatetimeType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p class="font-bold text-lg">with 'iso8601' source_type</p><br/>
                <span>basic: </span>
                <p-dynamic-field type="datetime" :options="{source_type: 'iso8601'}" :data="new Date().toISOString()"></p-dynamic-field>
                <br/><br/>
                <span>with different display_format: </span>
                <p-dynamic-field type="datetime" :options="{link: 'https://github.com/cloudforet-io', source_type: 'iso8601', display_format: 'YY.MM.DD hh:mm:ss'}" :data="new Date().toISOString()">
                </p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with 'timestamp' source_type, 'seconds' source_format</p><br/>
                <p-dynamic-field type="datetime" :options="{source_type: 'timestamp', source_format: 'seconds'}" :data="{seconds: '1616034252', nanos: 345000000}"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with 'timestamp' source_type, 'seconds' source_format, 'YYYY-MM-DD HH:mm:ss' display_format </p><br/>
                <p-dynamic-field type="datetime" :options="{source_type: 'timestamp', source_format: 'seconds', display_format: 'YYYY-MM-DD HH:mm:ss'}" :data="3600"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold my-4 text-lg">postfix ( - ISO8601)</p>
                <p-dynamic-field type="datetime" :options="{source_type: 'iso8601', postfix: ' - ISO8601'}" :data="new Date().toISOString()"></p-dynamic-field>
                <p class="font-bold my-4 text-lg">prefix (Time: )</p>
                <p-dynamic-field type="datetime" :options="{source_type: 'iso8601', prefix: 'Time: '}" :data="new Date().toISOString()"></p-dynamic-field>
            </div>
        `,
    }),
};

export const DictType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p class="font-bold text-lg">basic</p><br/>
                <p-dynamic-field type="dict" :options="{}" :data="{a: 'aa', b: 'bb'}"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with link</p><br/>
                <p-dynamic-field type="dict" :options="{link: 'https://www.google.com'}" :data="{a: 'aa', b: 'bb'}"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold my-4 text-lg">postfix ( days)</p>
                <p-dynamic-field type="dict" :options="{postfix: ' days', link: 'https://www.google.com'}" :data="{a: '111', b: '222'}"></p-dynamic-field>
                <p class="font-bold my-4 text-lg">prefix (days: )</p>
                <p-dynamic-field type="dict" :options="{prefix: 'days: '}" :data="{a: '111', b: '222'}"></p-dynamic-field>
            </div>
        `,
    }),
};

export const StateType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p class="font-bold text-lg">basic</p><br/>
                <p-dynamic-field type="state" :options="{link: 'https://github.com/cloudforet-io'}" data="RUNNING"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with text color</p><br/>
                <p-dynamic-field type="state" :options="{text_color: 'green.400'}" data="RUNNING"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with icon color</p><br/>
                <p-dynamic-field type="state" :options="{icon: {color: 'green.400'}}" data="RUNNING"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold text-lg">with icon color</p><br/>
                <p-dynamic-field type="state" :options="{icon: {image: 'ic_error-filled'}}" data="RUNNING"></p-dynamic-field>
                <br/><br/>
                <p class="font-bold my-4 text-lg">postfix ( state)</p>
                <p-dynamic-field type="state" :options="{postfix: ' state', icon: {color: 'green.400'}}" data="RUNNING"></p-dynamic-field>
                <p class="font-bold my-4 text-lg">prefix (state: )</p>
                <p-dynamic-field type="state" :options="{prefix: 'state: ', icon: {color: 'green.400'}}" data="RUNNING"></p-dynamic-field>
            </div>
        `,
    }),
};

export const EnumType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p class="font-bold text-lg">usual case</p><br/>
                <p-dynamic-field type="enum" :options="options" data="RUNNING"></p-dynamic-field><br/>
                <p-dynamic-field type="enum" :options="options" data="DEALLOCATED"></p-dynamic-field><br/>
                <p-dynamic-field type="enum" :options="options" data="PENDING"></p-dynamic-field><br/>
                <p-dynamic-field type="enum" :options="options" data="TERMINATED"></p-dynamic-field><br/>
                <br/>
                <p class="font-bold text-lg">default case</p><br/>
                <p-dynamic-field type="enum" :options="options"></p-dynamic-field><br/>
                <br/><br/>
            </div>
        `,
        setup() {
            const options = {
                items: {
                    DEALLOCATED: {
                        name: 'Deallocated',
                        type: 'state',
                        options: {
                            text_color: 'red.500',
                            icon: { color: 'red.500' },
                            postfix: ' (this is postfix)',
                        },
                    },
                    PENDING: {
                        name: 'Pending',
                        type: 'state',
                        options: { icon: { color: 'yellow.500' } },
                    },
                    RUNNING: {
                        name: 'Running',
                        type: 'state',
                        options: { icon: { color: 'green.500' }, link: 'https://github.com/cloudforet-io' },
                    },
                    TERMINATED: {
                        name: 'Terminated',
                        options: {
                            text_color: 'gray.500',
                            icon: { color: 'gray.500' },
                            description: 'This state is ',
                        },
                        type: 'state',
                    },
                },
                default: 'TERMINATED',
            };
            return {
                options,
            };
        },
    }),
};

export const SizeType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p class="font-bold text-lg">auto case</p><br/>
                <p-dynamic-field type="size" :options="{link: 'https://github.com/cloudforet-io'}" :data="123456789"></p-dynamic-field><br/>
                <br/>
                <p class="font-bold text-lg">from bytes to bytes, mb, gb, tb, pb</p><br/>
                <p-dynamic-field type="size" :options="{display_unit: 'BYTES'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{display_unit: 'MB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{display_unit: 'GB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{display_unit: 'TB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{display_unit: 'PB'}" :data="123456789"></p-dynamic-field><br/>
                <br/>
                <p class="font-bold text-lg">from bytes, mb, gb, tb, pb to auto</p><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'BYTES'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'MB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'GB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'TB'}" :data="123456789"></p-dynamic-field><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'PB'}" :data="123456789"></p-dynamic-field><br/>
                <br/>
                <p class="font-bold text-lg">from kb to gb</p><br/>
                <p-dynamic-field type="size" :options="{source_unit: 'KB', display_unit: 'GB', postfix: ' - this is postfix'}" :data="123456789"></p-dynamic-field><br/>
                <br/>
            </div>
        `,
    }),
};

export const MoreType: Story = {
    render: () => ({
        components: { PDynamicField },
        template: `
            <div>
                <p>field type: more > layout: popup > layout: raw</p>
                <p-dynamic-field type="more" :options="rawOptions" :data="data" :type-options="typeOptions" />
                <br><br>
                <p>field type: more > layout: popup > layout: item</p>
                <p-dynamic-field type="more" :options="itemOptions" :data="data" :type-options="typeOptions" />
                <br><br>
            </div>
        `,
        setup() {
            return {
                rawOptions: {
                    sub_key: 'info',
                    layout: {
                        type: 'popup',
                        options: {
                            layout: {
                                type: 'raw',
                                options: {},
                            },
                        },
                    },
                    postfix: '(Jung)',
                },
                itemOptions: {
                    layout: {
                        type: 'popup',
                        options: {
                            layout: {
                                type: 'items',
                                options: {
                                    fields: [
                                        { key: 'id', label: 'ID', type: 'text' },
                                        { key: 'name', label: 'Name', type: 'text' },
                                        { key: 'info', label: 'Info', type: 'dict' },
                                    ],
                                },
                            },
                        },
                    },
                    postfix: '(Jung)',
                },
                data: { id: 'j', name: 'sulmo', info: { weight: '83.5 kg', height: '179.3cm' } },
                typeOptions: { displayKey: 'name' },
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
