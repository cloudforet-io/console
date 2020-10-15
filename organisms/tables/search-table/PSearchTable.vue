<template>
    <p-toolbox-table class="p-search-table"
                     :fields="fields"
                     :items="items"
                     :loading="loading"
                     :all-page="allPage"
                     :sort-by.sync="proxySortBy"
                     :sort-desc.sync="proxySortDesc"
                     :select-index.sync="proxySelectIndex"
                     :this-page.sync="proxyThisPage"
                     :page-size.sync="proxyPageSize"
                     :excel-visible="excelVisible"
                     use-cursor-loading
                     :setting-visible="false"
                     sortable
                     :selectable="selectable"
                     :multi-select="multiSelect"
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitChange()"
                     @clickExcel="emitExport()"
                     @rowLeftClick="byPassEvent('rowLeftClick', ...arguments)"
                     @rowRightClick="byPassEvent('rowRightClick', ...arguments)"
                     @rowMiddleClick="byPassEvent('rowMiddleClick', ...arguments)"
                     @rowMouseOver="byPassEvent('rowMouseOver', ...arguments)"
                     @rowMouseOut="byPassEvent('rowMouseOut', ...arguments)"
    >
        <template v-if="searchable && !$scopedSlots['toolbox-left']" #toolbox-left="scope">
            <div class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                <p-search v-model="proxySearchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>
        <template v-if="searchable && !$scopedSlots['toolbox-bottom']" #toolbox-bottom="scope">
            <div class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-model="proxySearchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>

        <template v-for="(_, slot, i) of $scopedSlots" v-slot:[slot]="scope">
            <template v-if="slot === 'toolbox-left'">
                <slot name="toolbox-left" v-bind="scope" />
                <div v-if="searchable" :key="i" class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                    <p-search v-model="proxySearchText"
                              @search="onSearch"
                              @delete="onSearch()"
                    />
                </div>
            </template>
            <div v-else-if="slot === 'toolbox-bottom'" :key="i" class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-if="searchable" v-model="proxySearchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
                <slot name="toolbox-bottom" v-bind="scope" />
            </div>
            <slot v-else :name="slot" v-bind="scope" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import PSearch from '@/components/molecules/search/PSearch.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { forEach } from 'lodash';
import { Options, SearchTableProps } from '@/components/organisms/tables/search-table/type';

export default {
    name: 'PSearchTable',
    components: { PToolboxTable, PSearch },
    props: {
        fields: {
            type: Array,
            default: () => ([]),
        },
        items: {
            type: Array,
            default: () => ([]),
        },
        loading: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: '',
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        searchText: {
            type: String,
            default: '',
        },
        selectable: {
            type: Boolean,
            default: true,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        excelVisible: {
            type: Boolean,
            default: true,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        searchable: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: SearchTableProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            /** table */
            allPage: computed(() => Math.ceil(props.totalCount / props.pageSize) || 1),
            proxySortBy: makeOptionalProxy('sortBy', vm),
            proxySortDesc: makeOptionalProxy('sortDesc', vm),
            proxySelectIndex: makeOptionalProxy('selectIndex', vm),
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
            /** search */
            proxySearchText: makeOptionalProxy('searchText', vm),
            /** others */
            excludeSlotNames: ['toolbox-left', 'toolbox-bottom'],
        });

        /** Event emitter */
        const emitSelect = () => {
            emit('select', [...state.proxySelectIndex]);
        };

        const emitChange = (options: Partial<Options> = {}) => {
            state.proxySelectIndex = [];
            emitSelect();

            if (options.searchText !== undefined || state.proxyThisPage > state.proxyPageSize) {
                options.thisPage = 1;
                state.proxyThisPage = 1;
            }

            // check if each option value is 'undefined' to escape auto type casting
            emit('change', {
                sortBy: options.sortBy === undefined ? state.proxySortBy : options.sortBy,
                sortDesc: options.sortDesc === undefined ? state.proxySortDesc : options.sortDesc,
                thisPage: options.thisPage === undefined ? state.proxyThisPage : options.thisPage,
                pageSize: options.pageSize === undefined ? state.proxyPageSize : options.pageSize,
                searchText: options.searchText === undefined ? state.proxySearchText : options.searchText,
            } as Options, options);
        };

        const byPassEvent = (name, item, index, mouseEvent) => {
            emit(name, item, index, mouseEvent);
        };

        const emitExport = () => {
            emit('export');
        };

        /** Table event listeners */
        const onChangePageSize = (pageSize: number) => {
            emitChange({ pageSize });
        };

        const onChangePageNumber = (thisPage: number) => {
            emitChange({ thisPage });
        };

        const onChangeSort = (sortBy: string, sortDesc: boolean) => {
            emitChange({ sortBy, sortDesc });
        };

        const onSelect = (selectIndex: number[]) => {
            state.proxySelectIndex = [...selectIndex];
            emitSelect();
        };

        const onSearch = async (val?: string) => {
            state.proxySearchText = val || '';
            emitChange({ searchText: val || '' });
        };

        emit('init', {
            sortBy: state.proxySortBy,
            sortDesc: state.proxySortDesc,
            thisPage: state.proxyThisPage,
            pageSize: state.proxyPageSize,
            searchText: state.proxySearchText,
        });

        return {
            ...toRefs(state),
            emitChange,
            emitExport,
            onChangePageSize,
            onChangePageNumber,
            onChangeSort,
            onSelect,
            onSearch,
            byPassEvent,
        };
    },
};
</script>

<style lang="postcss">
    .p-search-table {
        .left-toolbox-item {
            &:last-child {
                flex-grow: 1;
            }
        }
        >>> .toolbox {
            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
</style>
