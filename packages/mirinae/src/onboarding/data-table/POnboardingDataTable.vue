<script lang="ts">
import type { PropType } from 'vue';
import {
    toRefs,
    computed,
    reactive,
    watch,
    defineComponent,
} from 'vue';

import { get, range } from 'lodash';

import { useProxyValue } from '@/hooks';
import { DATA_TABLE_STYLE_TYPE, DATA_TABLE_TYPE } from '@/onboarding/data-table/config';
import type {
    DataTableFieldType, DataTableProps,
} from '@/onboarding/data-table/type';
import { copyAnyData } from '@/utils/helpers';

const PSpinner = () => import('@/feedbacks/loading/spinner/PSpinner.vue');
const PCheckbox = () => import('@/controls/checkbox/PCheckbox.vue');
const PRadio = () => import('@/controls/radio/PRadio.vue');
const PCopyButton = () => import('@/controls/buttons/copy-button/PCopyButton.vue');
const PI = () => import('@/foundation/icons/PI.vue');

export default defineComponent<DataTableProps, any>({
    name: 'POnboardingDataTable',
    components: {
        PSpinner, PCheckbox, PRadio, PCopyButton, PI,
    },
    props: {
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array as PropType<DataTableFieldType[]>,
            required: true,
            default: () => [],
        },
        items: {
            type: Array,
            default: () => [],
        },
        stripe: {
            type: Boolean,
            default: false,
        },
        border: {
            type: Boolean,
            default: true,
        },
        styleType: {
            type: String,
            default: 'default',
            validator(value: any) {
                return Object.values(DATA_TABLE_STYLE_TYPE).includes(value);
            },
        },
        showFooter: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        multiSelectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: Array,
            default: () => [],
        },
        getRowSelectable: {
            type: Function,
            default: undefined,
        },
        type: {
            type: String,
            default: 'default',
            validator(value: any) {
                return Object.values(DATA_TABLE_TYPE).includes(value);
            },
        },
        columnCopyButton: {
            type: Boolean,
            default: false,
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
        headerLeftSlot: {
            type: Boolean,
            default: false,
        },
        headerRightSlot: {
            type: Boolean,
            default: false,
        },
        columnLeftSlot: {
            type: Boolean,
            default: false,
        },
        columnRightSlot: {
            type: Boolean,
            default: false,
        },
        disableHover: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const proxyState = reactive({
            proxySelectIndex: useProxyValue<number[]>('selectIndex', props, emit),
            proxySortBy: useProxyValue<string>('sortBy', props, emit),
            proxySortDesc: useProxyValue<boolean | undefined>('sortDesc', props, emit),
        });

        const state = reactive({
            showLoading: props.loading,
            allFields: props.fields,
            showHeader: props.items && props.items.length > 0 && props.fields.length > 0,
            showNoData: computed(
                () => state.showHeader
                    && (!props.items
                        || !Array.isArray(props.items)
                        || props.items.length === 0),
            ),
            allState: false,
            selectable: false,
            multiSelectable: false,
            tbodyRef: null as HTMLElement | null,
            copyTargetElement: computed<HTMLCollection>(
                () => state.tbodyRef?.children || [],
            ),
        });

        const getValue = (item, field: DataTableFieldType) => {
            if (typeof item === 'object') {
                return get(item, field.name);
            }
            return item;
        };

        const getTfSlotProps = (field, colIndex) => {
            const values = props.items.map((item) => getValue(item, field));
            return {
                field,
                colIndex,
                values,
            };
        };

        const onSelectAllToggle = () => {
            if (state.allState) {
                proxyState.proxySelectIndex = range(props.items.length);
            } else {
                proxyState.proxySelectIndex = [];
            }
        };

        const onChangeRadioSelect = (e) => {
            proxyState.proxySelectIndex = [e];
        };

        const getSelectedState = (item, index) => (state.multiSelectable
            ? proxyState.proxySelectIndex.some((d) => index === d)
            : proxyState.proxySelectIndex[0] === index);

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

        const onRowClick = (item, index, event) => {
            const disabled = props.getRowSelectable
                ? props.getRowSelectable(item, index)
                : false;
            if (disabled) return;
            emit('rowLeftClick', item, index, event);
            if (!state.selectable) return;
            if (state.multiSelectable) {
                checkboxToggle(item, index);
                return;
            }
            proxyState.proxySelectIndex = [index];
        };

        const getColSlotProps = (item, field, colIndex, rowIndex) => ({
            item,
            index: rowIndex,
            field,
            value: getValue(item, field),
            colIndex,
            rowIndex,
        });

        const onClickColCopy = (field: DataTableFieldType) => {
            let result = '';
            let columnIndex = state.allFields.findIndex((d) => d === field);
            if (columnIndex === -1) return;
            if (props.type === DATA_TABLE_TYPE.checkbox || props.type === DATA_TABLE_TYPE.radio) columnIndex += 1;
            const rows = Array.from(state.copyTargetElement) as Element[];
            const columnValues = rows.map((row) => {
                const cells = Array.from(row.children) as HTMLElement[];
                return cells[columnIndex]?.innerText || '';
            });
            result = columnValues.join(',');
            copyAnyData(result);
        };


        const onClickSort = (field: DataTableFieldType) => {
            if (field.sortable) {
                const clickedKey = field.name;
                let sortBy = proxyState.proxySortBy;
                let sortDesc: undefined | boolean = proxyState.proxySortDesc;
                sortBy = clickedKey;
                sortDesc = !sortDesc;
                proxyState.proxySortBy = sortBy;
                proxyState.proxySortDesc = sortDesc;
                emit('changeSort', sortBy, sortDesc);
            }
        };

        watch(
            () => proxyState.proxySelectIndex,
            (selectIndex) => {
                state.allState = !!(
                    props.items
                    && props.items.length
                    && props.items.length === selectIndex.length
                );
            },
            { immediate: true },
        );

        watch(
            () => props.loading,
            (value) => {
                if (value) {
                    state.showLoading = true;
                } else {
                    if (!state.showHeader) {
                        state.showHeader = true;
                    }
                    state.showLoading = false;
                }
            },
            { immediate: true },
        );

        watch(
            () => props.type,
            (value) => {
                if (value === DATA_TABLE_TYPE.checkbox) {
                    state.selectable = true;
                    state.multiSelectable = true;
                } else if (value === DATA_TABLE_TYPE.radio) {
                    state.selectable = true;
                    state.multiSelectable = false;
                } else {
                    state.selectable = false;
                }
            },
            { immediate: true },
        );

        return {
            proxyState,
            ...toRefs(state),
            getValue,
            getTfSlotProps,
            onSelectAllToggle,
            onChangeRadioSelect,
            getSelectedState,
            onRowClick,
            DATA_TABLE_TYPE,
            getColSlotProps,
            onClickColCopy,
            onClickSort,
        };
    },

});
</script>
<template>
    <div class="p-onboarding-table"
         :class="{
             stripe: stripe,
             bordered: border,
             [styleType]: true,
         }"
    >
        <div class="table-container">
            <table>
                <thead>
                    <template v-if="showHeader">
                        <tr>
                            <th v-if="selectable"
                                class="all-select"
                            >
                                <p-checkbox v-if="multiSelectable"
                                            v-model="allState"
                                            @change="onSelectAllToggle"
                                />
                            </th>
                            <th v-for="(fieldCol, fieldColId) in allFields"
                                :key="`th-${fieldColId}`"
                                @click="onClickSort(fieldCol)"
                            >
                                <span class="th-contents"
                                      :class="{
                                          [fieldCol.textAlign]: fieldCol.textAlign,
                                      }"
                                >
                                    <span class="th-text">
                                        <slot v-if="headerLeftSlot"
                                              :name="`header-left-${fieldCol.name}-col`"
                                        />
                                        {{ fieldCol.label ? fieldCol.label : fieldCol.name }}
                                        <p-copy-button v-if="columnCopyButton
                                                       "
                                                       copy-manually
                                                       @copy="onClickColCopy(fieldCol)"
                                        />
                                        <slot v-if="headerRightSlot"
                                              :name="`header-right-${fieldCol.name}-col`"
                                        />
                                    </span>
                                    <template v-if="sortable && fieldCol.sortable">
                                        <p-i
                                            v-if="sortable && fieldCol.name === sortBy"
                                            :name="
                                                proxyState.proxySortDesc
                                                    ? 'ic_caret-up-filled'
                                                    : 'ic_caret-down-filled'
                                            "
                                            class="sort-icon"
                                        />
                                        <p-i
                                            v-else
                                            name="ic_caret-down"
                                            class="sort-icon"
                                        />
                                    </template>
                                </span>
                            </th>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <th :colspan="selectable ? fields.length + 1 : fields.length
                            "
                            />
                        </tr>
                    </template>
                </thead>
                <tbody ref="tbodyRef">
                    <template v-if="showNoData">
                        <div class="no-data">
                            <slot name="no-data-format">
                                {{ $t("COMPONENT.DATA_TABLE.NO_DATA") }}
                            </slot>
                        </div>
                        <tr :colspan="selectable ? fields.length + 1 : fields.length"
                            class="fake-row"
                        />
                    </template>
                    <slot name="body">
                        <tr v-for="(item, rowIndex) in items"
                            :key="`tr-${rowIndex}`"
                            :data-index="rowIndex"
                            :class="{
                                'tr-selected': getSelectedState(item, rowIndex),
                                'no-hover': disableHover,
                                'row-cursor-pointer': (type === DATA_TABLE_TYPE.checkbox || type === DATA_TABLE_TYPE.radio) && getRowSelectable ? !getRowSelectable(item, rowIndex) : false,
                                'row-disabled': getRowSelectable ? getRowSelectable(item, rowIndex) : false,
                            }"
                            @click="onRowClick(item, rowIndex, $event)"
                        >
                            <td v-if="selectable"
                                class="select-checkbox"
                            >
                                <p-checkbox v-if="multiSelectable"
                                            :value="rowIndex"
                                            :selected="proxyState.proxySelectIndex"
                                            :disabled="getRowSelectable ? getRowSelectable(item, rowIndex) : false
                                            "
                                            @change="proxyState.proxySelectIndex = $event"
                                />
                                <p-radio v-else
                                         :selected="proxyState.proxySelectIndex[0]"
                                         :disabled="getRowSelectable ? getRowSelectable(item, rowIndex) : false
                                         "
                                         :value="rowIndex"
                                         @change="onChangeRadioSelect"
                                />
                            </td>
                            <td v-for="(field, colIndex) in fields"
                                :key="`td-${rowIndex}-${colIndex}`"
                                :class="{
                                    [field.textAlign]: field.textAlign,
                                }"
                            >
                                <slot v-if="columnLeftSlot"
                                      :name="`column-left-${field.name}`"
                                />
                                <slot :name="`col-${field.name}-format`"
                                      v-bind="getColSlotProps(item, field, colIndex, rowIndex)"
                                >
                                    {{ getValue(item, field) }}
                                </slot>
                                <slot v-if="columnRightSlot"
                                      :name="`column-right-${field.name}`"
                                />
                            </td>
                        </tr>
                    </slot>
                </tbody>
                <tfoot v-if="!showNoData && showFooter">
                    <tr>
                        <slot name="footer">
                            <td v-if="type === DATA_TABLE_TYPE.checkbox || type === DATA_TABLE_TYPE.radio" />
                            <td v-for="(field, colIndex) in fields"
                                :key="`td-footer-${colIndex}`"
                            >
                                <slot name="tf-col-format"
                                      v-bind="getTfSlotProps(field, colIndex)"
                                />
                            </td>
                        </slot>
                    </tr>
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
    </div>
</template>
<style lang="postcss">
@define-mixin table-theme $th-bg-color, $stripe-bg-color, $border-color,
    $hover-color {
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
            @apply bg-blue-200;
        }

        &:not(.no-hover):hover {
            background-color: $hover-color;
        }

        &.row-cursor-pointer {
            cursor: pointer;
        }

        &.row-disabled {
            cursor: not-allowed;
            background-color: red;
        }
    }

    &.stripe {
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

.p-onboarding-table {
    @apply h-full w-full relative overflow-auto;

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
                    @apply ml-2;
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
        }
        .sort-icon {
            @apply text-gray-500 float-right my-px;
            &:hover {
                cursor: pointer;
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

        &.right {
            @apply text-right;
        }

        &.center {
            @apply text-center;
        }
    }

    .select-checkbox {
        @apply cursor-pointer min-w-4 w-4;
    }

    .loading-backdrop {
        @apply absolute w-full h-full overflow-hidden;
        background-color: white;
        opacity: 0.5;
        top: 0;
        z-index: 1;
    }

    .loading {
        @apply absolute flex w-full justify-center items-center;
        background-color: white;
        height: -webkit-fill-available;
        top: 2rem;
        z-index: 1;
    }

    .no-data {
        @apply absolute justify-center items-center flex w-full text-gray-300 text-center;
        line-height: 120%;
        font-size: 14px;
        font-weight: 400;
        height: calc(100% - 2rem);
        max-height: 16.875rem;
        top: 2rem;
    }

    .fake-row {
        @apply opacity-0;
    }

    &.default {
        @mixin table-theme theme("colors.white"), theme("colors.primary4"),
            theme("colors.gray.300"), theme("colors.blue.100");
    }

    &.light {
        @mixin table-theme theme("colors.white"), transparent, theme("colors.white"),
            transparent;
        th {
            @apply bg-primary4;
        }

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

        @mixin table-theme theme("colors.white"), transparent,
            theme("colors.gray.200"), transparent;

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
