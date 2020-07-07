<template>
    <p-toolbox-table
        :items="apiHandler.tableTS.state.items"
        :fields="fields"
        :selectable="typeof apiHandler.tableTS.state.selectable === 'boolean'? apiHandler.tableTS.state.selectable : true"
        :sortable="typeof apiHandler.tableTS.state.sortable === 'boolean'? apiHandler.tableTS.state.sortable : true"
        :hover="typeof apiHandler.tableTS.state.hover === 'boolean'? apiHandler.tableTS.state.hover : true"
        :shadow="typeof apiHandler.tableTS.state.shadow === 'boolean'? apiHandler.tableTS.state.shadow : true"
        :border="typeof apiHandler.tableTS.state.border === 'boolean'? apiHandler.tableTS.state.border : true"
        :padding="typeof apiHandler.tableTS.state.padding === 'boolean'? apiHandler.tableTS.state.padding : true"
        :dragable="typeof apiHandler.tableTS.state.dragable === 'boolean'? apiHandler.tableTS.state.dragable : true"
        :multi-select="typeof apiHandler.tableTS.state.multiSelect === 'boolean'? apiHandler.tableTS.state.multiSelect : true"
        :excel-visible="typeof apiHandler.tableTS.state.excelVisible === 'boolean'? apiHandler.tableTS.state.excelVisible : false"
        :all-page="apiHandler.tableTS.state.allPage"
        :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
        :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
        :this-page.sync="apiHandler.tableTS.syncState.thisPage"
        :page-size.sync="apiHandler.tableTS.syncState.pageSize"
        :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
        :loading.sync="apiHandler.tableTS.syncState.loading"
        :responsive-style="responsiveStyle"
        :setting-visible="false"
        :use-cursor-loading="true"
        v-on="$listeners"
        @changePageSize="apiHandler.getData"
        @changePageNumber="apiHandler.getData"
        @clickRefresh="apiHandler.getData"
        @changeSort="apiHandler.getData"
    >
        <template #toolbox-top>
            <slot name="toolbox-top" />
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item">
                <p-query-search v-model="apiHandler.tableTS.querySearch.state.searchText"
                                v-bind="apiHandler.tableTS.querySearch.state"
                                @menu:show="apiHandler.tableTS.querySearch.onMenuShow"
                                @key:input="apiHandler.tableTS.querySearch.onKeyInput"
                                @value:input="apiHandler.tableTS.querySearch.onValueInput"
                                @key:select="apiHandler.tableTS.querySearch.onKeySelect"
                                @search="apiHandler.tableTS.querySearch.onSearch"
                />
            </div>
        </template>
        <template v-if="apiHandler.tableTS.querySearch.tags.value.length !== 0" #toolbox-bottom>
            <p-col :col="12">
                <p-hr style="width: 100%;" />
                <p-query-search-tags style="margin-top: 0.5rem;"
                                     :tags="apiHandler.tableTS.querySearch.tags.value"
                                     @delete:tag="apiHandler.tableTS.querySearch.deleteTag"
                                     @delete:all="apiHandler.tableTS.querySearch.deleteAllTags"
                />
            </p-col>
        </template>
        <template v-for="slot of slots" v-slot:[slot.name]="{item}">
            <slot :name="slot.name" :item="item">
                <p-dynamic-field :key="slot.name" :view_type="slot.view_type" :view_option="slot.view_option"
                                 :data="getValue(item,slot.path)"
                />
            </slot>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    defineComponent, computed, Ref, reactive,
} from '@vue/composition-api';
import _ from 'lodash';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';

import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';

interface DataSourceType {
    name: string;
    key: string;
    view_type?: string;
    view_option?: any;
}

interface Props {
    data_source: DataSourceType[];
    data: any;
    rootMode: boolean;
    apiHandler: QuerySearchTableFluentAPI;
}

interface SlotBind {
    name: string;
    view_type: string;
    view_option: any;
    path: string[];
}

interface Field {
    name: string;
    label: string;
}


export default {
    name: 'PDynamicViewQuerySearchTable',
    components: {
        PQuerySearch,
        PDynamicField,
        PToolboxTable,
        PCol,
        PHr,
        PQuerySearchTags,
    },
    props: {
        // eslint-disable-next-line
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: [Array, Object],
            default: () => ({}),
        },
        apiHandler: {
            type: Object,
            required: true,
        },
        responsiveStyle: {
            type: Object,
            default: () => ({ height: '24rem', 'overflow-y': 'auto' }),
        },
    },
    setup(props: Props) {
        const fields: Ref<Readonly<Field[]>> = computed((): Field[] => props.data_source.map((ds: DataSourceType): Field => ({
            name: ds.key,
            label: ds.name,
        })));
        const slots: Ref<Readonly<SlotBind[]>> = computed((): SlotBind[] => props.data_source.map((ds: DataSourceType): SlotBind => ({
            name: `col-${ds.key}-format`,
            view_type: ds.view_type || 'text',
            view_option: ds.view_option,
            path: ds.key.split('.'),
        })));
        return {
            fields,
            slots,
            getValue: (item, path) => _.get(item, path),
        };
    },
};
</script>
<style lang="postcss" scoped>
    .left-toolbox-item {
        &:last-child {
            flex-grow: 1;
        }
    }

</style>
