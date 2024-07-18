import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getKeyItemSets, getValueHandlerMap } from '@/navigation/toolbox/mock';
import { I18nConnector } from '@/translations';

import PToolbox from './PToolbox.vue';
import { getToolboxArgTypes, getToolboxParameters, getToolboxArgs } from './story-helper';


type PToolboxPropsAndCustomArgs = ComponentProps<typeof PToolbox>;

const meta : Meta<PToolboxPropsAndCustomArgs> = {
    title: 'Navigation/Toolbox',
    component: PToolbox,
    argTypes: {
        ...getToolboxArgTypes(),
    },
    parameters: {
        ...getToolboxParameters(),
    },
    args: {
        ...getToolboxArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PToolbox>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PToolbox },
        i18n: I18nConnector.i18n,
        template: `
            <p-toolbox
                :paginationVisible="paginationVisible"
                :pageSizeChangeable="pageSizeChangeable"
                :settingsVisible="settingsVisible"
                :sortable="sortable"
                :exportable="exportable"
                :refreshable="refreshable"
                :searchable="searchable"
                :filtersVisible="filtersVisible"
                :searchType="searchType"
                :this-page.sync="proxyThisPage"
                :pageSize.sync="proxyPageSize"
                :totalCount="totalCount"
                :has-next-page="hasNextPage"
                :sortBy.sync="proxySortBy"
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
            >
                <template v-if="leftAreaSlot" #left-area>
                    <span v-html="leftAreaSlot"/>
                </template>
            </p-toolbox>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyThisPage: useProxyValue('thisPage', props, emit),
                proxyPageSize: useProxyValue('pageSize', props, emit),
                proxySortBy: useProxyValue('sortBy', props, emit),
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
        components: { PToolbox },
        i18n: I18nConnector.i18n,
        template: `
            <p-toolbox />
        `,
    }),
};

export const FullCase: Story = {
    render: () => ({
        components: { PToolbox },
        i18n: I18nConnector.i18n,
        template: `
            <p-toolbox
                paginationVisible
                pageSizeChangeable
                sortable
                exportable
                refreshable
                searchable
                filtersVisible
                settingsVisible
                :sortBy="'Recent'"
                :sortByOptions="[{ name: 'Recent', label: 'Recent' }]"
            >
            </p-toolbox>
        `,
    }),
};

export const QuerySearch: Story = {
    render: () => ({
        components: { PToolbox },
        i18n: I18nConnector.i18n,
        template: `
            <p-toolbox
                searchable
                searchType="query"
                filtersVisible
                :key-item-sets="keyItemSets"
                :value-handler-map="valueHandlerMap"
                :queryTags.sync="queryTags"
            >
            </p-toolbox>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                keyItemSets: getKeyItemSets(),
                valueHandlerMap: getValueHandlerMap(),
                queryTags: [
                    { key: null, value: { label: 'Hello', name: 'hello' }, operator: '' },
                ],
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const LeftAreaSlot: Story = {
    render: () => ({
        components: { PToolbox },
        i18n: I18nConnector.i18n,
        template: `
            <p-toolbox
                searchable
                searchType="query"
                filtersVisible
                :queryTags="[
                    { key: null, value: { label: 'Hello', name: 'hello' }, operator: '' },
                ]"
            >
                <template #left-area>
                    <button class="py-1 px-3 h-full rounded-sm bg-primary text-white font-bold text-lg">LEFT AREA</button>
                </template>
            </p-toolbox>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
