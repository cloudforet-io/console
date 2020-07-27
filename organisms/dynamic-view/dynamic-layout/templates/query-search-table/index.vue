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
        :layout-fixed="layoutFixed"
        :row-height-fixed="rowHeightFixed"
        :width-fixed="widthFixed"
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
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search v-model="proxySearchText"
                                v-bind="apiHandler.tableTS.querySearch.state"
                                @menu:show="apiHandler.tableTS.querySearch.onMenuShow"
                                @key:input="apiHandler.tableTS.querySearch.onKeyInput"
                                @value:input="apiHandler.tableTS.querySearch.onValueInput"
                                @key:select="apiHandler.tableTS.querySearch.onKeySelect"
                                @search="apiHandler.tableTS.querySearch.onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search v-model="proxySearchText"
                                class="block lg:hidden mt-4"
                                :class="{ 'mb-4':!!$scopedSlots['toolbox-bottom']&&tags.length===0}"
                                v-bind="apiHandler.tableTS.querySearch.state"
                                @menu:show="apiHandler.tableTS.querySearch.onMenuShow"
                                @key:input="apiHandler.tableTS.querySearch.onKeyInput"
                                @value:input="apiHandler.tableTS.querySearch.onValueInput"
                                @key:select="apiHandler.tableTS.querySearch.onKeySelect"
                                @search="apiHandler.tableTS.querySearch.onSearch"
                />
                <div v-if="tags.length !==0" class="mt-4" :class="{ 'mb-4':$scopedSlots['toolbox-bottom']}">
                    <p-hr style="width: 100%;" />
                    <p-query-search-tags style="margin-top: 0.5rem;"
                                         :tags="tags"
                                         @delete:tag="deleteTag"
                                         @delete:all="deleteAllTags"
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
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PDynamicField from '@/components/organisms/dynamic-field/PDynamicField.vue';
import PQuerySearchTags from '@/components/organisms/search/query-search-tags/PQuerySearchTags.vue';

import PHr from '@/components/atoms/hr/PHr.vue';
import { QuerySearchTableFluentAPI } from '@/lib/api/table';
import {
    ActionAPI, fluentApi, QueryAPI, ResourceActions,
} from '@/lib/fluent-api';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import {
    checkCanGetData,
    DynamicLayoutProps,
    makeFields,
    makeTableSlots,
} from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import PPanelTop from '@/components/molecules/panel/panel-top/PPanelTop.vue';
import PQuerySearch from '@/components/organisms/search/query-search/PQuerySearch.vue';
import { getKeyHandler, KeyItem } from '@/components/organisms/search/query-search/PQuerySearch.toolset';
import { ACHandlerMeta, getStatApiValueHandlerMap } from '@/lib/api/query-search';


export default {
    name: 'PDynamicLayoutQuerySearchTable',
    components: {
        PQuerySearch,
        PDynamicField,
        PToolboxTable,
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
        exportFields: {
            type: Array,
            default: null,
        },
        isShowGetData: {
            type: Boolean,
            default: true,
        },
        resourceType: {
            type: String,
            required: true,
        },
        layoutFixed: {
            type: Boolean,
            default: false,
        },
        rowHeightFixed: {
            type: Boolean,
            default: true,
        },
        widthFixed: {
            type: Boolean,
            default: false,
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
            const keyItems: KeyItem[] = fields.value.map(field => ({ label: field.label || field.name, name: field.name }));
            const acMeta: ACHandlerMeta = {
                keyHandler: async (val: string) => {
                    let res = keyItems;
                    if (val) {
                        res = keyItems.reduce((result, item) => {
                            if (item.label.includes(val) || item.name.includes(val)) result.push(item);
                            return result;
                        }, [] as KeyItem[]);
                    }

                    return res;
                },
                valueHandlerMap: getStatApiValueHandlerMap(
                    keys,
                    props.resourceType as string,
                ),
                suggestKeys: keys,

            };
            return new QuerySearchTableFluentAPI(
                getAction(),
                defaultInitData,
                undefined,
                acMeta,
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
                                apiHandler.tableTS.querySearch.keyHandler = getKeyHandler(keys);
                                apiHandler.tableTS.querySearch.valueHandlerMap = getStatApiValueHandlerMap(keys, props.resourceType as string);
                                apiHandler.tableTS.querySearch.suggestKeys = keys;
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
            get: () => apiHandler.tableTS.querySearch.syncState.value,
            set: (value) => {
                if (value !== apiHandler.tableTS.querySearch.syncState.value) {
                    apiHandler.tableTS.querySearch.syncState.value = value;
                }
            },
        });

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
            tags,
            deleteTag,
            deleteAllTags,
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
    .s-dynamic-layout-query-search-table {
        >>> .toolbox {
            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
</style>
