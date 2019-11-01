<template>
    <div>
        <div class="toolbox">
            <div class="toolbox left">
                <slot name="toolbox-left" />
            </div>
            <div class="toolbox center">
                <slot name="toolbox-center" />
            </div>
            <div class="toolbox right">
                <slot name="toolbox-right" />
                <div class="tool">
                    <p-text-pagenation
                        v-if="pagenationVisible"
                        :this-page.sync="proxyThisPage"
                        :all-page="allPage"
                        @pageChange="changePageNumber"
                    />
                </div>
                <div class="tool">
                    <p-select
                        :options="pageSizeOptions"
                        :selected.sync="proxyPageSize"
                    />
                </div>
                <div class="tool">
                    <p-icon-button
                        icon="fa-cog"
                        @click="$emit('clickSetting',$event)"
                    />
                </div>
                <div class="tool">
                    <p-icon-button
                        icon="fa-sync-alt"
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
            v-on="$listeners"
        />
    </div>
</template>

<script>
import PDataTable from '@/components/organisms/tables/data-table/DataTable';
import PTextPagenation from '@/components/organisms/pagenations/textPagenation';
import PIconButton from '@/components/molecules/buttons/IconButton';
import PSelect from '@/components/molecules/forms/Select';

export default {
    name: 'ToolboxTable',
    components: {
        PDataTable, PTextPagenation, PIconButton, PSelect,
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
            pageSizeOptions: [{ value: 15 }, { value: 30 }, { value: 45 }],
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
    },
    methods: {
        changePageSize(size) {
            this.$emit('changePageSize', size);
        },
        changePageNumber(page) {
            this.$emit('changePageNumber', page);
        },
    },

};
</script>

<style lang="scss" scoped>
    .toolbox{
        padding-bottom: 8px;
        padding-top: 8px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        flex-wrap:nowrap;
        align-items: center;
    }
    .toolbox .left{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: flex-start;
    }
    .toolbox .center{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: center;

    }
    .toolbox .right{
        display: inline-flex;
        flex-wrap:nowrap;
        width: auto;
        justify-content: flex-end;
    }
    .tool {
        margin-left: 8px;
        margin-right: 8px;
        display: inline;
    }
</style>
