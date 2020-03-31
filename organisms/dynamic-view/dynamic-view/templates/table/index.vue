<template>
    <p-toolbox-table
        :items="apiHandler.tableTS.state.items"
        :fields="fields"
        :selectable="apiHandler.tableTS.state.selectable !== null? apiHandler.tableTS.state.selectable : false"
        :multiSelect="apiHandler.tableTS.state.multiSelect !== null? apiHandler.tableTS.state.multiSelect : true"
        :sortable="apiHandler.tableTS.state.sortable !== null? apiHandler.tableTS.state.sortable : false"
        :hover="apiHandler.tableTS.state.hover !== null? apiHandler.tableTS.state.hover : true"
        :shadow="apiHandler.tableTS.state.shadow !== null? apiHandler.tableTS.state.shadow : false"
        :border="apiHandler.tableTS.state.border !== null? apiHandler.tableTS.state.border : false"
        :padding="apiHandler.tableTS.state.padding !== null? apiHandler.tableTS.state.padding : false"
        :dragable="apiHandler.tableTS.state.dragable !== null? apiHandler.tableTS.state.dragable : false"
        :all-page="apiHandler.tableTS.state.allPage"
        :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
        :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
        :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
        :loading.sync="apiHandler.tableTS.syncState.loading"
        :this-page.sync="apiHandler.tableTS.syncState.thisPage"
        :page-size.sync="apiHandler.tableTS.syncState.pageSize"
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
            <div class="left-toolbox-item w-1/2">
                <p-search :search-text.sync="apiHandler.tableTS.searchText.value" @onSearch="apiHandler.getData" />
            </div>
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
import { computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import {SearchTableAPI} from "@/lib/api/table";

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
    apiHandler:SearchTableAPI;
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
    name: 'PDynamicViewTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PSearch,
    },
    props: {
        // eslint-disable-next-line
        data_source: {
            type: Array,
            defaults: () => [],
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
<style lang="postcss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
    &:last-child {
         flex-grow: 1;
     }
    }

</style>
