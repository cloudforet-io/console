import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getUserFields, getUsers } from '@/data-display/tables/data-table/mock';
import { getToolboxTableArgs, getToolboxTableArgTypes, getToolboxTableParameters } from '@/data-display/tables/toolbox-table/story-helper';
import { useProxyValue } from '@/hooks/proxy-state';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PSelectStatus from '@/inputs/select-status/PSelectStatus.vue';

import PToolboxTable from './PToolboxTable.vue';

type PToolboxTablePropsAndCustomArgs = ComponentProps<typeof PToolboxTable>;

const meta : Meta<PToolboxTablePropsAndCustomArgs> = {
    title: 'Data Display/Tables/Toolbox Table',
    component: PToolboxTable,
    argTypes: {
        ...getToolboxTableArgTypes(),
    },
    parameters: {
        ...getToolboxTableParameters(),
    },
    args: {
        ...getToolboxTableArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PToolboxTable>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PToolboxTable },
        template: `
        <div class="w-full h-full p-8">
            <p-toolbox-table
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
                :striped="striped"
                :bordered="bordered"
                :disableHover="disableHover"
                :rowHeightFixed="rowHeightFixed"
                :rowCursorPointer="rowCursorPointer"
                :invalid="invalid"
                :getRowClassNames="getRowClassNames"
                :getRowSelectable="getRowSelectable"
                :paginationVisible="paginationVisible"
                :pageSizeChangeable="pageSizeChangeable"
                :settingsVisible="settingsVisible"
                :exportable="exportable"
                :refreshable="refreshable"
                :searchable="searchable"
                :filtersVisible="filtersVisible"
                :searchType="searchType"
                :this-page.sync="proxyThisPage"
                :pageSize.sync="proxyPageSize"
                :totalCount="totalCount"
                :pageSizeOptions="pageSizeOptions"
                :sortByOptions="sortByOptions"
                :keyItemSets="keyItemSets"
                :valueHandlerMap="valueHandlerMap"
                :queryTags.sync="proxyQueryTags"
                :searchText.sync="proxySearchText"
                :timezone="timezone"
                @change="onChange"
                @export="onExport"
                @refresh="onRefresh"
                @click-settings="onClickSettings"
                @select="onSelect"
                @rowLeftClick="onRowLeftClick"
                @update:selectIndex="onUpdateSelectIndex"
                @update:sortBy="onUpdateSortBy"
                @update:sortDesc="onUpdateSortDesc"
            ></p-toolbox-table>
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySortBy: useProxyValue('sortBy', props, emit),
                proxySortDesc: useProxyValue('sortDesc', props, emit),
                proxySelectIndex: useProxyValue('selectIndex', props, emit),
                proxyThisPage: useProxyValue('thisPage', props, emit),
                proxyPageSize: useProxyValue('pageSize', props, emit),
                proxySearchText: useProxyValue('searchText', props, emit),
                proxyQueryTags: useProxyValue('queryTags', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PToolboxTable },
        template: `
            <p-toolbox-table :fields="fields" :items="items"></p-toolbox-table>
        `,
        setup() {
            return {
                fields: getUserFields(),
                items: getUsers(7, 7),
            };
        },
    }),
};

export const Slots: Story = {
    render: () => ({
        components: { PToolboxTable, PButton, PSelectStatus },
        template: `
            <div>
                <div>
                    <p class="mb-4 text-xl font-bold">Slot: toolbox-top</p>
                    <p-toolbox-table :fields="fields" :items="items">
                    <template #toolbox-top>
                    <p class="font-bold text-2xl text-peacock-600 p-4">Example</p>
                    </template>
                    </p-toolbox-table>
                </div>
                <div class="mt-4">
                    <p class="mb-4 text-xl font-bold">Slot: toolbox-left</p>
                    <p-toolbox-table :fields="fields" :items="items">
                    <template #toolbox-left>
                        <p-button style-type="secondary">Button</p-button>
                    </template>
                    </p-toolbox-table>
                </div>
                <div class="mt-4">
                    <p class="mb-4 text-xl font-bold">Slot: toolbox-bottom</p>
                    <p-toolbox-table :fields="fields" :items="items">
                    <template #toolbox-bottom>
                        <div class="p-4">
                            <strong class="mr-4">Select: </strong>
                            <p-select-status v-for="val in fields" :key="val.name" class="mr-2"
                                v-model="selected" :value="val.name" />
                        </div>
                    </template>
                    </p-toolbox-table>
                </div>
            </div>
            <!--<div>-->
        `,
        setup() {
            const fields = getUserFields();
            const state = reactive({
                selected: [fields[0].name],
            });
            return {
                ...toRefs(state),
                fields,
                items: getUsers(7, 7),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
