import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import mock from '@/data-display/dynamic/dynamic-layout/mock';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutSimpleTableArgTypes } from '@/data-display/dynamic/dynamic-layout/templates/simple-table/story-helper';
import { I18nConnector } from '@/translations';


type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- [Table] Simple Table',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutSimpleTableArgTypes(),
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    },
    args: {
        name: 'Base Information',
        options: mock.simpleTable.options,
        data: mock.table.data,
        loading: false,
        timezone: 'UTC',
        colCopy: false,
    },
};

export default meta;
type Story = StoryObj<typeof PDynamicLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDynamicLayout },
        i18n: I18nConnector.i18n,
        template: `
            <p-dynamic-layout :name="name" type="simple-table"
                                :options="options"
                                :data="data"
                                :type-options="{
                                    loading,
                                    timezone,
                                    colCopy,
                                }"
                                :fetch-options="{
                                }"
                                class="w-full"
                >
            </p-dynamic-layout>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
    args: {
        options: {
            root_path: 'data.security_groups.security_group_rules',
            fields: [
                {
                    name: 'Security Group Name',
                    key: 'security_group_name',
                    type: 'text',
                },
                {
                    name: 'Security Group ID',
                    type: 'text',
                    reference: {
                        resource_type: 'inventory.CloudService',
                        reference_key: 'reference.resource_id',
                    },
                    key: 'security_group_id',
                },
                {
                    type: 'enum',
                    key: 'direction',
                    name: 'Direction',
                    options: {
                        egress: {
                            options: {
                                background_color: 'indigo.500',
                            },
                            type: 'badge',
                        },
                        ingress: {
                            type: 'badge',
                            options: {
                                background_color: 'coral.600',
                            },
                        },
                    },
                },
                {
                    type: 'text',
                    name: 'Type',
                    key: 'ethertype',
                },
                {
                    name: 'Start',
                    type: 'text',
                    key: 'port_range_min',
                },
                {
                    name: 'End',
                    type: 'text',
                    key: 'port_range_max',
                },
                {
                    name: 'Protocol',
                    key: 'protocol',
                    type: 'enum',
                    options: {
                        udp: {
                            options: {
                                background_color: 'peacock.500',
                            },
                            type: 'badge',
                        },
                        icmp: {
                            options: {
                                background_color: 'green.500',
                            },
                            type: 'badge',
                        },
                        tcp: {
                            type: 'badge',
                            options: {
                                background_color: 'indigo.500',
                            },
                        },
                        all: {
                            options: {
                                background_color: 'coral.600',
                            },
                            type: 'badge',
                        },
                    },
                },
                {
                    type: 'text',
                    name: 'Remote',
                    key: 'remote_ip_prefix',
                },
                {
                    key: 'created_at',
                    name: 'Created',
                    type: 'datetime',
                },
            ],
        },
        data: {
            data: {
                id: faker.datatype.uuid(),
                name: faker.lorem.sentence(2),
                security_groups: [
                    {
                        security_group_rules: Array.from(Array(10).keys()).map(() => ({
                            direction: 'ingress',
                            port_range_min: 1,
                            created_at: '2021-06-30T04:33:40.000000+0000',
                            security_group_id: faker.datatype.uuid(),
                            protocol: 'tcp',
                            id: faker.datatype.uuid(),
                            ethertype: 'IPv4',
                            remote_ip_prefix: '0.0.0.0/0',
                            security_group_name: 'default',
                            port_range_max: 65535,
                            external_link: null,
                            region_name: null,
                        })),
                        name: 'default',
                        description: 'Default security group',
                        created_at: '2021-06-28T06:33:28.000000+0000',
                        external_link: null,
                        updated_at: '2021-06-30T06:07:53.000000+0000',
                        id: faker.datatype.uuid(),
                        tenant_id: faker.datatype.uuid(),
                        region_name: 'RegionOne',
                        project_id: faker.datatype.uuid(),
                    },
                ],
            },
        },
    },
};
