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
                     use-cursor-loading
                     :setting-visible="false"
                     sortable
                     selectable
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitChange()"
                     @clickExcel="emitExport()"
    >
        <template #toolbox-left>
            <slot name="toolbox-left" />
            <div class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                <p-search v-model="proxySearchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>
        <template #toolbox-bottom>
            <div class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-model="proxySearchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
            <slot name="toolbox-bottom" />
        </template>
        <template v-for="name in slotNames" v-slot:[name]="data">
            <slot :name="name" v-bind="data" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import PSearch from '@/components/molecules/search/PSearch.vue';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { makeOptionalProxy } from '@/components/util/composition-helpers';
import { forEach } from 'lodash';
import { Options } from '@/components/organisms/tables/search-table/type';

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
    },
    setup(props, { emit, slots }) {
        const vm = getCurrentInstance() as ComponentInstance;

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
            options: computed<Options>(() => ({
                sortBy: state.proxySortBy,
                sortDesc: state.proxySortDesc,
                thisPage: state.proxyThisPage,
                pageSize: state.proxyPageSize,
                searchText: state.proxySearchText,
            })),
            slotNames: computed(() => {
                const res: string[] = [];
                forEach(slots, (func, name) => {
                    if (!['toolbox-left', 'toolbox-bottom'].includes(name)) res.push(name);
                });
                return res;
            }),
        });

        /** Event emitter */
        const emitChange = (options?: Partial<Options>) => {
            emit('change', Object.freeze({
                ...state.options,
                ...options,
            }), Object.freeze({ ...options }));
        };

        const emitExport = () => {
            emit('export');
        };

        const emitSelect = () => {
            emit('select', [...state.proxySelectIndex]);
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
            state.selectIndex = [...selectIndex];
            emitSelect();
        };

        const onSearch = async (val?: string) => {
            state.proxySearchText = val;
            emitChange({ searchText: val });
        };

        return {
            ...toRefs(state),
            emitChange,
            emitExport,
            onChangePageSize,
            onChangePageNumber,
            onChangeSort,
            onSelect,
            onSearch,
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
