<template>
    <p-toolbox-table
        :items="apiHandler.state.items"
        :fields="fields"
        :selectable="true"
        :sortable="true"
        :hover="true"
        :shadow="true"
        :border="true"
        :padding="true"
        :dragable="true"
        :all-page="apiHandler.state.allPage"
        :sort-by.sync="apiHandler.syncState.sortBy"
        :sort-desc.sync="apiHandler.syncState.sortDesc"
        :this-page.sync="apiHandler.syncState.thisPage"
        :page-size.sync="apiHandler.syncState.pageSize"
        :select-index.sync="apiHandler.syncState.selectIndex"
        :loading.sync="apiHandler.syncState.loading"
        :responsive-style="{'height': '24rem', 'overflow-y':'auto'}"
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
                <PQuerySearchBar :search-text.sync="apiHandler.querySearch.state.searchText" :autocomplete-handler="apiHandler.querySearch.acHandler"
                                 @newQuery="apiHandler.querySearch.addTag"
                />
            </div>
        </template>
        <template v-if="apiHandler.querySearch.tags.value.length !== 0" slot="toolbox-bottom">
            <p-col :col="12" style="margin-bottom: .5rem;">
                <p-hr style="width: 100%;" />
                <p-row style="margin-top: .5rem;">
                    <div style="flex-grow: 0">
                        <p-icon-button name="ic_delete" @click="apiHandler.querySearch.deleteAllTags" />
                    </div>
                    <div style="flex-grow: 1;margin-left: 1rem;">
                        <p-tag v-for="(tag, idx) in apiHandler.querySearch.tags.value" :key="idx + tag" style="margin-top: 0.375rem;margin-bottom: 0.37rem"
                               @delete="apiHandler.querySearch.deleteTag(idx)"
                        >
                            {{ tag.key }}:{{ tag.operator }} {{ tag.value }}
                        </p-tag>
                    </div>
                </p-row>
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

import { BaseQuerySearchTableTSAPI } from '@/lib/api';
import PRow from '@/components/atoms/grid/row/Row.vue';
import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PTag from '@/components/molecules/tags/Tag.vue';

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
    apiHandler:BaseQuerySearchTableTSAPI;
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


export default defineComponent({
    name: 'PDynamicViewQuerySearchTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PQuerySearchBar,
        PRow,
        PCol,
        PHr,
        PIconButton,
        PTag,
    },
    props: {
        data_source: {
            type: Array,
            required: true,
        },
        data: {
            type: [Array, Object],
            default: () => ({}),
        },
        apiHandler: {
            type: BaseQuerySearchTableTSAPI,
            required: true,
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
});
</script>
<style lang="scss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

</style>
