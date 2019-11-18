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
                        <PCheckBox v-model="allState" @change="selectAllToggle" />
                    </p-th>
                    <p-th
                        v-for="(field,index) in fieldsData"
                        :key="index"
                        @click="theadClick(field,index,$event)"
                    >
                        {{ field.label ? field.label : field.name }}
                        <template v-if="sortable&&field.sortable">
                            <f-i
                                v-if="sortable&&field.name==sortBy"
                                icon-style="solid"
                                :icon="sortIcon"
                                class="sort-icon"
                            />
                            <f-i
                                v-else
                                icon-style="solid"
                                icon="fa-sort"
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
                            :class="{'tr-selected': isSelected(index)} "
                            v-bind="item.hasOwnProperty('vbind') ? item.vbind : null"
                            @click.left="rowLeftClick( item, index, $event )"
                            @click.right="rowRightClick( item, index, $event )"
                            @click.middle="rowMiddleClick( item, index, $event )"
                            @mouseover="rowMouseOver(item,index, $event)"
                            @mouseout="rowMouseOut(item,index, $event)"
                        >
                            <p-td v-if="selectable"
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
                                    <p-td>
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
import PTable from '@/components/molecules/tables/Table';
import PTr from '@/components/atoms/table/Tr';
import PTd from '@/components/atoms/table/Td';
import PTh from '@/components/atoms/table/Th';
import FI from '@/components/atoms/icons/FI';
import PCheckBox from '@/components/molecules/forms/CheckBox';

export default {
    name: 'PDataTable',
    components: {
        PTable, PTd, PTh, PTr, FI, PCheckBox,
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
                return 'fa-sort-down';
            }
            return 'fa-sort-up';
        },
    },
    methods: {
        rowLeftClick(item, index, event) {
            this.$emit('rowLeftClick', item, index, event);
            if (this.selectable) {
                if (this.rowClickMultiSelectMode) {
                    this.checkboxToggle(index);
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
        getSelectItem() {
            const selectItem = [];
            this.proxySelectIndex.forEach((index) => {
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
                .sort-icon{
                    float: right;
                    color: $gray2;
                }
            }
        }
    }

</style>
