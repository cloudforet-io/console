<template>
    <div class="p-toolbox-table">
        <div class="toolbox">
            <div v-if="$slots['toolbox-top']" class="toolbox-block toolbox-top">
                <slot name="toolbox-top" />
            </div>
            <div class="toolbox-block toolbox-middle">
                <div class="left" :style="{width:$slots['toolbox-center'] ? 'auto' : '100%'}">
                    <slot name="toolbox-left" />
                </div>
                <div v-if="$slots['toolbox-center']" class="center">
                    <slot name="toolbox-center" />
                </div>
                <div class="right">
                    <slot name="toolbox-right" />
                    <div v-if="paginationVisible" class="tool">
                        <p-text-pagination
                            :this-page.sync="proxyThisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <div v-if="pageSizeVisible" class="tool md-hide-tool">
                        <p-dropdown-menu-btn
                            class="page-size-dropdown"
                            :menu="pageSizeOptions"
                            @select="changePageSize"
                        >
                            {{ proxyPageSize }}
                        </p-dropdown-menu-btn>
                    </div>
                    <div v-if="excelVisible" class="tool">
                        <p-icon-button
                            name="ic_excel"
                            @click="$emit('clickExcel',$event)"
                        />
                    </div>
                    <div v-if="settingVisible" class="tool">
                        <p-icon-button
                            name="ic_setting"
                            @click="$emit('clickSetting',$event)"
                        />
                    </div>
                    <div v-if="refreshVisible" class="tool">
                        <p-icon-button
                            name="ic_refresh"
                            @click="$emit('clickRefresh',$event)"
                        />
                    </div>
                </div>
            </div>
            <div v-if="$slots['toolbox-bottom']" class="toolbox-block toolbox-bottom">
                <slot name="toolbox-bottom" />
            </div>
        </div>
        <p-data-table
            ref="table"
            :fields="fields"
            :items="items"
            :sortable="sortable"
            :selectable="selectable"
            :multi-select="multiSelect"
            :col-copy="colCopy"
            :select-index.sync="proxySelectIndex"
            :sort-by.sync="proxySortBy"
            :sort-desc.sync="proxySortDesc"
            :table-style-type="tableStyleType"
            :striped="striped"
            :bordered="bordered"
            :hover="hover"
            :loading="loading"
            :use-cursor-loading="useCursorLoading"
            :skeleton-rows="pageSize"
            :width="width"
            :row-height-fixed="rowHeightFixed"
            :row-cursor-pointer="rowCursorPointer"
            v-on="$listeners"
            @changeSort="changeSort"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-data-table>
    </div>
</template>

<script lang="ts">
import { flatMap } from 'lodash';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, ref, toRefs,
} from '@vue/composition-api';

import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PTextPagination from '@/components/organisms/pagination/PTextPagination.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import { PToolboxTableProps } from '@/components/organisms/tables/toolbox-table/type';
import { makeOptionalProxy } from '@/components/util/composition-helpers';

const color = ['default', 'light', 'primary4'];

export default {
    name: 'PToolboxTable',
    components: {
        PDataTable, PTextPagination, PIconButton, PDropdownMenuBtn,
    },
    props: {
        // PDataTableProps
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array,
            required: true,
        },
        items: {
            type: Array,
            required: true,
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: null,
        },
        sortDesc: {
            type: Boolean,
            default: true,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: [Array, Number],
            default: () => [],
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        skeletonRows: {
            type: Number,
            default: 5,
        },
        tableStyleType: {
            type: String,
            default: 'default',
            validator(value) {
                return [null, ...color].indexOf(value) !== -1;
            },
        },
        striped: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: true,
        },
        hover: {
            type: Boolean,
            default: false,
        },
        width: {
            type: String,
            default: undefined,
        },
        rowHeightFixed: {
            type: Boolean,
            default: true,
        },
        rowCursorPointer: {
            type: Boolean,
            default: false,
        },
        // PToolboxTableProps
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
            type: Boolean,
            default: true,
        },
        settingVisible: {
            type: Boolean,
            default: false,
        },
        refreshVisible: {
            type: Boolean,
            default: true,
        },
        excelVisible: {
            type: Boolean,
            default: false,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
        allPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
            default: 1,
        },
        thisPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
            default: 1,
        },
        pageNationValues: {
            type: Array,
            default: () => [15, 30, 45],
        },
    },
    setup(props: PToolboxTableProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const state = reactive({
            pageSizeOptions: computed(() => (flatMap(props.pageNationValues, size => ({ type: 'item', label: size, name: size })))),
            proxyPageSize: makeOptionalProxy('pageSize', vm),
            proxyThisPage: makeOptionalProxy('thisPage', vm),
            proxySelectIndex: makeOptionalProxy('selectIndex', vm),
            proxySortBy: makeOptionalProxy('sortBy', vm),
            proxySortDesc: makeOptionalProxy('sortDesc', vm),
        });

        const changePageSize = (size) => {
            const sizeNum = Number(size);
            if (props.pageSize !== sizeNum) {
                state.proxyPageSize = sizeNum;
                state.proxyThisPage = 1;
                emit('changePageSize', sizeNum);
            }
        };
        const changePageNumber = (page) => {
            emit('changePageNumber', page);
        };
        const table = ref(null);
        // @ts-ignore
        const getSelectItem = () => table.getSelectItem();

        const changeSort = () => {
            state.proxyThisPage = 1;
        };

        return {
            ...toRefs(state),
            changePageSize,
            changePageNumber,
            getSelectItem,
            changeSort,
        };
    },
};
</script>

<style lang="postcss">
    .p-toolbox-table {
        @apply flex flex-col bg-white border border-gray-200 rounded-sm;

        .p-data-table {
            @apply overflow-auto;
        }

        .toolbox {
            @apply px-4 py-6 flex-col;

            /* margin-top: 0.5rem; */
            .toolbox-block {
                @apply flex w-full;
            }
            .toolbox-top {
                @apply mb-4;
            }
            .toolbox-middle {
                @apply justify-between flex-no-wrap items-center;

                .left {
                    @apply flex flex-wrap justify-start w-auto;
                }
                .center {
                    @apply flex w-full flex-no-wrap justify-center;
                }
                .right {
                    @apply flex flex-no-wrap w-auto justify-end;
                    .page-size-dropdown::v-deep {
                        .p-dropdown-btn {
                            min-width: 6rem;
                        }
                    }
                }
            }
        }
        .tool {
            @apply inline;

            @screen md {
                @apply ml-4;
            }
        }
        .md-hide-tool {
            @apply hidden;

            @screen md {
                @apply inline;
            }
        }
    }
</style>
