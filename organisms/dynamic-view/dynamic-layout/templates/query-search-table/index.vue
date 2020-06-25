<template>
    <p-toolbox-table
        v-if="!isLoading"
        class="s-dynamic-layout-query-search-table"
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
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search-bar
                    :search-text.sync="proxySearchText" :autocomplete-handler="acHandler"
                    @newQuery="newQuery"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search-bar
                    class="block lg:hidden mt-4 "
                    :class="{ 'mb-4':!!$scopedSlots['toolbox-bottom']&&tags.length===0}"
                    :search-text.sync="proxySearchText" :autocomplete-handler="acHandler"
                    @newQuery="newQuery"
                />
                <div v-if="tags.length !==0" class="mt-4" :class="{ 'mb-4':$scopedSlots['toolbox-bottom']}">
                    <p-hr style="width: 100%;" />
                    <p-query-search-tags style="margin-top: .5rem;"
                                         :tags="tags"
                                         @deleteTag="deleteTag"
                                         @deleteAllTags="deleteAllTags"
                    />
                </div>
                <slot name="toolbox-bottom" />
            </div>
        </template>
        <template v-for="slot of slots" v-slot:[slot.name]="data">
            <slot :name="slot.name" v-bind="data">
                <p-dynamic-field :key="slot.key" v-bind="slot" :data="data.value" />
            </slot>
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import {
    computed, onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-view/dynamic-field/DynamicField.vue';
import PQuerySearchBar from '@/components/organisms/search/query-search-bar/QuerySearchBar.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/QuerySearchTags.vue';

import PCol from '@/components/atoms/grid/col/Col.vue';
import PHr from '@/components/atoms/hr/Hr.vue';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import {
    ActionAPI, BaseResources, fluentApi, GetDataAction, QueryAPI, ResourceActions,
} from '@/lib/fluent-api';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import {
    checkCanGetData,
    DynamicLayoutProps,
    makeFields,
    makeTableSlots,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';


export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PDynamicField,
        PToolboxTable,
        PQuerySearchBar,
        PHr,
        PQuerySearchTags,
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
        isLoading: {
            type: Boolean,
            default: true,
        },
        showTitle: {
            type: Boolean,
            default: true,
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
    setup(props: DynamicLayoutProps) {
        const defaultInitData = {
            selectable: false,
            excelVisible: true,
        };
        const fields = makeFields(props);
        const slots = makeTableSlots(props);
        const getAction = () => {
            let action: ActionAPI;
            if (props.api?.resource instanceof ActionAPI) {
                action = props.api.resource;
            } else {
                action = (props.api?.resource as ResourceActions<'list'>).list();
            }
            const getAct = props.api?.getAction;
            if (getAct) {
                action = getAct(action) as QueryAPI<any, any>;
            }
            return action as QueryAPI<any, any>;
        };
        const getKeys = () => fields.value.map(field => field.name);
        const makeApiToolset = () => {
            const keys = getKeys();
            const acMeta = {
                handlerClass: QuerySearchTableACHandler,
                args: {
                    keys,
                    suggestKeys: keys,
                },
            };
            return new QuerySearchTableFluentAPI(
                getAction(),
                defaultInitData,
                undefined, acMeta,
            );
        };
        let apiHandler = props.toolset as QuerySearchTableFluentAPI || makeApiToolset();
        const state = reactive({
            isToolsetMode: computed(() => !!props.toolset),
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);
        const exportExcel = () => {
            exportToolSet.action = exportAction.setDataSource(props.exportFields || props.options.fields || []);
            exportToolSet.getData();
        };


        const getData = async () => {
            if (apiHandler.action && checkCanGetData(props)) {
                await apiHandler.getData();
            }
        };
        let apiWatchStop: any = null;
        let optionsWatchStop: any = null;

        const resetAction = async () => {
            apiHandler.action = getAction();
            exportToolSet.target = apiHandler;
            await getData();
        };

        onMounted(() => {
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
                                const keys = getKeys();
                                apiHandler.tableTS.querySearch.acHandlerArgs.keys = keys;
                                apiHandler.tableTS.querySearch.acHandlerArgs.suggestKeys = keys;
                                exportToolSet.action = exportAction.setDataSource(aft.fields || []);
                                await resetAction();
                            }
                        });
                    } else {
                        if (apiWatchStop) {
                            apiWatchStop();
                            apiHandler = props.toolset as QuerySearchTableFluentAPI;
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
        });


        const proxySearchText = computed({
            get: () => apiHandler.tableTS.querySearch.state.searchText,
            set: (value) => {
                if (value !== apiHandler.tableTS.querySearch.state.searchText) {
                    apiHandler.tableTS.querySearch.state.searchText = value;
                }
            },
        });

        const newQuery = (query) => {
            apiHandler.tableTS.querySearch.addTag(query);
        };
        const acHandler = computed(() => apiHandler.tableTS.querySearch.acHandler.value);
        const tags = computed(() => apiHandler.tableTS.querySearch.tags.value || []);
        const deleteTag = (event) => {
            apiHandler.tableTS.querySearch.deleteTag(event);
        };
        const deleteAllTags = () => {
            apiHandler.tableTS.querySearch.deleteAllTags();
        };
        return {
            ...toRefs(state),
            fields,
            slots,
            getData,
            apiHandler,
            exportExcel,

            proxySearchText,
            newQuery,
            acHandler,
            tags,
            deleteTag,
            deleteAllTags,
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
    .s-dynamic-layout-query-search-table{
        >>> .toolbox{
            .toolbox-bottom{
                @apply mt-0;
            }
        }
    }
</style>
