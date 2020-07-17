<template>
    <div :class="{'toolbox-table': true,background:toolboxBackground,'no-padding':!padding, 'toolbox-border': border}">
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
                    <div v-if="pagenationVisible" class="tool">
                        <p-text-pagenation
                            :this-page.sync="proxyThisPage"
                            :all-page="allPage"
                            @pageChange="changePageNumber"
                        />
                    </div>
                    <div v-if="pageSizeVisible" class="tool md-hide-tool">
                        <PDropdownMenuBtn
                            class="page-size-dropdown"
                            :menu="pageSizeOptions"
                            @select="changePageSize"
                        >
                            {{ proxyPageSize }}
                        </PDropdownMenuBtn>
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
            :dragable="false"
            :col-copy="colCopy"
            :select-index.sync="proxySelectIndex"
            :sort-by.sync="proxySortBy"
            :sort-desc.sync="proxySortDesc"
            :table-style-type="tableStyleType"
            :thead-style-type="theadStyleType"
            :responsive-style="responsiveStyle"
            :table-style="tableStyle"
            :tbody-style="tbodyStyle"
            :thead-style="theadStyle"
            :tfoot-style="tfootStyle"
            :striped="striped"
            :bordered="bordered"
            :hover="hover"
            :small="small"
            :background="background"
            :top-border="topBorder"
            :responsive="responsive"
            :loading="loading"
            :use-cursor-loading="useCursorLoading"
            :skeleton-rows="pageSize"
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
import _ from 'lodash';
import {
    computed, reactive, Ref, ref, defineComponent,
} from '@vue/composition-api';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
// eslint-disable-next-line import/named
import { dataTableProps } from '@/components/organisms/tables/data-table/DataTable.toolset';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import { makeProxy } from '@/lib/compostion-util';
// eslint-disable-next-line import/named
import { ToolBoxTableSetupProps } from '@/components/organisms/tables/toolbox-table/toolset';


export default {
    name: 'PToolboxTable',
    components: {
        PDataTable, PTextPagenation, PIconButton, PDropdownMenuBtn,
    },
    props: {
        ...dataTableProps,
        pagenationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
            type: Boolean,
            default: true,
        },
        shadow: {
            type: Boolean,
            default: true,
        },
        border: {
            type: Boolean,
            default: true,
        },
        settingVisible: {
            type: Boolean,
            default: true,
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
        padding: {
            type: Boolean,
            default: true,
        },
        toolboxBackground: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: ToolBoxTableSetupProps, { emit }) {
        const pageSizeOptions = computed(() => (_.flatMap(props.pageNationValues, size => ({ type: 'item', label: size, name: size }))));
        const proxyPageSize = makeProxy('pageSize');
        const proxyThisPage = makeProxy('thisPage');
        const proxySelectIndex = makeProxy('selectIndex');
        const proxySortBy = makeProxy('sortBy');
        const proxySortDesc = makeProxy('sortDesc');
        const changePageSize = (size) => {
            const sizeNum = Number(size);
            if (props.pageSize !== sizeNum) {
                proxyPageSize.value = sizeNum;
                proxyThisPage.value = 1;
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
            proxyThisPage.value = 1;
        };
        return {
            pageSizeOptions,
            proxyPageSize,
            proxyThisPage,
            proxySelectIndex,
            proxySortBy,
            proxySortDesc,
            changePageSize,
            changePageNumber,
            getSelectItem,
            changeSort,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .toolbox-border {
        @apply border border-gray-200 rounded-sm;
    }

    .toolbox-table {
        @apply overflow-visible;
        &.background {
            @apply bg-white;
        }

        .toolbox {
            @apply px-4 py-6 flex-col;
            /*margin-top: 0.5rem;*/
            .toolbox-block{
                @apply flex w-full;
            }
            .toolbox-top{
                @apply mb-4;
            }
            .toolbox-middle{
                @apply justify-between flex-no-wrap items-center;

                .left{
                    @apply flex flex-wrap justify-start w-auto;
                }
                .center{
                    @apply flex w-full flex-no-wrap justify-center;
                }
                .right{
                    @apply flex flex-no-wrap w-auto justify-end;
                    .page-size-dropdown::v-deep {
                        .p-dropdown-btn {
                            min-width: 6rem;
                        }
                    }
                }
            }
            .toolbox-bottom{
                @apply mt-4;

            }

        }
        &.no-padding{
            padding: 0;
        }
    }

    .tool{
        @apply inline;
        @screen md{
            @apply ml-4;
        }

    }
    .md-hide-tool{
        @apply hidden;
        @screen md{
            @apply inline;
        }

    }
</style>
