import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import mock from '@/data-display/dynamic/dynamic-layout/mock';
import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutMarkdownArgTypes } from '@/data-display/dynamic/dynamic-layout/templates/markdown/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- Markdown',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutMarkdownArgTypes(),
        slot: { table: { disable: true } },
        type: { table: { disable: true } },
        fetchOptions: { table: { disable: true } },
        typeOptions: { table: { disable: true } },
        fieldHandler: { table: { disable: true } },
    },
    args: {
        name: 'Base Information',
        options: mock.markdown.options,
        data: mock.markdown.data,
        language: 'en',
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
            <p-dynamic-layout :name="name" type="markdown"
                                :options="options"
                                :data="data"
                                :type-options="{
                                    language,
                                }"
                                :fetch-options="{
                                }"
                                class="w-full"
            />
        `,
    }),
};

export const WithData: Story = {
    ...Template,
    args: {
        type: 'markdown',
        options: {
            markdown: `
# Support Template
## Summery
you are using {{data.compute.instance_type}}
## Security Group Rules Raw Data
there is {{ data.security_group_rules | length }} rules in your instance
                \`\`\`json
                {{data.security_group_rules}}
                \`\`\`
            `,
        },
        data: {
            data: {
                compute: {
                    instance_type: 'm5.2xlarge',
                },
                security_group_rules: [
                    {
                        port_range_min: 80,
                        port_range_max: 80,
                        port: '80',
                        security_group_name: 'web security group',
                        security_group_id: '...',
                        remote_cidr: '172.16.0.0/16',
                        direction: 'inbound',
                        prtocol: 'TCP',
                        remote: '172.16.0.0/16',
                    },
                ],
            },
        },
    },
};

export const WithLanguage: Story = {
    ...Template,
    argTypes: {
        language: {
            control: {
                type: 'select',
                options: ['en', 'ko', 'ch'],
            },
        },
    },
    args: {
        type: 'markdown',
        options: {
            markdown: {
                en: '### Support English',
                ko: '### 한국어 지원',
            },
        },
    },
};

export const Playground: Story = {
    ...Template,
};
