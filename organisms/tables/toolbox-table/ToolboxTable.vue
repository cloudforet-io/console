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
                <p-text-pagenation
                    v-if="pagenationVisible"
                    class="tool"
                    :this-page.sync="proxyThisPage"
                    :all-page="allPage"
                    @pageChange="changePageNumber"
                />
                <p-select
                    class="tool"
                    :options="pageSizeOptions"
                    :selected.sync="proxyPageSize"
                />
                <p-icon-button
                    class="tool"
                    icon="fa-cog"
                    @click="$emit('clickSetting',$event)"
                />
                <p-icon-button
                    class="tool"
                    icon="fa-sync-alt"
                    @click="$emit('clickRefresh',$event)"
                />
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
                console.log(value);
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
    .toolbox > div{
        display: inline-flex;
        border: #0f69ff dashed 1px;
        flex-wrap:nowrap;
    }
    .toolbox > div > div{
        border: #8a2be2 dashed 1px;
        align-items: center;
    }
    .toolbox .left{
        justify-content: flex-start;
    }
    .toolbox .center{
        justify-content: center;

    }
    .toolbox .right{
        justify-content: flex-end;
    }
    .tool {
        margin-left: 8px;
        margin-right: 8px;
    }
</style>
