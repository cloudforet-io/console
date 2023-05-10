<template>
    <div class="p-data-table"
         :class="{
             striped: striped,
             bordered: bordered,
             [tableStyleType]: true,
         }"
         :style="tableCustomStyle"
    >
        <div class="table-container"
             :style="tableCustomStyle.maxHeight && { maxHeight: 'inherit', height: 'inherit' }"
        >
            <table>
                <thead>
                    <slot name="head"
                          v-bind="getDefaultSlotProps()"
                    >
                        <template v-if="showHeader">
                            <tr v-for="(fieldRow, fieldRowIdx) in tableFieldRows"
                                :key="fieldRowIdx"
                                class="fade-in"
                            >
                                <th v-if="selectable && fieldRowIdx === 0"
                                    :rowspan="numOfFieldRows"
                                    class="all-select"
                                >
                                    <p-checkbox v-if="multiSelect"
                                                v-model="allState"
                                                @change="onSelectAllToggle"
                                    />
                                </th>
                                <th v-for="(field, fieldColIndex) in fieldRow"
                                    :key="`th-${contextKey}-${fieldColIndex}-${fieldRowIdx}`"
                                    :rowspan="getFieldRowspan(field, fieldRowIdx)"
                                    :colspan="getFieldColspan(field)"
                                    :style="{
                                        minWidth: field.width || undefined,
                                        width: field.width || undefined,
                                    }"
                                    :class="{'fix-width': colCopy}"
                                    @click="onTheadClick(field, fieldColIndex, $event)"
                                >
                                    <slot :name="`th-${field.name}`"
                                          v-bind="getHeadSlotProps(field, fieldColIndex, fieldRowIdx)"
                                    >
                                        <span class="th-contents"
                                              :class="{
                                                  [field.textAlign || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                                  'has-icon': isFieldSortable(field.sortable) || colCopy,
                                              }"
                                        >
                                            <span class="th-text">
                                                <slot name="th-format"
                                                      v-bind="getHeadSlotProps(field, fieldColIndex, fieldRowIdx)"
                                                >
                                                    <slot :name="`th-${field.name}-format`"
                                                          v-bind="getHeadSlotProps(field, fieldColIndex, fieldRowIdx)"
                                                    >
                                                        {{ field.label ? field.label : field.name }}
                                                    </slot>
                                                </slot>
                                                <p-copy-button v-if="colCopy && !field.disableCopy && isLeafField(field)"
                                                               copy-manually
                                                               @copy="onClickColCopy(field)"
                                                />
                                            </span>

                                            <template v-if="isFieldSortable(field.sortable)">
                                                <p-i
                                                    v-if="sortable && (field.sortKey|| field.name) === sortBy"
                                                    :name="proxyState.proxySortDesc ? 'ic_caret-up-filled' : 'ic_caret-down-filled'"
                                                    class="sort-icon"
                                                />
                                                <p-i v-else
                                                     name="ic_caret-down"
                                                     class="sort-icon"
                                                />
                                            </template>
                                        </span>
                                    </slot>
                                </th>
                            </tr>
                        </template>
                        <template v-else>
                            <tr>
                                <th :colspan="selectable ? leafFields.length +1 : leafFields.length" />
                            </tr>
                        </template>
                    </slot>
                </thead>
                <tbody ref="tbodyRef">
                    <slot v-if="showNoData"
                          name="no-data"
                          v-bind="getDefaultSlotProps()"
                    >
                        <div class="no-data">
                            <slot name="no-data-format"
                                  v-bind="getDefaultSlotProps()"
                            >
                                {{ $t('COMPONENT.DATA_TABLE.NO_DATA') }}
                            </slot>
                        </div>
                        <tr :colspan="selectable ? leafFields.length +1 : leafFields.length"
                            class="fake-row"
                        />
                    </slot>
                    <slot name="body"
                          :items="items"
                          v-bind="getDefaultSlotProps()"
                    >
                        <tr v-for="(item, rowIndex) in items"
                            :key="`tr-${contextKey}-${rowIndex}`"
                            :data-index="rowIndex"
                            class="fade-in"
                            :class="{
                                ...(getRowClassNames && getRowClassNames()),
                                'tr-selected': getSelectedState(item, rowIndex),
                                'row-height-fixed': rowHeightFixed,
                                'row-cursor-pointer': rowCursorPointer,
                                'no-hover': disableHover,
                            } "
                            @click.left="onRowLeftClick( item, rowIndex, $event )"
                        >
                            <td v-if="selectable"
                                class="select-checkbox"
                                @click.stop.prevent="onSelectClick"
                            >
                                <p-checkbox v-if="multiSelect"
                                            v-model="proxyState.proxySelectIndex"
                                            :disabled="getRowSelectable ? getRowSelectable(item, rowIndex): false"
                                            :value="rowIndex"
                                />
                                <p-radio v-else
                                         :selected="proxyState.proxySelectIndex[0]"
                                         :disabled="getRowSelectable ? getRowSelectable(item, rowIndex): false"
                                         :value="rowIndex"
                                         @change="onChangeRadioSelect"
                                />
                            </td>
                            <td v-for="(field, colIndex) in leafFields"
                                :key="`td-${contextKey}-${rowIndex}-${colIndex}`"
                                :class="{
                                    'has-width': !!field.width,
                                    [field.textAlign || DATA_TABLE_CELL_TEXT_ALIGN.left]: true,
                                }"
                            >
                                <slot name="col-format"
                                      v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                >
                                    <slot :name="`col-${field.name}-format`"
                                          v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                    >
                                        <slot :name="`col-${colIndex}-format`"
                                              v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                        >
                                            <p-text-beautifier v-if="beautifyText"
                                                               :value="getValue(item, field)"
                                            />
                                            <template v-else>
                                                {{ getValue(item, field) }}
                                            </template>
                                        </slot>
                                    </slot>
                                </slot>
                            </td>
                        </tr>
                    </slot>
                </tbody>
                <tfoot>
                    <slot name="foot" />
                </tfoot>
            </table>
        </div>

        <div v-if="showLoading"
             class="loading-backdrop fade-in"
        />
        <div v-if="showLoading"
             class="loading"
        >
            <slot name="loading">
                <p-spinner size="xl" />
            </slot>
        </div>
        <div v-if="invalid"
             class="invalid-cover"
        />
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    toRefs, computed, reactive, watch, defineComponent,
} from 'vue';

import { get, range } from 'lodash';

import { DATA_TABLE_STYLE_TYPE, DATA_TABLE_CELL_TEXT_ALIGN } from '@/data-display/tables/data-table/config';
import type { DataTableField, DataTableFieldType, DataTableProps } from '@/data-display/tables/data-table/type';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import { useProxyValue } from '@/hooks';
import { copyAnyData } from '@/utils/helpers';

const PCheckbox = () => import('@/inputs/checkbox/PCheckbox.vue');
const PTextBeautifier = () => import('@/data-display/text-beautifier/PTextBeautifier.vue');
const PRadio = () => import('@/inputs/radio/PRadio.vue');
const PI = () => import('@/foundation/icons/PI.vue');
const PCopyButton = () => import('@/inputs/buttons/copy-button/PCopyButton.vue');

interface TableField extends DataTableFieldType {
    depth?: number;
}

export default defineComponent<DataTableProps>({
    name: 'PDataTable',
    components: {
        PSpinner,
        PTextBeautifier,
        PI,
        PCheckbox,
        PCopyButton,
        PRadio,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array,
            required: true,
            default: () => [],
        },
        items: {
            type: Array,
            default: () => [],
        },
        sortable: {
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
        colCopy: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        rowClickMultiSelectMode: {
            type: Boolean,
            default: false,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        tableStyleType: {
            type: String,
            default: 'default',
            validator(value: any) {
                return Object.values(DATA_TABLE_STYLE_TYPE).includes(value);
            },
        },
        tableCustomStyle: {
            type: Object as PropType<{ [key: string]: string }>,
            default: () => ({}),
        },
        striped: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: true,
        },
        disableHover: {
            type: Boolean,
            default: false,
        },
        rowHeightFixed: {
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
        getRowClassNames: {
            type: Function,
            default: undefined,
        },
        getRowSelectable: {
            type: Function,
            default: undefined,
        },
        beautifyText: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const getChildFields = (field: DataTableFieldType): DataTableFieldType[]|undefined => field.children?.map((child) => ({ sortable: true, ...child }));

        const isFieldSortable = (sortable: boolean | undefined): boolean => (props.sortable ? sortable !== false : false);

        const getTableField = (field: string|DataTableFieldType): TableField => {
            if (typeof field === 'string') return { name: field, label: field, sortable: true };

            const children = getChildFields(field);
            return { ...field, children, sortable: children?.length ? false : isFieldSortable(field.sortable) };
        };

        const getTableFieldRows = (fields: TableField[], tableFieldRows: TableField[][] = []): TableField[][] => {
            fields.forEach((tableField: TableField) => {
                const row = tableFieldRows[tableField.depth ?? 0] ?? [];
                if (!tableField.invisible) row.push(tableField);
                if (row.length) tableFieldRows[tableField.depth ?? 0] = row;
            });
            return tableFieldRows;
        };

        const isLeafField = (field: DataTableFieldType): boolean => !field.children || field.children.length === 0;

        const getLeafFields = (fields: TableField[]): TableField[] => fields.filter((field) => !field.children?.length);

        const getTableFields = (fields: DataTableField[], allFields: DataTableFieldType[] = [], depth = 0): TableField[] => {
            fields.forEach((f) => {
                const field = getTableField(f);
                field.depth = depth;
                allFields.push(field);
                if (field.children?.length) getTableFields(field.children, allFields, depth + 1);
            });
            return allFields;
        };

        const proxyState = reactive({
            proxySelectIndex: useProxyValue<number[]>('selectIndex', props, emit),
            proxySortBy: useProxyValue<string>('sortBy', props, emit),
            proxySortDesc: useProxyValue<boolean|undefined>('sortDesc', props, emit),
        });

        const state = reactive({
            tbodyRef: null as HTMLElement|null,
            allState: false,
            allFields: computed<TableField[]>(() => getTableFields(props.fields)),
            tableFieldRows: computed<TableField[][]>(() => getTableFieldRows(state.allFields)),
            leafFields: computed<TableField[]>(() => getLeafFields(state.allFields)),
            numOfFieldRows: computed<number>(() => state.tableFieldRows.length),
            copyTargetElement: computed<HTMLCollection>(() => state.tbodyRef?.children || []),
            showLoading: true,
            showHeader: props.items && props.items.length > 0 && props.fields.length > 0,
            showNoData: computed(() => state.showHeader && (
                !props.items || !Array.isArray(props.items) || props.items.length === 0
            )),
            contextKey: Math.floor(Math.random() * Date.now()),
        });


        const getFieldRowspan = (field: DataTableFieldType, rowIndex): number => {
            if (isLeafField(field)) return state.numOfFieldRows - rowIndex;
            return 1;
        };


        const getFieldColspan = (field: DataTableFieldType, count = 0): number => {
            if (isLeafField(field)) return count + 1;
            let totalCount = 0;
            if (field.children) {
                field.children.forEach((child) => {
                    totalCount += getFieldColspan(child, count);
                });
            }
            return totalCount;
        };


        const getValue = (item, field: DataTableFieldType) => {
            if (typeof item === 'object') {
                return get(item, field.name);
            }
            return item;
        };

        const getDefaultSlotProps = () => ({
            fields: state.tableFieldRows[0] ?? [],
            fieldRows: state.tableFieldRows,
        });

        const getHeadSlotProps = (field, colIndex, rowIndex) => ({
            field, index: colIndex, sortable: props.sortable, colIndex, rowIndex,
        });

        const getColSlotProps = (item, field, colIndex, rowIndex) => ({
            item, index: rowIndex, field, value: getValue(item, field), colIndex, rowIndex,
        });

        const getSelectedState = (item, index) => {
            if (props.getRowSelectable) return props.getRowSelectable(item, index);
            return props.multiSelect ? proxyState.proxySelectIndex.some((d) => index === d) : proxyState.proxySelectIndex[0] === index;
        };

        const checkboxToggle = (item, index) => {
            const newSelected = [...proxyState.proxySelectIndex];
            if (getSelectedState(item, index)) {
                const idx = newSelected.indexOf(index);
                newSelected.splice(idx, 1);
                state.allState = false;
            } else {
                newSelected.push(index);
            }
            proxyState.proxySelectIndex = newSelected;
        };

        /* Event Handlers */
        const onRowLeftClick = (item, index, event) => {
            emit('rowLeftClick', item, index, event);
            if (!props.selectable) return;
            if (props.multiSelect) {
                if (props.rowClickMultiSelectMode) {
                    checkboxToggle(item, index);
                    return;
                }
                if (event.shiftKey) {
                    checkboxToggle(item, index);
                    return;
                }
            }
            proxyState.proxySelectIndex = [index];
        };

        const onTheadClick = (field) => {
            if (isFieldSortable(field.sortable)) {
                const clickedKey = field.sortKey || field.name;
                let sortBy = proxyState.proxySortBy;
                let sortDesc: undefined|boolean = proxyState.proxySortDesc;

                if (sortBy === clickedKey) {
                    // set reverse mode
                    sortDesc = !sortDesc;
                    // when clicked the other thead
                } else {
                    sortBy = clickedKey;
                    sortDesc = false;
                }
                // set changed values
                proxyState.proxySortBy = sortBy;
                proxyState.proxySortDesc = sortDesc;
                emit('changeSort', sortBy, sortDesc);
            }
        };

        const onSelectClick = (event) => {
            event.target.children[0].click();
        };
        const onSelectAllToggle = () => {
            if (state.allState) {
                proxyState.proxySelectIndex = range(props.items.length);
            } else {
                proxyState.proxySelectIndex = [];
            }
        };
        const onClickColCopy = (field: DataTableFieldType) => {
            let result = '';
            const arr: Element[] = Array.from(state.copyTargetElement);
            let idx = state.leafFields.findIndex((d) => d === field);
            if (idx === -1) return;

            if (props.selectable) idx += 1;
            arr.forEach((el) => {
                const children = Array.from(el.children) as HTMLElement[];
                children.forEach((td, colIdx) => {
                    if (colIdx === idx) {
                        if (result) result += `\n${td.innerText}`;
                        else result = td.innerText;
                    }
                });
            });
            copyAnyData(result);
        };

        const onChangeRadioSelect = (e) => {
            proxyState.proxySelectIndex = [e];
        };


        watch(() => proxyState.proxySelectIndex, (selectIndex) => {
            state.allState = !!(props.items
                && props.items.length
                && props.items.length === selectIndex.length);
        }, { immediate: true });

        watch(() => props.loading, (value) => {
            // if (typeof value !== 'boolean') {
            //     state.showHeader = true;
            //     state.showLoading = false;
            //     return;
            // }

            if (props.useCursorLoading && value) {
                document.body.style.cursor = 'progress';
            } else {
                document.body.style.cursor = 'default';
            }

            if (value) {
                state.showLoading = true;
            } else {
                if (!state.showHeader) {
                    state.showHeader = true;
                }
                state.showLoading = false;
            }
        }, { immediate: true });

        watch([() => props.items, () => props.fields], () => {
            state.contextKey = Math.floor(Math.random() * Date.now());
        });


        return {
            proxyState,
            ...toRefs(state),
            isFieldSortable,
            isLeafField,
            getFieldRowspan,
            getFieldColspan,
            getValue,
            getDefaultSlotProps,
            getHeadSlotProps,
            getColSlotProps,
            getSelectedState,
            onRowLeftClick,
            onTheadClick,
            onSelectClick,
            onSelectAllToggle,
            onClickColCopy,
            onChangeRadioSelect,
            DATA_TABLE_CELL_TEXT_ALIGN,
        };
    },
});
</script>

<style lang="postcss">

@define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color, $hover-color {
    /* th */
    th {
        background-color: $th-bg-color;
        height: 2rem;
    }
    &.bordered {
        td {
            border-bottom: 1px solid $border-color;
        }
    }
    tr {
        &.tr-selected {
            @apply text-secondary bg-blue-200;
        }
        &:not(.no-hover):hover {
            background-color: $hover-color;
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
    @apply h-full w-full relative overflow-auto;
    min-height: 12rem;
    .table-container {
        @apply overflow-auto h-full w-full;
    }
    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;
    }
    thead {
        tr {
            position: sticky;
            top: 0;
            z-index: 1;
        }
    }
    th {
        vertical-align: bottom;
        line-height: 1.25rem;
        font-size: 0.875rem;
        text-align: left;
        letter-spacing: 0;
        white-space: nowrap;
        border-top: 1px solid black;
        border-bottom: 1px solid black;
        .th-contents {
            @apply flex justify-between pl-4;
            line-height: 2;
            .th-text {
                display: inline-flex;
                align-content: center;
                .p-copy-button {
                    @apply inline-block text-center;
                    width: 1.5rem;
                }
            }
            &.right {
                justify-content: flex-end;
                padding-right: 1rem;
            }
            &.center {
                justify-content: center;
                padding-right: 1rem;
            }
            &.has-icon {
                padding-right: 0;
            }
        }
        .sort-icon {
            @apply text-gray-500 float-right my-px;
            &:hover { cursor: pointer; }
        }
        &.fix-width {
            @apply min-w-19;
        }
        &:last-child {
            .th-contents:not(.has-icon) {
                padding-right: 1rem;
            }
        }
        &.all-select {
            @apply py-1 pl-4;
            width: 2.5rem;
            min-width: 2.5rem;
            max-width: 2.5rem;
        }
    }
    td {
        @apply h-10 px-4 z-0 align-middle min-w-28 text-sm;
        &.has-width {
            word-break: break-word;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        &.right {
            @apply text-right;
        }
        &.center {
            @apply text-center;
        }
        i, span, div, input, textarea, article, main, ul, li {
            vertical-align: baseline;
        }
    }
    tr {
        &.row-height-fixed {
            td:not(.has-width) {
                overflow-x: hidden;
                white-space: nowrap;
            }
        }
        &.row-cursor-pointer {
            cursor: pointer;
        }
    }

    .select-checkbox {
        @apply cursor-pointer min-w-4 w-4;
    }

    .no-data {
        @apply absolute justify-center items-center flex w-full text-gray-300 text-center;
        line-height: 120%;
        font-size: 1rem;
        height: calc(100% - 2rem);
        max-height: 16.875rem;
        top: 2rem;
    }

    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: white;
        opacity: 0.5;
        top: 0;
        z-index: 1;
    }

    .loading {
        @apply absolute flex w-full h-full justify-center items-center;
        top: 0;
        max-height: 16.875rem;
        z-index: 1;
    }

    .invalid-cover {
        @apply absolute w-full h-full overflow-hidden border border-alert rounded-lg;
        pointer-events: none;
        top: 0;
        z-index: 1;
    }

    .fake-row {
        @apply opacity-0;
    }

    /* transitions */
    .fade-in-enter-active {
        transition: opacity 0.2s;
    }
    .fade-in-leave-active {
        transition: opacity 0.2s;
    }
    .fade-in-enter, .fade-in-leave-to {
        opacity: 0;
    }
    .fade-in-leave, .fade-in-enter-to {
        opacity: 0.5;
    }

    /* themes */
    &.default {
        @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
    }

    &.light {
        @mixin table-theme theme('colors.white'), theme('colors.primary4'), theme('colors.gray.300'), theme('colors.blue.100');
        th {
            @apply border-gray-200;
            border-bottom: 1px solid;
        }
    }

    &.primary4 {
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

    &.simple {
        min-height: 10.75rem;

        @mixin table-theme theme('colors.white'), transparent, theme('colors.gray.200'), transparent;
        th {
            @apply border-transparent text-gray-600 font-normal;
            height: 1.75rem;
            font-size: 0.75rem;
        }
        &.bordered {
            td {
                height: 2.25rem;
            }
            tr:last-of-type {
                td {
                    @apply border-white;
                }
            }
        }
    }
}

</style>
