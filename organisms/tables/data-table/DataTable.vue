<template>
    <p-table
        :table-style-type="tableStyleType"
        :thead-style-type="theadStyleType"
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
                        <input
                            v-model="allState"
                            type="checkbox"
                            :true-value="true"
                            :false-value="false"
                            @change.stop="selectAllToggle"
                        >
                    </p-th>
                    <p-th
                        v-for="(field,index) in fieldsData"
                        :key="index"
                        @click="theadClick(field,index,$event)"
                    >
                        {{ field.name }}
                        <template v-if="sortable">
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
                            <p-td v-if="selectable">
                                <input
                                    v-model="selectIndex"
                                    type="checkbox"
                                    :value="index"
                                    @change.stop
                                >
                            </p-td>
                            <template v-for="field in fieldsName">
                                <slot
                                    :name="'col-'+field"
                                    :item="item"
                                    :value="item[field]"
                                    :index="index"
                                    :field="field"
                                >
                                    <p-td>{{ item[field] }}</p-td>
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

export default {
    name: 'PDataTable',
    components: {
        PTable, PTd, PTh, PTr, FI,
    },
    mixins: [PTable],
    props: {
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
        };
    },
    computed: {
        fieldsData() {
            const data = [];
            this.fields.forEach((value) => {
                if (typeof value === 'string') {
                    data.push({ name: value });
                } else {
                    data.push(value);
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
                this.checkboxToggle(index);
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
            if (this.sortBy !== field.name) {
                this.$emit('update:sortBy', field.name);
                if (!this.sortDesc) {
                    this.$emit('update:sortDesc', true);
                }
            } else {
                this.$emit('update:sortDesc', !this.sortDesc);
            }
            this.$emit('theadClick', field, index, event);
        },

        isSelected(index) {
            return this.selectIndex.indexOf(index) !== -1;
        },
        checkboxToggle(index) {
            const newSelected = [...this.selectIndex];
            if (this.isSelected(index)) {
                const idx = newSelected.indexOf(index);
                newSelected.splice(idx, 1);
                this.allState = false;
            } else {
                newSelected.push(index);
            }
            this.$emit('update:selectIndex', newSelected);
        },
        selectAllToggle() {
            if (this.allState) {
                this.$emit('update:selectIndex', Array.from(new Array(this.items.length).keys()));
            } else {
                this.$emit('update:selectIndex', []);
            }
        },
        getSelectItem() {
            const selectItem = [];
            this.selectIndex.forEach((index) => {
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
