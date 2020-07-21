<template>
    <p-toolbox-table
        v-if="!isLoading"
        class="s-dynamic-layout-table"
        v-bind="apiHandler.tableTS.state"
        :fields="fields"
        :all-page="apiHandler.tableTS.state.allPage"
        :sort-by.sync="apiHandler.tableTS.syncState.sortBy"
        :sort-desc.sync="apiHandler.tableTS.syncState.sortDesc"
        :select-index.sync="apiHandler.tableTS.syncState.selectIndex"
        :loading.sync="apiHandler.tableTS.syncState.loading"
        :this-page.sync="apiHandler.tableTS.syncState.thisPage"
        :page-size.sync="apiHandler.tableTS.syncState.pageSize"
        :responsive-style="responsiveStyle"
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
                <p-panel-top v-if="showTitle"
                             style="margin: 0; margin-top: 0.5rem;"
                             :use-total-count="true"
                             :total-count="apiHandler.totalCount.value"
                >
                    {{ name }}
                </p-panel-top>
            </slot>
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                <p-search v-model="apiHandler.tableTS.searchText.value" @search="searchGetData(false)" @delete="searchGetData(true)" />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex-1 2xs:block lg:hidden mt-4" :class="{'mb-4':$scopedSlots['toolbox-bottom']}">
                <p-search v-model="apiHandler.tableTS.searchText.value" @search="searchGetData(false)" @delete="searchGetData(true)" />
            </div>
            <slot name="toolbox-bottom" />
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
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';
import { SearchTableFluentAPI } from '@/lib/api/table';
import {
    DynamicLayoutProps,
    makeFields, makeTableSlots, checkCanGetData,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import {
    ActionAPI, QueryAPI, GetDataAction, fluentApi,
} from '@/lib/fluent-api';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
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
        reference: {
            type: Object,
            default: null,
            validator(reference) {
                if (reference === null) return true;
                return reference.reference_type && reference.reference_key;
            },
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
        responsiveStyle: {
            type: Object,
            default: () => ({ height: '24rem', 'overflow-y': 'auto' }),
        },
        exportFields: {
            type: Array,
            default: null,
        },
        isShowGetData: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        const defaultInitData = {
            selectable: false,
            excelVisible: true,
            shadow: false,
            border: false,
        };
        let apiHandler: SearchTableFluentAPI = props.toolset as SearchTableFluentAPI
            || new SearchTableFluentAPI(null as unknown as QueryAPI<any, any>, defaultInitData);
        const state = reactive({
            isToolsetMode: computed(() => !!props.toolset),
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        const exportExcel = () => {
            exportToolSet.action = exportAction.setDataSource(props.exportFields || props.options.fields || []);
            exportToolSet.getData();
        };
        const getData = () => {
            if (apiHandler.action && checkCanGetData(props)) {
                apiHandler.getData();
            }
        };

        const searchGetData = async (isDelete?: boolean) => {
            if (apiHandler.action && checkCanGetData(props)) {
                if (isDelete) apiHandler.tableTS.searchText.value = '';
                await apiHandler.getData(true);
                emit('search', apiHandler.tableTS.searchText.value);
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
            if (aft && aft !== bef && props.isShowGetData) {
                await getData();
            }
        });


        const fields = makeFields(props);
        const slots = makeTableSlots(props);


        return {
            ...toRefs(state),
            fields,
            slots,
            getData,
            searchGetData,
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
.s-dynamic-layout-table{
    >>> .toolbox{
        .toolbox-bottom{
            @apply mt-0;
        }
    }
}
</style>
