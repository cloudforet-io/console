<template>
    <p-toolbox-table class="p-search-table"
                     search-type="plain"
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
                     :search-text.sync="proxyState.searchText"
                     :exportable="excelVisible"
                     :page-size-changeable="pageSizeVisible"
                     use-cursor-loading
                     :settings-visible="false"
                     sortable
                     :selectable="selectable"
                     :multi-select="multiSelect"
                     :invalid="invalid"
                     @change="emitChange"
                     @select="emitSelect"
                     @refresh="emitChange()"
                     @export="emitExport()"
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
import type { Vue } from 'vue/types/vue';

import type { Options, SearchTableProps } from '@/data-display/tables/search-table/type';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import { makeOptionalProxy } from '@/utils/composition-helpers';


export default {
    name: 'PSearchTable',
    components: { PToolboxTable },
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
        searchText: {
            type: String,
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
        pageSizeVisible: {
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
        invalid: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: SearchTableProps, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const proxyState = reactive({
            selectIndex: makeOptionalProxy<number[]>('selectIndex', vm, [], ['select']),
            sortBy: makeOptionalProxy<string>('sortBy', vm, ''),
            sortDesc: makeOptionalProxy<boolean>('sortDesc', vm, true),
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, 15),
            searchText: makeOptionalProxy<string>('searchText', vm, ''),
        });

        /** Event emitter */
        const emitSelect = (selectIndex) => {
            proxyState.selectIndex = selectIndex;
        };

        const emitChange = (options: Options = {}) => {
            emitSelect([]);

            if (options.searchText !== undefined) {
                proxyState.thisPage = 1;
            }

            // check if each option value is 'undefined' to escape auto type casting
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
