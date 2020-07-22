<template>
    <p-toolbox-table
        v-if="!isLoading"
        class="p-dynamic-layout-query-search-table"
        :items="data"
        :fields="fields"
        :loading="extra.loading"
        :select-index="extra.selectIndex"
        sortable
        selectable
        :sort-by="extra.sortBy"
        :sort-desc="extra.sortDesc"
        :this-page.sync="toolboxTable.syncState.thisPage"
        :page-size.sync="toolboxTable.syncState.pageSize"
        :responsive-style="responsiveStyle"
        v-on="$listeners"
    >
        <!--        @changePageSize="getData"-->
        <!--        @changePageNumber="getData"-->
        <!--        @clickRefresh="getData"-->
        <!--        @changeSort="getData"-->
        <!--        @clickExcel="exportExcel"-->
        <template #toolbox-top>
            <slot v-if="showTitle||$scopedSlots['toolbox-top']" name="toolbox-top">
                <p-panel-top v-if="showTitle"
                             style="margin: 0; margin-top: 0.5rem;"
                             :use-total-count="true"
                >
                    <!--                    :total-count="apiHandler.totalCount.value"-->
                    {{ name }}
                </p-panel-top>
            </slot>
        </template>
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item hidden lg:block">
                <p-query-search v-model="proxySearchText"
                                v-bind="querySearchToolset.state"
                                @menu:show="querySearchToolset.onMenuShow"
                                @key:input="querySearchToolset.onKeyInput"
                                @value:input="querySearchToolset.onValueInput"
                                @key:select="querySearchToolset.onKeySelect"
                                @search="querySearchToolset.onSearch"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex flex-col flex-1">
                <p-query-search v-model="proxySearchText"
                                class="block lg:hidden mt-4"
                                :class="{ 'mb-4':!!$scopedSlots['toolbox-bottom']&&tags.length===0}"
                                v-bind="querySearchToolset.state"
                                @menu:show="querySearchToolset.onMenuShow"
                                @key:input="querySearchToolset.onKeyInput"
                                @value:input="querySearchToolset.onValueInput"
                                @key:select="querySearchToolset.onKeySelect"
                                @search="querySearchToolset.onSearch"
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
import {
    getKeyHandler,
    KeyItem,
    QuerySearchToolSet,
} from '@/components/organisms/search/query-search/PQuerySearch.toolset';
import { ACHandlerMeta, defaultACHandler, getStatApiValueHandlerMap } from '@/lib/api/query-search';
import { ToolboxTableState } from '@/components/organisms/tables/toolbox-table/PToolboxTable.toolset';


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
        data: {
            type: Array,
            default: () => [],
        },
        api: {
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
        resourceType: {
            type: String,
            required: true,
        },
        extra: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: DynamicLayoutProps, { emit }) {
        const toolboxTable = new ToolboxTableState();
        const querySearchToolset = new QuerySearchToolSet(defaultACHandler.keyHandler, defaultACHandler.valueHandlerMap, defaultACHandler.suggestKeys);


        /** ************************************************ */

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
        const state = reactive({
            isToolsetMode: computed(() => !!props.toolset),
        });
        const exportAction = fluentApi.addons().excel().export();


        const apiWatchStop: any = null;
        const optionsWatchStop: any = null;



        const proxySearchText = computed({
            get: () => querySearchToolset.syncState.value,
            set: (value) => {
                if (value !== querySearchToolset.syncState.value) {
                    querySearchToolset.syncState.value = value;
                }
            },
        });

        const tags = computed(() => querySearchToolset.tags.value || []);
        const deleteTag = (event) => {
            querySearchToolset.deleteTag(event);
        };
        const deleteAllTags = () => {
            querySearchToolset.deleteAllTags();
        };
        return {
            ...toRefs(state),
            fields,
            slots,
            proxySearchText,
            tags,
            deleteTag,
            deleteAllTags,
            toolboxTable,
            querySearchToolset,
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
    .p-dynamic-layout-query-search-table {
        >>> .toolbox {
            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
</style>
