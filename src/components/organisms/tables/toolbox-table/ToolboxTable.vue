<template>
    <div :class="{'toolbox-table': true,background:toolboxBackground,'no-padding':!padding,'toolbox-shadow': shadow, 'toolbox-border': border}">
        <div class="toolbox">
            <p-row class="toolbox-middle">
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
                    <div v-if="pageSizeVisible" class="tool">
                        <PDropdownMenuBtn
                            class="page-size-dropdown"
                            :menu="pageSizeOptions"
                            @clickMenuEvent="changePageSize"
                        >
                            {{ proxyPageSize }}
                        </PDropdownMenuBtn>
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
            </p-row>
            <p-row v-if="$slots['toolbox-bottom']" class="toolbox-bottom">
                <slot name="toolbox-bottom" />
            </p-row>
        </div>
        <p-data-table
            ref="table"
            :fields="fields"
            :items="items"
            :sortable="sortable"
            :selectable="selectable"
            :multi-select="multiSelect"
            :dragable="dragable"
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
            :bord="bord"
            :hover="hover"
            :small="small"
            :background="background"
            :responsive="responsive"
            :loading="loading"
            :use-spinner-loading="useSpinnerLoading"
            :use-cursor-loading="useCursorLoading"
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
    computed, reactive, Ref, ref, createComponent,
} from '@vue/composition-api';
import PDataTable from '@/components/organisms/tables/data-table/DataTable.vue';
// eslint-disable-next-line import/named
import { dataTableProps } from '@/components/organisms/tables/data-table/toolset';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import PRow from '@/components/atoms/grid/row/Row.vue';
import { makeProxy } from '@/lib/compostion-util';
// eslint-disable-next-line import/named
import { ToolBoxTablePropsType, ToolBoxTableSetupProps } from '@/components/organisms/tables/toolbox-table/toolset';


export default createComponent({
    name: 'PToolboxTable',
    components: {
        PDataTable, PTextPagenation, PIconButton, PDropdownMenuBtn, PRow,
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
        pageSize: {
            type: Number,
            default: 15,
        },
        allPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
        },
        thisPage: {
            type: Number,
            validator(value) {
                return value > 0;
            },
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
    setup(props:ToolBoxTableSetupProps, { emit }) {
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
});
</script>

<style lang="scss" scoped>
    .toolbox-shadow {
        box-shadow: 0px 0px 8px #4D49B614;
    }

    .toolbox-border {
        border: 1px solid #F2F2F2;
    }

    .toolbox-table {
        &.background{
            background-color: $white;
        }

        padding: 1rem;
        .toolbox {
            margin-top: 0.5rem;
            .toolbox-middle{
                display: flex;
                justify-content: space-between;
                flex-wrap: nowrap;
                align-items: center;
                margin-bottom: 1rem;
                .left{
                    display: flex;
                    flex-wrap: wrap;
                    width: auto;
                    justify-content: flex-start;
                }
                .center{
                    display: inline-flex;
                    flex-wrap:nowrap;
                    width: 100%;
                    justify-content: center;

                }
                .right{
                    display: inline-flex;
                    flex-wrap:nowrap;
                    width: auto;
                    justify-content: flex-end;
                    .page-size-dropdown{
                        &::v-deep .menu-btn{
                            min-width: 4rem;
                        }
                    }
                }
            }
            .toolbox-bottom{
                width: auto;
            }

        }
        &.no-padding{
            padding: 0;
        }
    }

    .tool{
        margin-left: 1rem;
        display: inline;
    }

</style>
