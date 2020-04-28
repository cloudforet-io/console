<template>
    <p-toolbox-table
        v-if="!isLoading"
        v-bind="apiHandler.tableTS.state"
        :fields="fields"
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
        @clickExcel="exportExcel"
    >
        <template #toolbox-top>
            <slot v-if="showTitle||$scopedSlots['toolbox-top']" name="toolbox-top">
                <PPanelTop v-if="showTitle"
                           style="margin: 0px; margin-top: 0.5rem"
                           :use-total-count="true"
                           :total-count="apiHandler.totalCount.value"
                >
                    {{ name }}
                </PPanelTop>
            </slot>
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item w-1/2">
                <p-search :search-text.sync="proxySearchText" @onSearch="getData" />
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
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PSearch from '@/components/molecules/search/Search.vue';
import { SearchTableAPI, SearchTableFluentAPI } from '@/lib/api/table';
import {
    DynamicLayoutProps,
    makeFields, makeTableSlots, GetAction, checkCanGetData,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import {
    ActionAPI, QueryAPI, GetDataAction, fluentApi,
} from '@/lib/fluent-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import _ from 'lodash';

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
        PPanelTop,
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
        showTitle: {
            type: Boolean,
            default: true,
        },
        isLoading: {
            type: Boolean,
            required: true,
        },
    },
    setup(props: DynamicLayoutProps) {
        const defaultInitData = {
            selectable: false,
            excelVisible: true,
            shadow: false,
            border: false,
            responsiveStyle: { height: '24rem', 'overflow-y': 'auto' },
        };
        let apiHandler: SearchTableFluentAPI = props.toolset as SearchTableFluentAPI
            || new SearchTableFluentAPI(null as unknown as QueryAPI<any, any>, defaultInitData);
        const state = reactive({
            isToolsetMode: computed(() => !!props.toolset),
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        const exportExcel = () => {
            exportToolSet.action = exportAction.setDataSource(props.options.fields || []);
            exportToolSet.getData();
        };
        const debounceGetData = _.debounce(apiHandler.getData, 200);
        const getData = () => {
            if (apiHandler.action && checkCanGetData(props)) {
                debounceGetData();
            }
        };


        let apiWatchStop: any = null;
        let optionsWatchStop: any = null;

        const resetAction = async () => {
            let action;
            if (props.api?.resource instanceof ActionAPI) {
                action = props.api.resource;
            } else if (props.options.root_path) {
                action = (props.api?.resource.getData() as GetDataAction<any, any>).setKeyPath(props.options.root_path);
            } else {
                action = props.api?.resource.list();
            }


            const getAction = props.api?.getAction;
            if (getAction) {
                action = getAction(action) as QueryAPI<any, any>;
            }
            // @ts-ignore
            apiHandler.action = action;
            exportToolSet.target = apiHandler;
            await getData();
        };


        watch(() => state.isToolsetMode, (after, before) => {
            if (after !== before) {
                if (!after) {
                    // @ts-ignore
                    apiWatchStop = watch(() => props.api, async (aft, bef) => {
                        if (aft && (aft.resource !== bef?.resource || aft.getAction !== bef?.getAction)) {
                            await resetAction();
                        }
                    });
                    optionsWatchStop = watch(() => props.options, async (aft, bef) => {
                        if (aft && aft !== bef) {
                            exportToolSet.action = exportAction.setDataSource(aft.fields || []);
                            await resetAction();
                        }
                    });
                } else {
                    if (apiWatchStop) {
                        apiWatchStop();
                        apiHandler = props.toolset as SearchTableFluentAPI;
                        exportToolSet.target = apiHandler;
                    }
                    if (optionsWatchStop) {
                        optionsWatchStop();
                    }
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

        const proxySearchText = computed({
            get: () => apiHandler.tableTS.searchText.value,
            set: (value) => {
                if (value !== apiHandler.tableTS.searchText.value) {
                    apiHandler.tableTS.searchText.value = value;
                }
            },
        });

        return {
            ...toRefs(state),
            fields,
            slots,
            getData,
            proxySearchText,
            apiHandler,
            exportExcel,
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
