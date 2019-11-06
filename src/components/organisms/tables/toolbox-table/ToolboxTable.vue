<template>
    <div class="toolbox-table">
        <div class="toolbox">
            <div class="left">
                <slot name="toolbox-left" />
            </div>
            <div class="center">
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
                    <p-dropdown
                        class="page-size-dropdown"
                        :menu="pageSizeOptions"
                        @clickMenu="changePageSize"
                    >
                        {{ pageSize }}
                    </p-dropdown>
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
        <p-data-table
            :fields="fields"
            :items="items"
            :sortable="sortable"
            :selectable="selectable"
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
            v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-data-table>
    </div>
</template>

<script>
import PDataTable from '@/components/organisms/tables/data-table/DataTable';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation';
import PIconButton from '@/components/molecules/buttons/IconButton';
import PDropdown from '@/components/organisms/buttons/dropdown/Dropdown';

export default {
    name: 'PToolboxTable',
    components: {
        PDataTable, PTextPagenation, PIconButton, PDropdown,
    },
    mixins: [PDataTable],
    props: {
        pagenationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
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
    },
    data() {
        return {
            pageSizeOptions: [
                { type: 'item', text: 15, event: 15 },
                { type: 'item', text: 30, event: 30 },
                { type: 'item', text: 45, event: 45 },
            ],
        };
    },
    computed: {
        proxyPageSize: {
            get() {
                return this.pageSize;
            },
            set(value) {
                this.$emit('update:pageSize', value);
            },
        },
        proxyThisPage: {
            get() {
                return this.thisPage;
            },
            set(value) {
                this.$emit('update:thisPage', value);
            },
        },
        proxySelectIndex: {
            get() {
                return this.selectIndex;
            },
            set(value) {
                this.$emit('update:selectIndex', value);
            },
        },
        proxySortBy: {
            get() {
                return this.sortBy;
            },
            set(value) {
                this.$emit('update:sortBy', value);
            },
        },
        proxySortDesc: {
            get() {
                return this.sortDesc;
            },
            set(value) {
                this.$emit('update:sortDesc', value);
            },
        },
        slotFieldsName() {
            const slotNames = [];
            this.fieldsName.forEach((value) => {
                slotNames.push(`col-${value}`);
            });
            return slotNames;
        },
    },
    methods: {
        changePageSize(size) {
            const sizeNum = Number(size);
            if (this.pageSize !== sizeNum) {
                this.$emit('update:pageSize', sizeNum);
                this.$emit('changePageSize', sizeNum);
            }
        },
        changePageNumber(page) {
            this.$emit('changePageNumber', page);
        },
    },

};
</script>

<style lang="scss" scoped>
    .toolbox-table {
        background-color: $white;
        padding: 1rem;
        box-shadow: 0px 0px 8px #4D49B614;
        border: 1px solid #F2F2F2;
        .toolbox {
            margin-top: 0.5rem;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            flex-wrap: nowrap;
            align-items: center;

        }
    }

    .left{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: flex-start;
    }
    .center{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: center;

    }
    .right{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: flex-end;
    }
    .tool{
        margin-left: 1rem;
        display: inline;
    }
    .page-size-dropdown{
        &::v-deep .menu-btn{
            min-width: 4rem;
        }
    }
</style>
