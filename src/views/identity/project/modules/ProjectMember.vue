<template>
    <p-toolbox-table style="padding:0px"
                     :items="items"
                     :fields="fields"
                     :selectable="selectable"
                     :sortable="sortable"
                     :sort-by.sync="sortBy"
                     :sort-desc.sync="sortDesc"
                     :all-page="allPage"
                     :this-page.sync="thisPage"
                     :select-index.sync="selectIndex"
                     :page-size.sync="pageSize"
                     @rowLeftClick="rowLeftClick"
                     @rowRightClick="rowRightClick"
                     @changePageSize="changePageSize"
                     @changePageNumber="changePageNumber"
                     @clickSetting="clickSetting"
                     @clickRefresh="clickRefresh"
                     @theadClick="theadClick"
    />
</template>

<script>
import PToolboxTable from '@/components/organisms/tables/toolbox-table/ToolboxTable';

export default {
    name: 'ProjectMember',
    components: {
        PToolboxTable,

    },
    props: {
        selectedNode: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            selectable: true,
            sortable: true,
            selectIndex: [],
            sortBy: 'name',
            sortDesc: true,
            thisPage: 1,
            allPage: 10,
            pageSize: 15,
        };
    },
    computed: {
        anySelectedRow() {
            return this.$attrs['selected-data'];
        },
        selectedFields() {
            return [
                {
                    key: 'user_id', label: this.tr('COMMON.COL_NM.UID'), sortable: true, ajaxSortable: false, thStyle: { width: '150px' },
                },
                {
                    key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' },
                },
                {
                    key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
                {
                    key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
            ];
        },
        fields() {
            return [
                { key: 'selected', thStyle: { width: '50px' } },
                {
                    key: 'user_id', label: this.tr('COMMON.UID'), sortable: true, ajaxSortable: false, thStyle: { width: '150px' },
                },
                {
                    key: 'name', label: this.tr('COMMON.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' },
                },
                {
                    key: 'state', label: this.tr('COMMON.STATE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
                {
                    key: 'email', label: this.tr('COMMON.EMAIL'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
                {
                    key: 'group', label: this.tr('COMMON.GROUP'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
                {
                    key: 'role', label: this.tr('COMMON.ROLE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' },
                },
            ];
        },
        isMultiSelected() {
            return this.selectedItems.length > 1;
        },
        hasSelectedMember() {
            return this.selectedItems.length > 0;
        },
        selectedMembers() {
            return this.selectedItems.map(item => item.data);
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.listMembers(this.perPage, 0);
        },
        reset() {
            this.members = [];
            this.selectedMember = null;
            this.isLoading = true;
        },
        saveMeta(limit, start, sort, filter, filterOr) {
            if (this.isEmpty(limit)) {
                limit = 10;
            }
            if (this.isEmpty(start)) {
                start = 0;
            }
            if (this.isEmpty(sort)) {
                sort = {};
            }
            if (this.isEmpty(filter)) {
                filter = [];
            }
            if (this.isEmpty(filterOr)) {
                filterOr = [];
            }
            this.searchQuery = {
                sort,
                page: {
                    start,
                    limit,
                },
                filter_or: filterOr,
            };
        },
        async listMembers(limit, start, sort, filter, filterOr) {
            this.reset();
            this.saveMeta(limit, start, sort, filter, filterOr);
            const query = { query: this.searchQuery };
            const selectedNodeDT = this.selectedNode.node.data;
            const param = (selectedNodeDT.item_type === 'PROJECT_GROUP') ? { project_group_id: selectedNodeDT.id, ...query } : { project_id: selectedNodeDT.id, ...query };
            const url = `/identity/${this.replaceAll(selectedNodeDT.item_type, '_', '-')}/member/list`;

            console.log('Parameters', JSON.stringify(param));
            await this.$http.post(url, param).then((response) => {
                const results = [];
                if (!this.isEmpty(response.data.results)) {
                    const memberUserIds = [];
                    response.data.results.forEach((current) => {
                        current.user_info.role = current.user_info.roles.join(', ');
                        results.push(current.user_info);
                        memberUserIds.push(current.user_info.user_id);
                    });
                    this.memberUserIDs = memberUserIds;
                }
                this.items = results;
                console.log(response.data.results);
                this.isLoading = false;
            }).catch((error) => {
                console.error(error);
                this.isLoading = false;
            });
        },
        rowSelected(rows) {
            this.selectedItems = rows;
            if (rows.length === 1) {
                this.selectedIdx = rows[0].idx;
            }
        },
        rowAllSelected(isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged(val) {
            this.perPage = Number(val);
            this.init();
        },
        getSelectedInfo(key) {
            const selectedObj = this.$attrs['selected-data'].node;
            const Obj = {
                id: selectedObj.data.id,
                is_cached: selectedObj.data.is_cached,
                is_root: selectedObj.data.is_root,
                item_type: selectedObj.data.item_type,
            };

            if (this.isEmpty(selectedObj)) {
                return false;
            } if (this.isEmpty(key)) {
                return Obj;
            } if (Obj.hasOwnProperty(key)) {
                return Obj[key];
            }
            return false;
        },
        async actionProcess() {
            let url = null;
            const param = {};

            if (this.selectedMembers.length > 0) {
                const membersIds = this.selectedMembers;
                if (this.actionFlag === 'delete') {
                    if (this.getSelectedInfo('item_type') === 'PROJECT_GROUP') {
                        url = '/identity/project-group/member/remove';
                        param.project_group_id = this.getSelectedInfo('id');
                        param.users = this.getSelectedValArr(membersIds, 'user_id');
                    } else {
                        url = '/identity/project/member/remove';
                        param.project_id = this.getSelectedInfo('id');
                        param.users = this.getSelectedValArr(membersIds, 'user_id');
                    }
                }
            } else {
                return;
            }


            if (!this.isEmpty(url) && !this.isEmpty(url)) {
                await this.$http.post(url, param);
                /*     .then((response) => {
                    if (this.isEmpty(response.data)){
                        console.log('success');
                    }
                }).catch((error) =>{
                    console.log(error);
                }); */
            }
        },
        actionCommand() {
            const itemType = this.getSelectedInfo('item_type') === 'PROJECT_GROUP' ? this.tr('PG_GR') : this.tr('PG');
            if (this.actionFlag === 'delete') {
                const obj = {};
                obj.title = this.tr('DEL_MEM');
                obj.type = 'danger';
                obj.text = this.tr('DELETE_YN', [itemType]);
                this.actionCommandData = obj;
            }
            this.$refs.IDPJ005_DeleteUser.showModal();
        },
        deleteSelected() {
            this.actionFlag = 'delete';
            this.actionCommand();
        },
    },
};
</script>

<style lang="scss" scoped>
  .base-table {
    @extend %sheet;
  }
</style>
