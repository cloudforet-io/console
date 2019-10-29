<template>
    <p-table
        :tableStyleType="tableStyleType"
        :theadStyleType="theadStyleType"
        :striped="striped"
        :bord="bord"
        :hover="hover"
        :small="small"
        :background="background"
        :responsive="responsive"
    >
        <template #caption>
            <slot name="caption"></slot>
        </template>
        <template #head>
            <slot name="head" :fields="fieldsData">
                <p-tr>
                    <p-th v-if="selectable"><input type="checkbox" v-model="allState" :true-value="true" :false-value="false" @change.stop="selectAllToggle"></p-th>
                    <p-th v-for="(field,index) in fieldsData" :key="index" @click.native="theadClick(field,index,$event)">
                        {{field.name}}
                        <template v-if="sortable">
                            <f-i v-if="sortable&&field.name==sortBy" iconStyle="duotone" :icon="sortIcon" ></f-i>
                            <f-i v-else iconStyle="light" icon="fa-sort" ></f-i>
                        </template>

                    </p-th>
                </p-tr>
            </slot>
        </template>
        <template #body>
            <slot name="body" :items="items">
                <template v-for="(item,index) in items">
                    <slot name="row" :fields="fieldsName" :item="item" :index="index">
                        <p-tr
                            @click.left.native="rowLeftClick( item, index, $event )"
                            @click.right.native="rowRightClick( item, index, $event )"
                            @click.middle.native="rowMiddleClick( item, index, $event )"
                            @mouseover.native="rowMouseOver(item,index, $event)"
                            @mouseout.native="rowMouseOut(item,index, $event)"
                            v-bind="item.hasOwnProperty('vbind') ? item.vbind : null"
                            :key="index">
                            <p-td v-if="selectable"><input type="checkbox" v-model="selectIndex" :value="index" @change.stop></p-td>
                            <template v-for="field in fieldsName">
                                <slot :name="'col-'+field" :item="item" :value="item[field]" :index="index" :field="field">
                                    <p-td >{{item[field]}}</p-td>
                                </slot>
                            </template>
                        </p-tr>
                    </slot>
                </template>
            </slot>
        </template>
        <template #foot>
            <slot name="foot"></slot>
        </template>
    </p-table>
</template>

<script>
import PTable from '@/components/molecules/tables/Table.vue';
import PTr from '@/components/atoms/table/Tr.vue';
import PTd from '@/components/atoms/table/Td.vue';
import PTh from '@/components/atoms/table/Th.vue';
import FI from '@/components/atoms/icons/FI.vue';

export default {
    name: 'p-data-table',
    components: {
        PTable, PTd, PTh, PTr, FI,
    },
    mixins: [PTable],
    data() {
        return {
            allState: false,
        };
    },
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

<style scoped>

</style>
