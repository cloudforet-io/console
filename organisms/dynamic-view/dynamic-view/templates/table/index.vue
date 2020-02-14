<template>
    <p-toolbox-table
        :items="apiHandler.state.items"
        :fields="fields"
        :selectable="false"
        :sortable="false"
        :hover="true"
        :all-page="apiHandler.state.allPage"
        :this-page.sync="apiHandler.state.thisPage"
        :page-size.sync="apiHandler.state.pageSize"
        :responsive-style="{'height': '24rem', 'overflow-y':'auto'}"
        :setting-visible="false"
        :shadow="false"
        :border="false"
        :padding="false"
        :loading="apiHandler.state.loading"
        :use-spinner-loading="true"
        :use-cursor-loading="true"
        @changePageSize="apiHandler.getData"
        @changePageNumber="apiHandler.getData"
        @clickRefresh="apiHandler.getData"
    >
        <template #toolbox-left>
            <div style="width: 50vw">
                <p-search :search-text.sync="apiHandler.state.searchText" @onSearch="apiHandler.getData" />
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
import { createComponent, computed, Ref } from '@vue/composition-api';
import _ from 'lodash';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import { SubDataAPI } from '@/lib/api';

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


export default createComponent({
    name: 'PDynamicViewTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PSearch,
    },
    props: {
        data_source: {
            type: Array,
            defaults: () => [],
        },
        data: {
            type: [Object],
            required: true,
        },
        apiHandler: {
            type: SubDataAPI,
            required: true,
        },
    },
    setup(props:Props) {
        const fields:Ref<Field[]> = computed(():Field[] => props.data_source.map((ds:DataSourceType):Field => ({
            name: ds.key,
            label: ds.name,
        })));
        const slots:Ref<SlotBind[]> = computed(():SlotBind[] => props.data_source.map((ds:DataSourceType):SlotBind => ({
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
});
</script>
