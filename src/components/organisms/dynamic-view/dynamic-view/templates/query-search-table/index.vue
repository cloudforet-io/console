<template>
    <p-toolbox-table
        :items="apiHandler.tableTS.state.items"
        :fields="fields"
        :selectable="true"
        :sortable="true"
        :hover="true"
        :shadow="true"
        :border="true"
        :padding="true"
        :dragable="true"
        :all-page="apiHandler.tableTS.state.allPage"
        :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
        :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
        :this-page.sync="apiHandler.tableTS.syncState.thisPage"
        :page-size.sync="apiHandler.tableTS.syncState.pageSize"
        :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
        :loading.sync="apiHandler.tableTS.syncState.loading"
        :responsive-style="responsiveStyle"
        :setting-visible="false"
        :use-spinner-loading="true"
        :use-cursor-loading="true"
        @changePageSize="apiHandler.getData"
        @changePageNumber="apiHandler.getData"
        @clickRefresh="apiHandler.getData"
        @changeSort="apiHandler.getData"
    >
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item" style="width: 50%">
                <p-query-search-bar :search-text.sync="apiHandler.tableTS.querySearch.state.searchText" :autocomplete-handler="apiHandler.tableTS.querySearch.acHandler.value"
                                    @newQuery="apiHandler.tableTS.querySearch.addTag"
                />
            </div>
        </template>
        <template v-if="apiHandler.tableTS.querySearch.tags.value.length !== 0" slot="toolbox-bottom">
            <p-col :col="12" style="margin-bottom: .5rem;">
                <p-hr style="width: 100%;" />
                <p-query-search-tags style="margin-top: .5rem;"
                                     :tags="apiHandler.tableTS.querySearch.tags.value"
                                     @deleteTag="apiHandler.tableTS.querySearch.deleteTag"
                                     @deleteAllTags="apiHandler.tableTS.querySearch.deleteAllTags"
                />
            </p-col>
        </template>
        <template v-for="slot of slots" v-slot:[slot.name]="{item}">
            <p-dynamic-field :key="slot.name" :view_type="slot.view_type" :view_option="slot.view_option"
                             :data="getValue(item,slot.path)"
            />
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
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';

import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import {QuerySearchTableAPI} from "@/lib/api/table";

interface DataSourceType {
    name:string;
    key:string;
    view_type?:string;
    view_option?:any;
}

interface Props {
    data_source: DataSourceType[];
    data: any;
    rootMode:boolean;
    apiHandler:QuerySearchTableAPI;
}

interface SlotBind {
    name:string;
    view_type:string;
    view_option:any;
    path:string[];
}

interface Field {
    name:string;
    label:string;
}


export default {
    name: 'PDynamicViewQuerySearchTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PQuerySearchBar,
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
    setup(props:Props) {
        const fields:Ref<Readonly<Field[]>> = computed(():Field[] => props.data_source.map((ds:DataSourceType):Field => ({
            name: ds.key,
            label: ds.name,
        })));
        const slots:Ref<Readonly<SlotBind[]>> = computed(():SlotBind[] => props.data_source.map((ds:DataSourceType):SlotBind => ({
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
<style lang="scss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

</style>
