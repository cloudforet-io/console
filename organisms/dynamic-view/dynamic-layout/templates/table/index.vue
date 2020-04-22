<template>
    <p-toolbox-table
        :items="apiHandler.tableTS.state.items"
        :fields="fields"
        :selectable="typeof apiHandler.tableTS.state.selectable === 'boolean'? apiHandler.tableTS.state.selectable : false"
        :multi-select="typeof apiHandler.tableTS.state.multiSelect === 'boolean'? apiHandler.tableTS.state.multiSelect : false"
        :sortable="typeof apiHandler.tableTS.state.sortable === 'boolean'? apiHandler.tableTS.state.sortable : true"
        :hover="typeof apiHandler.tableTS.state.hover === 'boolean'? apiHandler.tableTS.state.hover : true"
        :shadow="typeof apiHandler.tableTS.state.shadow === 'boolean'? apiHandler.tableTS.state.shadow : false"
        :border="typeof apiHandler.tableTS.state.border === 'boolean'? apiHandler.tableTS.state.border : false"
        :padding="typeof apiHandler.tableTS.state.padding === 'boolean'? apiHandler.tableTS.state.padding : false"
        :excel-visible="typeof apiHandler.tableTS.state.excelVisible === 'boolean'? apiHandler.tableTS.state.excelVisible : true"
        :all-page="apiHandler.tableTS.state.allPage"
        :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
        :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
        :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
        :loading.sync="apiHandler.tableTS.syncState.loading"
        :this-page.sync="apiHandler.tableTS.syncState.thisPage"
        :page-size.sync="apiHandler.tableTS.syncState.pageSize"

        :setting-visible="false"
        :use-cursor-loading="true"
        v-on="$listeners"
        @changePageSize="getData"
        @changePageNumber="getData"
        @clickRefresh="getData"
        @changeSort="getData"
    >
        <template #toolbox-top>
            <slot name="toolbox-top" />
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item w-1/2">
                <p-search :search-text="proxySearchText" @update:search-text="updateSearchText($event)" @onSearch="getData" />
            </div>
        </template>
        <template v-for="slot of slots" v-slot:[slot.name]="{value}">
            <p-dynamic-field :key="slot.key" v-bind="slot" :data="value" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, Ref, toRefs, watch,
} from '@vue/composition-api';
import _ from 'lodash';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import { SearchTableAPI, SearchTableFluentAPI } from '@/lib/api/table';
import {
    DynamicFieldType, DynamicLayoutApiProp,
    DynamicLayoutProps,
    makeFields, makeTableSlots, GetAction,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import { ActionAPI, QueryAPI, GetDataAction } from '@/lib/fluent-api';

interface Field {
    name: string;
    label: string;
}


export default {
    name: 'SDynamicLayoutTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PSearch,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        api: {
            type: Object,
            default: null,
        },
        toolset: {
            type: Object,
            default: null,
        },
        isShow: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: DynamicLayoutProps) {
        let apiHandler: SearchTableFluentAPI = props.toolset as SearchTableFluentAPI || new SearchTableFluentAPI(null as unknown as QueryAPI<any, any>);
        const state = reactive({
            isToolsetMode: computed(() => !!props.toolset),
        });
        console.log(state.isToolsetMode, 'toolset mode');
        console.log(apiHandler, 'handler');
        const getData = async () => {
            if (apiHandler.action && props.isShow) {
                await apiHandler.getData();
                console.log(apiHandler.tableTS.state.items);
            }
        };
        let apiWatchStop: any = null;

        watch(() => state.isToolsetMode, (after, before) => {
            if (after !== before) {
                if (!after) {
                    // @ts-ignore
                    apiWatchStop = watch(() => props.api, async (aft, bef) => {
                        if (aft && (aft.resource !== bef?.resource || aft.getAction !== bef?.getAction)) {
                            let action;
                            if (props.options.root_path) {
                                action = (aft.resource.getData() as GetDataAction<any, any>).setKeyPath(props.options.root_path);
                            } else {
                                action = aft.resource.list();
                            }

                            const getAction = props.api?.getAction;
                            if (getAction) {
                                action = getAction(action) as QueryAPI<any, any>;
                            }
                            // @ts-ignore
                            apiHandler.action = action;
                            await getData();
                        }
                    });
                } else if (apiWatchStop) {
                    apiWatchStop();
                    apiHandler = props.toolset as SearchTableFluentAPI;
                }
            }
        });
        watch(() => props.isShow, async (aft, bef) => {
            if (aft && aft !== bef) {
                await getData();
            }
        });


        const fields = makeFields(props);
        const slots = makeTableSlots(props);
        const proxySearchText = computed(() => apiHandler.tableTS.searchText.value);
        const updateSearchText = (value) => {
            try {
                apiHandler.tableTS.searchText.value = value;
            } catch (e) {
                console.error(e);
            }
        };
        return {
            ...toRefs(state),
            fields,
            slots,
            getData,
            proxySearchText,
            updateSearchText,
            apiHandler,

        };
    },
};
</script>
<style lang="postcss" scoped>
    .left-toolbox-item{
    &:last-child {
         flex-grow: 1;
     }
    }

</style>
