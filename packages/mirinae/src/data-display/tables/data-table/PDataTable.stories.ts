import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';


import { getUserFields, getUsers, getLongUsers } from '@/data-display/tables/data-table/mock';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import { getDataTableDefaultArgs, getDataTableArgsType } from '@/data-display/tables/data-table/story-helper';
import { useProxyValue } from '@/hooks';
import PToggleButton from '@/inputs/buttons/toggle-button/PToggleButton.vue';
import PTextarea from '@/inputs/textarea/PTextarea.vue';


import { DATA_TABLE_STYLE_TYPE } from './config';


type PDataTablePropsAndCustomArgs = ComponentProps<typeof PDataTable>;

const meta : Meta<PDataTablePropsAndCustomArgs> = {
    title: 'Data Display/Tables/Data Table',
    component: PDataTable,
    argTypes: {
        ...getDataTableArgsType(),
        head: { table: { disable: true } },
        'th-format': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`th-${field.name}`': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`th-${field.name}-format`': { table: { disable: true } },
        'no-data': { table: { disable: true } },
        'no-data-format': { table: { disable: true } },
        body: { table: { disable: true } },
        'col-format': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`col-${field.name}-format`': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`col-${colIndex}-format`': { table: { disable: true } },
        foot: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
        },
    },
    args: {
        ...getDataTableDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDataTable>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDataTable },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-data-table
                :loading="loading"
                :fields="fields"
                :items="items"
                :sortable="sortable"
                :sortBy.sync="proxySortBy"
                :sortDesc.sync="proxySortDesc"
                :colCopy="colCopy"
                :selectable="selectable"
                :selectIndex.sync="proxySelectIndex"
                :multiSelect="multiSelect"
                :rowClickMultiSelectMode="rowClickMultiSelectMode"
                :useCursorLoading="useCursorLoading"
                :tableStyleType="tableStyleType"
                :tableCustomStyle="tableCustomStyle"
                :striped="striped"
                :bordered="bordered"
                :disableHover="disableHover"
                :rowHeightFixed="rowHeightFixed"
                :rowCursorPointer="rowCursorPointer"
                :invalid="invalid"
                :getRowClassNames="getRowClassNames"
                :getRowSelectable="getRowSelectable"
                :beautify-text="beautifyText"
                @select="onSelect"
                @rowLeftClick="onRowLeftClick"
                @changeSort="onChangeSort"
                @update:selectIndex="onUpdateSelectIndex"
                @update:sortBy="onUpdateSortBy"
                @update:sortDesc="onUpdateSortDesc"
            >
            </p-data-table>
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySortBy: useProxyValue('sortBy', props, emit),
                proxySortDesc: useProxyValue('sortDesc', props, emit),
                proxySelectIndex: useProxyValue('selectIndex', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <p-data-table :fields="fields" :items="items" />
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(7, 7),
            };
        },
    }),
};

export const MultipleColumns: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
                <p class="px-4 mb-4 font-bold font-lg">Non Invisible Case</p>
                <p-data-table :fields="fields" :items="items" selectable col-copy />
                <p class="px-4 my-4 font-bold font-lg">Invisible Case</p>
                <p-data-table :fields="invisibleFields" :items="items" selectable col-copy />
            </div>
        `,
        setup() {
            return {
                fields: [
                    { name: 'name', label: 'Name' },
                    {
                        name: 'info',
                        label: 'Information',
                        textAlign: 'center',
                        children: [
                            { name: 'phone', label: 'Phone' },
                            { name: 'email', label: 'Email' },
                        ],
                    },
                    { name: 'cost', label: 'Cost' },
                ],
                invisibleFields: [
                    { name: 'name', label: 'Name' },
                    {
                        name: 'info',
                        label: 'Information',
                        textAlign: 'center',
                        children: [
                            { name: 'phone', label: 'Phone', invisible: true },
                            { name: 'email', label: 'Email', invisible: true },
                        ],
                    },
                    { name: 'cost', label: 'Cost' },
                ],
                items: getUsers(7, 7),
            };
        },
    }),
};

export const Sortable: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <p-data-table :fields="fields" :items="items"
                sortable :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
            />
        `,
        setup() {
            const fields = getUserFields();
            const state = reactive({
                items: getUsers(5, 5),
                sortBy: fields[0].name,
                sortDesc: true,
            });
            return {
                ...toRefs(state),
                fields,
            };
        },
    }),
};

export const ColumnCopy: Story = {
    render: () => ({
        components: { PDataTable, PTextarea },
        template: `
            <div>
                <p class="mb-4 text-gray-700">Click copy button and check copied data by paste to textarea below.</p>
                <p-textarea class="mb-4" />
                <p-data-table :fields="fields" :items="items" col-copy />
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const Selection: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
                <div>
                    <p class="mb-4 font-xl font-bold">Default(Multi Selection)</p>
                    <p class="mb-4 text-gray-700">Selected indices: {{selectIndex}}</p>
                    <p class="mb-4 text-gray-700">Selected items: {{selectIndex.map(d => items[d])}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :select-index.sync="selectIndex" />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Row Click Multi Selection Mode</p>
                    <p class="mb-4 text-gray-700">Selected indices: {{selectIndex}}</p>
                    <p class="mb-4 text-gray-700">Selected items: {{selectIndex.map(d => items[d])}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :select-index.sync="selectIndex" rowClickMultiSelectMode />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Single Selection</p>
                    <p class="mb-4 text-gray-700">Selected index: {{singleSelectIndex}}</p>
                    <p class="mb-4 text-gray-700">Selected items: {{singleSelectIndex.map(d => items[d])}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :select-index.sync="singleSelectIndex" :multi-select="false" />
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                selectIndex: [],
                singleSelectIndex: [],
            });
            return {
                ...toRefs(state),
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const Loading: Story = {
    render: () => ({
        components: { PDataTable, PToggleButton },
        template: `
            <div>
                <div>
                    <p class="mb-4 font-xl font-bold">Default</p>
                    <p class="mb-4 text-gray-700">Use Cursor Loading: <p-toggle-button :value="userCursorLoading" @change-toggle="onToggleChange"/></p>
                    <p-data-table :fields="fields" :items="items" :loading="loading" :use-cursor-loading="userCursorLoading" />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Use Slot: loading</p>
                    <p-data-table :fields="fields" :items="items" loading>
                        <template #loading>
                            <span>Loading...</span>
                        </template>
                    </p-data-table>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                userCursorLoading: false,
                loading: true,
            });
            return {
                ...toRefs(state),
                fields: getUserFields(),
                items: getUsers(5, 5),
                onToggleChange({ value }) {
                    state.userCursorLoading = value;
                    state.loading = false;
                    setTimeout(() => {
                        state.loading = true;
                    }, 500);
                },
            };
        },
    }),
};

export const StripeAndBorder: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
                <div>
                    <p class="mb-4 font-xl font-bold">No Stripe & Border (Default)</p>
                    <p-data-table :fields="fields" :items="items" :striped="false" bordered />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">No Stripe & No Border</p>
                    <p-data-table :fields="fields" :items="items" :striped="false" :bordered="false" />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Stripe & Border</p>
                    <p-data-table :fields="fields" :items="items" striped bordered />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Stripe & No Border</p>
                    <p-data-table :fields="fields" :items="items" striped :bordered="false" />
                </div>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const DisableHover: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <p-data-table :fields="fields" :items="items" disable-hover />
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const TableStyleTypes: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
                <div>
                    <p class="mb-4 font-xl font-bold">Style Type: {{DATA_TABLE_STYLE_TYPE.default}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :table-style-type="DATA_TABLE_STYLE_TYPE.default"/>
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Style Type: {{DATA_TABLE_STYLE_TYPE.light}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :table-style-type="DATA_TABLE_STYLE_TYPE.light" />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Style Type: {{DATA_TABLE_STYLE_TYPE.primary4}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :table-style-type="DATA_TABLE_STYLE_TYPE.primary4" />
                </div>
                <div class="mt-6">
                    <p class="mb-4 font-xl font-bold">Style Type: {{DATA_TABLE_STYLE_TYPE.simple}}</p>
                    <p-data-table :fields="fields" :items="items" selectable :table-style-type="DATA_TABLE_STYLE_TYPE.simple" />
                </div>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
                DATA_TABLE_STYLE_TYPE,
            };
        },
    }),
};

export const TableCustomStyle: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
                <div>
                    <p-data-table :fields="fields" :items="items" selectable :table-custom-style="{ background: '#999FAB', maxHeight: '200px' }"/>
                </div>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
                DATA_TABLE_STYLE_TYPE,
            };
        },
    }),
};

export const FixedRowHeight: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <div>
            <div>
                <p class="mb-4 font-xl font-bold">Row Height Fixed (Default)</p>
                <p-data-table :fields="fields" :items="items" row-height-fixed />
            </div>
            <div class="mt-6">
                <p class="mb-4 font-xl font-bold">Row Height Not Fixed</p>
                <p-data-table :fields="fields" :items="items" :row-height-fixed="false" />
            </div>
            </div>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getLongUsers(5, 5),
            };
        },
    }),
};

export const Invalid: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <p-data-table :fields="fields" :items="items" invalid />
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const BeautifyText: Story = {
    render: () => ({
        components: { PDataTable },
        template: `
            <p-data-table :fields="fields" :items="items" beautify-text />
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(5, 5),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
