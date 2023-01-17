<template>
    <p-toolbox-table class="p-query-search-table"
                     search-type="query"
                     :searchable="searchable"
                     :fields="fields"
                     :items="items"
                     :loading="loading"
                     :total-count="totalCount"
                     :sort-by.sync="proxyState.sortBy"
                     :sort-desc.sync="proxyState.sortDesc"
                     :select-index="proxyState.selectIndex"
                     :this-page.sync="proxyState.thisPage"
                     :page-size.sync="proxyState.pageSize"
                     :query-tags.sync="proxyState.queryTags"
                     :key-item-sets="keyItemSets"
                     :value-handler-map="valueHandlerMap"
                     :exportable="excelVisible"
                     :row-cursor-pointer="rowCursorPointer"
                     :invalid="invalid"
                     use-cursor-loading
                     sortable
                     :selectable="selectable"
                     :multi-select="multiSelect"
                     @change="emitChange"
                     @select="emitSelect"
                     @refresh="emitChange()"
                     @export="emitExport"
                     @rowLeftClick="byPassEvent('rowLeftClick', ...arguments)"
    >
        <template v-for="(_, slot) of $scopedSlots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import {
    getCurrentInstance, reactive,
} from 'vue';

import type { Options, QuerySearchTableProps } from '@/data-display/tables/query-search-table/type';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import type {
    QueryTag,
} from '@/inputs/search/query-search-tags/type';
import { makeOptionalProxy } from '@/utils/composition-helpers';

export default {
    name: 'PQuerySearchTable',
    components: {
        PToolboxTable,
    },
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
            default: undefined,
        },
        sortDesc: {
            type: Boolean,
            default: undefined,
        },
        selectIndex: {
            type: Array,
            default: undefined,
        },
        thisPage: {
            type: Number,
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        keyItemSets: {
            type: Array,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
        queryTags: {
            type: Array,
            default: undefined,
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
        rowCursorPointer: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        timezone: {
            type: String,
            default: 'UTC',
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
    setup(props: QuerySearchTableProps, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const proxyState = reactive({
            selectIndex: makeOptionalProxy<number[]>('selectIndex', vm, [], ['select']),
            sortBy: makeOptionalProxy<string>('sortBy', vm, ''),
            sortDesc: makeOptionalProxy<boolean>('sortDesc', vm, true),
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, 15),
            queryTags: makeOptionalProxy<QueryTag[]>('queryTags', vm, []),
        });


        /** Event emitter */
        const emitSelect = (selectIndex) => {
            proxyState.selectIndex = selectIndex;
        };

        const emitChange = (options: Options = {}) => {
            emitSelect([]);

            if (options.queryTags) {
                proxyState.thisPage = 1;
            }

            emit('change', options);
        };

        const byPassEvent = (name, ...args) => {
            emit(name, ...args);
        };

        const emitExport = () => {
            emit('export');
        };

        return {
            proxyState,
            emitChange,
            emitExport,
            emitSelect,
            byPassEvent,
        };
    },
};
</script>

<style lang="postcss">
.p-query-search-table {
    .left-toolbox-item {
        &:last-child {
            flex-grow: 1;
        }
    }
    &.p-toolbox-table {
        .toolbox {
            @apply pb-2;

            .toolbox-bottom {
                @apply mt-0;
            }
        }
    }
}
</style>
