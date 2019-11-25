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
                    <p-th v-if="selectable">
                        <PCheckBox v-model="allState" style="margin: 0 1rem" @change="selectAllToggle" />
                    </p-th>
                    <p-th
                        v-for="(field,index) in fieldsData"
                        :key="index"
                        @click="theadClick(field,index,$event)"
                    >
                        <div style="vertical-align: middle !important;display: inline;">
                            {{ field.label ? field.label : field.name }}
                        </div>
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
                    </p-th>
                </p-tr>
            </slot>
        </template>
        <template #body>
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
import PCheckBox from '@/components/molecules/forms/CheckBox';

export default {
    name: 'PDataTable',
    components: {
        PTable, PTd, PTh, PTr, PI, PCheckBox,
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
    },
    data() {
        return {
            allState: false,
            hoverIndex: null,
            dragSelect: null,
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
    },
    watch: {
        items() {
            if (this.selectable && this.dragable && this.$options.name === 'PDataTable' && this.items) {
                this.$nextTick(() => {
                    this.dragSelect.setSelectables(this.dragSelectAbles);
                });
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
                    callback: this.dragSelectItmes,
                });
            }
            if (this.selectable) {
                window.addEventListener('keydown', this.copy);
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
        makeTableText(el) {
            let result = '';
            el.children.forEach((td, idx) => {
                if (this.selectable && idx === 0) { return; }
                result += `${td.innerText}\t`;
            });
            return `${result}\n`;
        },
        copy(event) {
            if (event.code === 'KeyC' && (event.ctrlKey || event.metaKey) && this.selectIndex.length > 0) {
                let result = '';
                this.selectIndex.forEach((td) => {
                    result += this.makeTableText(this.dragSelectAbles[td]);
                });
                this.selectToCopyToClipboard(result);
            }
        },
        dragSelectItmes(items, event) {
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
    },
};

</script>

<style lang="scss" scoped>

    %selected-row {
        background-color: $secondary2;
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
                white-space:nowrap;
                .sort-icon{
                    float: right;
                    color: $gray2;
                }
            }
        }
    }

</style>
