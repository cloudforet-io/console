import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import PDynamicLayout from '@/data-display/dynamic/dynamic-layout/PDynamicLayout.vue';
import { getDynamicLayoutQuerySearchTableArgTypes, getDynamicLayoutQuerySearchTableArgs } from '@/data-display/dynamic/dynamic-layout/templates/query-search-table/story-helper';
import { I18nConnector } from '@/translations';

type PDynamicLayoutPropsAndCustomArgs = ComponentProps<typeof PDynamicLayout>;

const meta : Meta<PDynamicLayoutPropsAndCustomArgs> = {
    title: 'Data Display/Dynamic/Dynamic Layout/- [Table] Query Search Table',
    component: PDynamicLayout,
    argTypes: {
        ...getDynamicLayoutQuerySearchTableArgTypes(),
    },
    args: {
        ...getDynamicLayoutQuerySearchTableArgs(),
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
          <p-dynamic-layout :name="name" type="query-search-table"
                              :options="options"
                              :data="data"
                              :type-options="{
                                  loading,
                                  totalCount,
                                  timezone,
                                  selectIndex,
                                  selectable,
                                  multiSelect,
                                  invalid,
                                  colCopy,
                                  excelVisible,
                                  settingsVisible,
                                  keyItemSets,
                                  valueHandlerMap
                              }"
                              :fetch-options="{
                                  sortBy,
                                  sortDesc,
                                  pageStart,
                                  pageLimit,
                                  queryTags
                              }"
                               style="max-height: inherit; width: 90%;"
                                @fetch="onFetch"
                                @select="onSelect"
                                @export="onExport"
                                @click-settings="onClickSettings"
                                @click-row="onClickRow"
                >
            </p-dynamic-layout>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PDynamicLayout },
        i18n: I18nConnector.i18n,
        template: `
            <p-dynamic-layout
                type="query-search-table"
                :options="options"
                :data="data"
                :type-options="typeOptions"
                :fetch-options="{}"
                style="max-height: inherit; width: 90%;"
                @fetch="fetchData"
                >
            </p-dynamic-layout>
        `,
        setup() {
            const state = reactive({
                typeOptions: {
                    loading: true,
                    totalCount: 0,
                },
                options: {
                    fields: [{
                        name: 'Instance ID',
                        key: 'server_id',
                    }, {
                        name: 'Region',
                        key: 'data.compute.region',
                    }, {
                        name: 'Changed Jobs',
                        key: 'data.collection_info.change_history.job_id',
                    }, {
                        name: 'Instance State',
                        key: 'data.compute.instance_state',
                        type: 'enum',
                        options: {
                            ACTIVE: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_check',
                                        color: 'green.500',
                                    },
                                },
                            },
                            DISCONNECTED: {
                                type: 'state',
                                options: {
                                    icon: {
                                        image: 'ic_plug-filled',
                                    },
                                },
                            },
                        },
                    }],
                },
                data: null as null|any[],
            });
            const fetchData = async (options = {} as any) => {
                state.typeOptions.loading = true;
                state.data = await new Promise<any[]>((resolve) => {
                    setTimeout(() => {
                        state.typeOptions.totalCount = faker.datatype.number({ min: 0 });
                        resolve(range(options.pageLimit || 15)
                            .map(() => ({
                                // eslint-disable-next-line camelcase
                                server_id: faker.datatype.uuid(),
                                data: {
                                    compute: {
                                        region: faker.random.word(),
                                        // eslint-disable-next-line camelcase
                                        instance_state: faker.helpers.arrayElements(['ACTIVE', 'DISCONNECTED']),
                                    },
                                    collection_info: {
                                        change_history: range(faker.datatype.number({ min: 0, max: 10 })).map(() => ({ job_id: faker.datatype.uuid() })),
                                    },
                                },
                            })));
                    }, 1000);
                });
                state.typeOptions.loading = false;
            };
            fetchData();
            return {
                ...toRefs(state),
                fetchData,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
