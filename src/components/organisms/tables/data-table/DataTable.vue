<template>
    <p-table
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
    >
        <template #caption>
            <slot name="caption" />
        </template>
        <template #head>
            <slot
                name="head"
                :fields="fieldsData"
            >
                <p-tr>
                    <p-th v-if="selectable" style="width: 16px;">
                        <PCheckBox v-model="allState" @change="selectAllToggle" />
                    </p-th>
                    <p-th
                        v-for="(field,index) in fieldsData"
                        :key="index"
                        :style="{ width: getColWidth(field.size), 'text-align' : getAligning(field.align)}"
                        :class="{'fix-width': colCopy}"
                        @click="theadClick(field,index,$event)"
                        @mouseenter="thHoverIndex=index"
                        @mouseleave="thHoverIndex=null"
                    >
                        <span class="th-contents">
                            <span :style="{visibility: isThOver(index) ? 'hidden' : 'visible'}">
                                {{ field.label ? field.label : field.name }}
                            </span>
                            <p-copy-button v-if="isThOver(index)"
                                           class="copy-btn"
                                           :value="clickColCopy(index)"
                            />
                            <template v-if="sortable&&field.sortable">
                                <p-i
                                    v-if="sortable&&field.name==sortBy"
                                    :name="sortIcon"
                                    class="sort-icon"
                                />
                                <p-i
                                    v-else
                                    name="ic_table_sort"
                                    class="sort-icon"
                                />
                            </template>
                        </span>
                    </p-th>
                </p-tr>
            </slot>
        </template>
        <template #body>
            <p-tr v-if="loading&&useSpinnerLoading" class="no-data-row">
                <p-td class="no-data" :colspan="selectable? fieldsData.length +1 :fieldsData.length">
                    <p-lottie name="spinner" :size="2"
                              :auto="true"
                    />
                </p-td>
            </p-tr>
            <p-tr v-if="showNoData" class="no-data-row">
                <p-td class="no-data" :colspan="selectable? fieldsData.length +1 :fieldsData.length">
                    No Data
                </p-td>
            </p-tr>
            <slot
                name="body"
                :items="items"
            >
                <template v-for="(item,index) in items">
                    <slot
                        name="row"
                        :fields="fieldsName"
                        :item="item"
                        :index="index"
                    >
                        <p-tr
                            :key="index"
                            :data-index="index"
                            :class="{'tr-selected': isSelected(index)} "
                            v-bind="item.hasOwnProperty('vbind') ? item.vbind : null"
                            onselectstart="return false"
                            @click.left="rowLeftClick( item, index, $event )"
                            @click.right="rowRightClick( item, index, $event )"
                            @click.middle="rowMiddleClick( item, index, $event )"
                            @mouseover="rowMouseOver(item,index, $event)"
                            @mouseout="rowMouseOut(item,index, $event)"
                        >
                            <p-td v-if="selectable"
                                  class="select-checkbox"
                                  @click.stop.prevent="selectClick"
                                  @mouseenter="hoverIndex=index"
                                  @mouseleave="hoverIndex=null"
                            >
                                <PCheckBox v-model="proxySelectIndex" :value="index" :hovered="hoverIndex===index" />
                            </p-td>
                            <template v-for="field in fieldsName">
                                <slot
                                    :name="'col-'+field"
                                    :item="item"
                                    :value="item[field]"
                                    :index="index"
                                    :field="field"
                                >
                                    <p-td onselectstart="return true" style="user-select: all">
                                        <slot
                                            :name="'col-'+field+'-format'"
                                            :item="item"
                                            :value="item[field]"
                                            :index="index"
                                            :field="field"
                                        >
                                            {{ item[field] }}
                                        </slot>
                                    </p-td>
                                </slot>
                            </template>
                        </p-tr>
                    </slot>
                </template>
            </slot>
        </template>
        <template #foot>
            <slot name="foot" />
        </template>
    </p-table>
</template>

<script>
import DragSelect from 'dragselect';
import PTable from '@/components/molecules/tables/Table';
import PTr from '@/components/atoms/table/Tr';
import PTd from '@/components/atoms/table/Td';
import PTh from '@/components/atoms/table/Th';
import PI from '@/components/atoms/icons/PI';
import PLottie from '@/components/molecules/lottie/PLottie';
import { selectToCopyToClipboard } from '@/lib/util';

const PCheckBox = () => import('@/components/molecules/forms/CheckBox');
const PCopyButton = () => import('@/components/molecules/buttons/CopyButton');

export default {
    name: 'PDataTable',
    components: {
        PTable, PTd, PTh, PTr, PI, PCheckBox, PCopyButton, PLottie,
    },
    events: [
        'rowLeftClick', 'rowMiddleClick', 'rowMouseOver', 'rowMouseOut',
        'changeSort', 'theadClick',
    ],
    mixins: [PTable],
    props: {
        fields: Array,
        items: Array,
        sortable: {
            type: Boolean,
            default: false,
        },
        dragable: {
            type: Boolean,
            default: false,
        },
        rowClickMultiSelectMode: {
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
        useSpinnerLoading: {
            type: Boolean,
            default: false,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            allState: false,
            hoverIndex: null,
            dragSelect: null,
            thHoverIndex: null,
        };
    },
    computed: {
        proxySelectIndex: {
            get() {
                return this.selectIndex;
            },
            set(value) {
                return this.$emit('update:selectIndex', value);
            },
        },
        fieldsData() {
            const data = [];
            this.fields.forEach((value) => {
                if (typeof value === 'string') {
                    data.push({ name: value, label: value, sortable: true });
                } else {
                    data.push({
                        sortable: true,
                        ...value,
                    });
                }
            });
            return data;
        },
        fieldsName() {
            const data = [];
            this.fieldsData.forEach((field) => {
                data.push(field.name);
            });
            return data;
        },
        sortIcon() {
            if (this.sortDesc) {
                return 'ic_table_sort_fromZ';
            }
            return 'ic_table_sort_fromA';
        },
        selectArea() {
            return this.$el;
        },
        dragSelectAbles() {
            return this.selectArea.children[0].children[1].children;
        },
        showNoData() {
            if (this.items.length === 0) {
                if (this.useSpinnerLoading && this.loading) {
                    return false;
                }
                return true;
            }
            return false;
        },
    },
    watch: {
        items() {
            if (this.selectable && this.dragable && this.$options.name === 'PDataTable' && this.items) {
                this.$nextTick(() => {
                    this.dragSelect.setSelectables(this.dragSelectAbles);
                });
            }
        },
        loading() {
            if (this.useCursorLoading) {
                if (this.loading) {
                    document.body.style.cursor = 'progress';
                } else {
                    document.body.style.cursor = 'default';
                }
            }
        },
    },
    mounted() {
        if (this.$options.name === 'PDataTable') {
            if (this.selectable && this.dragable) {
                // todo: fix when chnage comosition api
                this.dragSelect = new DragSelect({
                    selectables: this.dragSelectAbles,
                    area: this.selectArea,
                    callback: this.dragSelectItems,
                });
            }
            if (this.selectable) {
                window.addEventListener('keydown', this.copy);
            }
            if (this.loading) {
                document.body.style.cursor = 'progress';
            }
        }
    },
    destroyed() {
        // todo: fix when chnage comosition api
        if (this.$options.name === 'PDataTable' && this.selectable) {
            window.removeEventListener('keydown', this.copy);
        }
    },
    methods: {
        getAligning(align){
            return this.isEmpty(align) ? 'left' : align;
        },
        getColWidth(size) {
            return this.isEmpty(size) ? 'auto' : size;
        },
        makeTableText(el) {
            let result = '';
            const startIdx = this.selectable ? 1 : 0;
            const tds = el.children;
            for (let idx = startIdx; idx < el.childElementCount; idx++) {
                result += `${tds[idx].innerText}\t`;
            }
            return `${result}\n`;
        },
        copy(event) {
            if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && this.selectIndex.length > 0) {
                let result = '';
                this.selectIndex.forEach((td) => {
                    result += this.makeTableText(this.dragSelectAbles[td]);
                });
                selectToCopyToClipboard(result);
            }
        },
        dragSelectItems(items) {
            const select = [];
            if (items.length > 1) {
                items.forEach((item) => {
                    select.push(Number(item.attributes['data-index'].value));
                });
                this.proxySelectIndex = select;
            }
        },
        rowLeftClick(item, index, event) {
            this.$emit('rowLeftClick', item, index, event);
            if (this.selectable) {
                if (this.rowClickMultiSelectMode) {
                    this.checkboxToggle(index);
                } else if (event.shiftKey) {
                    this.proxySelectIndex = [...this.proxySelectIndex, index];
                } else {
                    this.proxySelectIndex = [index];
                }
            }
        },
        rowRightClick(item, index, event) {
            this.$emit('rowRightClick', item, index, event);
        },
        rowMiddleClick(item, index, event) {
            this.$emit('rowMiddleClick', item, index, event);
        },
        rowMouseOver(item, index, event) {
            this.$emit('rowMouseOver', item, index, event);
        },
        rowMouseOut(item, index, event) {
            this.$emit('rowMouseOut', item, index, event);
        },

        theadClick(field, index, event) {
            if (this.sortable && field.sortable) {
                if (this.sortBy !== field.name) {
                    this.$emit('update:sortBy', field.name);
                    if (!this.sortDesc) {
                        this.$emit('update:sortDesc', true);
                    }
                } else {
                    if (!this.sortDesc) {
                        this.$emit('update:sortBy', '');
                    }
                    this.$emit('update:sortDesc', !this.sortDesc);
                }
                this.$emit('changeSort');
            }
            this.$emit('theadClick', field, index, event);
        },

        isSelected(index) {
            return this.proxySelectIndex.indexOf(index) !== -1;
        },
        checkboxToggle(index) {
            const newSelected = [...this.proxySelectIndex];
            if (this.isSelected(index)) {
                const idx = newSelected.indexOf(index);
                newSelected.splice(idx, 1);
                this.allState = false;
            } else {
                newSelected.push(index);
            }
            this.proxySelectIndex = newSelected;
        },
        selectClick(event) {
            event.target.children[0].click();
        },
        selectAllToggle() {
            if (this.allState) {
                this.proxySelectIndex = Array.from(new Array(this.items.length).keys());
            } else {
                this.proxySelectIndex = [];
            }
        },
        getSelectItem(sortable) {
            const selectedIndex = this.isEmpty(sortable) ? this.proxySelectIndex : this.proxySelectIndex.sort((a, b) => a - b);
            const selectItem = [];
            console.log(selectedIndex);
            this.selectedIndex.forEach((index) => {
                selectItem.push(this.items[index]);
            });
            return selectItem;
        },
        isThOver(index) {
            return this.colCopy && this.thHoverIndex === index;
        },
        clickColCopy(idx) {
            let result = '';
            const arr = Array.from(this.dragSelectAbles);
            arr.forEach((el) => {
                const children = Array.from(el.children);
                children.forEach((td, colIdx) => {
                    if (colIdx === idx) {
                        result += `${td.innerText}\t`;
                    }
                });
            });
            return result;
        },
    },
};

</script>

<style lang="scss" scoped>

    %selected-row {
        background-color: $primary3 !important;
        td {
            color: $secondary;
        }
    }
    .select-checkbox{
        cursor:pointer;
    }
    tbody{
        display: block;
        tr{
            &.tr-selected {
                @extend %selected-row;
            }
            td{
                vertical-align: middle;
            }
        }
    }
    thead{
        tr{
            th{
                vertical-align: middle;
                white-space:nowrap;
                .th-contents {
                    display: flex;
                    justify-content: space-between;
                }
                .sort-icon{
                    float: right;
                    color: $gray2;
                }
                &.fix-width {
                    min-width: 4.75rem;
                }
            }
        }
    }
    .fade-enter {
        opacity: 0;
    }
    .fade-enter-active {
        transition: opacity 0s;
    }
    .copy-btn::v-deep {
        position: absolute !important;
        .p-copy-btn {
            left: 0;
        }
    }
    .no-data-row{
        &:hover{
            background-color: initial !important;
        }
        .no-data{
            text-align: center;
            padding-top: 2rem;
            padding-bottom: 2rem;
            color: $primary2;
            font: 24px/32px Arial;
        }
    }

</style>
