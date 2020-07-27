<template>
    <div class="p-data-table">
        <table ref="table"
               :class="{
                   striped: striped,
                   bordered: bordered,
                   'no-hover': !hover,
                   'layout-fixed': layoutFixed,
                   'width-fixed': widthFixed,
                   [tableStyleType]: true,
               }"
        >
            <thead>
                <slot name="head" :fields="fieldsData">
                    <tr>
                        <th v-if="selectable" class="all-select">
                            <p-check-box v-if="multiSelect"
                                         v-model="allState"
                                         @change="selectAllToggle"
                            />
                        </th>
                        <th
                            v-for="(field, index) in fieldsData"
                            :key="index"
                            :style="{
                                minWidth: field.width || undefined
                            }"
                            :class="{'fix-width': colCopy}"
                            @click="theadClick(field, index, $event)"
                            @mouseenter="thHoverIndex=index"
                            @mouseleave="thHoverIndex=null"
                        >
                            <slot :name="`th-${field.name}`" :index="index" :field="field"
                                  :sortable="sortable"
                            >
                                <span class="th-contents">
                                    <span>
                                        {{ field.label ? field.label : field.name }}
                                        <p-copy-button v-if="colCopy"
                                                       class="ml-2"
                                                       @copy="clickColCopy(index)"
                                        />
                                    </span>

                                    <template v-if="sortable&&field.sortable">
                                        <p-i
                                            v-if="sortable&&(field.sortKey|| field.name)===sortBy"
                                            :name="sortIcon"
                                            class="sort-icon"
                                        />
                                        <p-i v-else
                                             name="ic_table_sort"
                                             class="sort-icon"
                                        />
                                    </template>
                                </span>
                            </slot>
                        </th>
                    </tr>
                </slot>
            </thead>
            <tbody>
                <slot v-if="loading" name="loading">
                    <!--                <tr v-for="s in skeletons" :key="s">-->
                    <!--                    <td v-if="selectable" class="!pr-0  min-w-4 w-4">-->
                    <!--                        <p-skeleton width="1rem" height="1rem" />-->
                    <!--                    </td>-->
                    <!--                    <td v-for="(field, index) in fieldsData" :key="index">-->
                    <!--                        <slot :name="'skeleton-'+field.name" :index="index" :field="field">-->
                    <!--                            <p-skeleton />-->
                    <!--                        </slot>-->
                    <!--                    </td>-->
                    <!--                </tr>-->
                    <tr v-if="loading" key="loading" class="tr-no-data">
                        <td :colspan="selectable? fieldsData.length +1 :fieldsData.length">
                            <p-lottie name="spinner" :size="2"
                                      :auto="true"
                            />
                        </td>
                    </tr>
                </slot>
                <slot v-else-if="showNoData" name="no-data" :fields="fieldsData">
                    <tr key="noData" class="tr-no-data">
                        <td :colspan="selectable? fieldsData.length +1 :fieldsData.length">
                            {{ $t('ORGANISMS.NO_DATA') }}
                        </td>
                    </tr>
                </slot>
                <slot v-else name="body" :items="items">
                    <slot v-for="(item, index) in items" name="row" :fields="fieldsName"
                          :item="item" :index="index"
                    >
                        <slot :name="'row-'+index"
                              :item="item"
                              :index="index"
                              :fields="fieldsName"
                        >
                            <tr :key="index" :data-index="index"
                                :class="{
                                    'tr-selected': isSelected(index),
                                    'row-height-fixed': rowHeightFixed
                                } "
                                v-bind="(item&& item.hasOwnProperty('vbind') )? item.vbind : null"
                                @click.left="rowLeftClick( item, index, $event )"
                                @click.right="rowRightClick( item, index, $event )"
                                @click.middle="rowMiddleClick( item, index, $event )"
                                @mouseover="rowMouseOver(item,index, $event)"
                                @mouseout="rowMouseOut(item,index, $event)"
                            >
                                <td v-if="selectable"
                                    class="select-checkbox"
                                    @click.stop.prevent="selectClick"
                                    @mouseenter="hoverIndex=index"
                                    @mouseleave="hoverIndex=null"
                                >
                                    <p-check-box v-if="multiSelect"
                                                 v-model="proxySelectIndex"
                                                 :value="index"
                                                 :hovered="hoverIndex===index"
                                    />
                                    <p-radio v-else
                                             v-model="proxySelectIndex[0]"
                                             :value="index"
                                             :hovered="hoverIndex===index"
                                    />
                                </td>
                                <slot v-for="(field, i) in fieldsName"
                                      :name="'col-'+field"
                                      :item="item"
                                      :value=" item? item[field] :''"
                                      :index="index"
                                      :field="field"
                                >
                                    <td :key="i">
                                        <slot
                                            :name="'col-'+field+'-format'"
                                            :item="item"
                                            :value="getValueFunc(item,field)"
                                            :index="index"
                                            :field="field"
                                        >
                                            {{ getValueFunc(item,field) }}
                                        </slot>
                                    </td>
                                </slot>
                            </tr>
                        </slot>
                    </slot>
                </slot>
            </tbody>
            <tfoot>
                <slot name="foot" />
            </tfoot>
        </table>
    </div>
</template>

<script lang="ts">
import {
    toRefs, computed, reactive, watch, onMounted, Ref, ref,
} from '@vue/composition-api';
import {
    flatMap, range, get, every,
} from 'lodash';
import PI from '@/components/atoms/icons/PI.vue';
import PLottie from '@/components/molecules/lottie/PLottie.vue';
import { copyAnyData, selectToCopyToClipboard } from '@/components/util/helpers';
import { windowEventMount } from '@/components/util/composition-helpers';
import { tableProps } from '@/components/molecules/tables/PTable.toolset';
import { DataTableSetupProps } from './PDataTable.toolset';

const PCheckBox = () => import('@/components/molecules/forms/checkbox/PCheckBox.vue');
const PRadio = () => import('@/components/molecules/forms/radio/PRadio.vue');
const PCopyButton = () => import('@/components/molecules/buttons/copy-button/PCopyButton.vue');


const loadingHandler = (props) => {
    onMounted(() => {
        if (props.useCursorLoading && props.loading) {
            document.body.style.cursor = 'progress';
        }
    });
    watch(() => props.loading, (value) => {
        if (props.useCursorLoading) {
            if (value) {
                document.body.style.cursor = 'progress';
            } else {
                document.body.style.cursor = 'default';
            }
        }
    });
};


export default {
    name: 'PDataTable',
    components: {
        // PSkeleton,
        PI,
        PCheckBox,
        PCopyButton,
        PLottie,
        PRadio,
    },
    props: {
        ...tableProps,
        fields: Array,
        items: Array,
        sortable: {
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
        loading: {
            type: Boolean,
            default: false,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        skeletonRows: {
            type: Number,
            default: 5,
        },
        rowClickMultiSelectMode: {
            type: Boolean,
            default: false,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: DataTableSetupProps, context) {
        const state = reactive({
            table: null,
            allState: false,
            hoverIndex: null,
            thHoverIndex: null,
        });
        const proxySelectIndex: Ref<number[]> = computed({
            set(val) {
                context.emit('update:selectIndex', val);
                context.emit('select', val);
            },
            get() { return props.selectIndex; },
        }) as unknown as Ref<number[]>;
        const fieldsData: Ref<any> = computed(() => {
            const data = flatMap(props.fields, (value: string|object) => {
                if (typeof value === 'string') { return { name: value, label: value, sortable: true }; }
                return { sortable: true, ...value };
            });
            return data;
        });

        const fieldsName = computed(() => flatMap(fieldsData.value, field => field.name));
        const sortIcon = computed(() => (props.sortDesc ? 'ic_table_sort_fromZ' : 'ic_table_sort_fromA'));
        // @ts-ignore
        const copyTargetElement = computed(() => state.table.children[1].children);
        const showNoData = computed(() => {
            // eslint-disable-next-line no-prototype-builtins
            if (!props.items || !props.items.hasOwnProperty('length') || props.items.length === 0) {
                if (props.loading) {
                    return false;
                }
                return true;
            }
            return false;
        });
        const skeletons = computed(() => range(props.skeletonRows));

        const makeTableText = (el) => {
            let result = '';
            const startIdx = props.selectable ? 1 : 0;
            const tds = el.children;
            // eslint-disable-next-line no-plusplus
            for (let idx = startIdx; idx < el.childElementCount; idx++) {
                result += `${tds[idx].innerText}\t`;
            }
            return `${result}\n`;
        };
        const copy = (event) => {
        /**
         * TODO: single select copy
         */
            const hasSelectData = () => {
                const selection = document.getSelection();
                if (selection && selection.type === 'Range') {
                    return true;
                }
                return false;
            };

            if (!hasSelectData()) {
                if (!props.multiSelect) return;

                if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && (proxySelectIndex.value as Array<any>).length > 0) {
                    let result = '';
                    if (Array.isArray(proxySelectIndex.value)) {
                        proxySelectIndex.value.forEach((tr) => {
                            result += makeTableText(copyTargetElement.value[tr]);
                        });
                    }
                    selectToCopyToClipboard(result);
                }
            }
        };
        const isSelected = index => (props.multiSelect ? proxySelectIndex.value.indexOf(index) !== -1 : proxySelectIndex.value[0] === index);
        const checkboxToggle = (index) => {
            const newSelected = [...proxySelectIndex.value];
            if (isSelected(index)) {
                const idx = newSelected.indexOf(index);
                newSelected.splice(idx, 1);
                state.allState = false;
            } else {
                newSelected.push(index);
            }
            proxySelectIndex.value = newSelected;
        };
        const rowLeftClick = (item, index, event) => {
            context.emit('rowLeftClick', item, index, event);
            if (!props.selectable) return;
            if (props.multiSelect) {
                if (props.rowClickMultiSelectMode) {
                    checkboxToggle(index);
                    return;
                }
                if (event.shiftKey) {
                    checkboxToggle(index);
                    return;
                }
            }
            proxySelectIndex.value = [index];
        };
        const rowRightClick = (item, index, event) => {
            context.emit('rowRightClick', item, index, event);
        };
        const rowMiddleClick = (item, index, event) => {
            context.emit('rowMiddleClick', item, index, event);
        };
        const rowMouseOver = (item, index, event) => {
            context.emit('rowMouseOver', item, index, event);
        };
        const rowMouseOut = (item, index, event) => {
            context.emit('rowMouseOut', item, index, event);
        };
        const theadClick = (field, index, event) => {
            if (props.sortable && field.sortable) {
                let sortBy = field.sortKey || field.name;
                const sortDesc = props.sortDesc;

                if (props.sortBy !== sortBy) {
                    context.emit('update:sortBy', sortBy);
                    if (!sortDesc) {
                        context.emit('update:sortDesc', true);
                    }
                } else {
                    if (!sortDesc) {
                        sortBy = '';
                        context.emit('update:sortBy', '');
                    }
                    context.emit('update:sortDesc', !sortDesc);
                }

                context.emit('changeSort', sortBy, sortDesc);
            }
            context.emit('theadClick', field, index, event);
        };

        const selectClick = (event) => {
            event.target.children[0].click();
        };
        const selectAllToggle = () => {
            if (state.allState) {
                proxySelectIndex.value = Array.from(new Array(props.items.length).keys());
            } else {
                proxySelectIndex.value = [];
            }
        };
        const getSelectItem = (sortable) => {
            const selectedIndex = sortable ? proxySelectIndex.value : proxySelectIndex.value.sort((a, b) => a - b);
            const selectItem = [];
            // @ts-ignore
            selectedIndex.forEach((index) => {
                // @ts-ignore
                selectItem.push(props.items[index]);
            });
            return selectItem;
        };
        const clickColCopy = (idx) => {
            let result = '';
            const arr = Array.from(copyTargetElement.value as any[]);
            arr.forEach((el) => {
                // @ts-ignore
                const children = Array.from(el.children);
                children.forEach((td, colIdx) => {
                    if (colIdx === idx) {
                        // @ts-ignore
                        result += `${td.innerText}\t`;
                    }
                });
            });
            copyAnyData(result);
        };

        if (props.selectable) {
            windowEventMount('keydown', copy);
        }


        watch(() => proxySelectIndex.value, () => {
            if (props.items && props.items.length && props.items.length === (proxySelectIndex.value as any[]).length) {
                state.allState = true;
            } else {
                state.allState = false;
            }
        });

        loadingHandler(props);


        const getValueFunc = computed(() => {
            if (every(fieldsName.value, field => !field.includes('.'))) {
                return (item, field) => item[field] || '';
            }
            return (item, field) => get(item, field, '');
        });


        return {
            ...toRefs(state),
            proxySelectIndex,
            fieldsData,
            fieldsName,
            sortIcon,
            showNoData,
            isSelected,
            rowLeftClick,
            rowRightClick,
            rowMiddleClick,
            rowMouseOver,
            rowMouseOut,
            theadClick,
            selectClick,
            selectAllToggle,
            getSelectItem,
            clickColCopy,
            getValueFunc,
            skeletons,
        };
    },

};
</script>

<style lang="postcss">

    @define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color, $hover-color {
        /* th */
        th {
            background-color: $th-bg-color;
            height: 2rem;
        }
        tr {
            &.tr-selected {
                @apply text-secondary bg-blue-200;
            }
            &:not(.no-hover):hover {
                background-color: $hover-color;
            }
        }
        &.bordered {
            tr:not(.tr-no-data) {
                td {
                    border-bottom: 1px solid $border-color;
                }
            }
        }
        &.striped {
            tr:nth-of-type(odd) {
                background-color: $stripe-bg-color;
            }
            tr:nth-of-type(even) {
                background-color: transparent;
            }
            tr:not(.no-hover):hover {
                background-color: $hover-color;
            }
        }
    }

    .p-data-table {
        @apply overflow-auto h-full w-full;
        table {
            @apply min-w-full;
            border-collapse: separate;
            border-spacing: 0;
            &.layout-fixed {
                table-layout: fixed;
            }
            &.width-fixed {
                @apply w-full;
            }
        }
        th {
            position: sticky;
            z-index: 1;
            top: 0;
            line-height: 2;
            font-size: 0.875rem;
            text-align: left;
            letter-spacing: 0;
            white-space: nowrap;
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            .th-contents {
                @apply flex justify-between pl-4 py-1;
            }
            .sort-icon {
                @apply text-gray-500 float-right my-px;
                &:hover { cursor: pointer; }
            }
            &.fix-width {
                @apply min-w-19;
            }
            &:last-child {
                .th-contents {
                    @apply pr-2;
                }
            }
            &.all-select {
                @apply w-4 py-1 pl-4 max-w-15 min-w-15;
            }
        }
        td {
            @apply h-10 px-4 z-0 align-middle min-w-28 text-sm leading-normal;
            vertical-align: middle;
        }
        tr {
            &.row-height-fixed {
                td {
                    @apply truncate;
                }
            }
            &.tr-no-data {
                @apply border-transparent;
                td {
                    @apply border-transparent text-primary2 border-0 text-center py-12 text-2xl;
                    &:hover {
                        @apply bg-white;
                    }
                    line-height: 120%;
                }
            }
        }

        .select-checkbox {
            @apply cursor-pointer min-w-4 w-4;
        }

        /* themes */
        .default {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
        }

        .light {
            @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
            th {
                border-bottom: 1px solid theme('colors.gray.200');
            }
        }

        .primary4 {
            @mixin table-theme theme('colors.white'), transparent, theme('colors.white'), transparent;
            tr {
                @apply bg-primary4;
            }
            &.bordered {
                td {
                    border-bottom-width: 4px;
                }
            }
        }
    }

</style>
