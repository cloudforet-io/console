<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="members"
                   :fields="fields"
                   :field-id="'user_id'"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :search-context-data="memberModalQueryData"
                   :show-caption="true"
                   :busy="isLoading"
                   :cardless="false"
                   :underlined="true"
                   :off-caption="true"
                   @rowSelected="rowSelected"
                   @list="listMembersOnModal"
                   @limitChanged="limitChanged"
                   @onSelectAll="rowAllSelected"
        />
        <br>
        <b-card>
          <div v-html="selectedMembersOnSc" />
        </b-card>
      </b-col>
    </b-row>
    <b-row>
      <slot name="footerArea">
        <div class="col-md-12">
          <div class="modal-footer" style="border-top:none; padding-right: 0px">
            <b-button size="md" variant="primary" @click="addUser">
              {{ $t('MSG.BTN_ADD') }}
            </b-button>
            <b-button size="md" variant="light" @click="closeWindow">
              {{ $t('MSG.BTN_CANCEL') }}
            </b-button>
          </div>
        </div>
      </slot>
    </b-row>
  </div>
</template>
<script>

import query from '@/views/identity/project/search_context/search_context';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';

export default {
    name: 'ProjectMember',
    event: ['close'],
    components: {
        BaseTable
    },
    data() {
        return {
            members: [],
            anySelectedRow: false,
            selectedUserMulti: null,
            selectedUser: null,
            selectedIdx: undefined,
            isFooterVisible: true,
            memberModalQueryData: query,
            memberModalQuery: {},
            totalCount: 0,
            perPage: 10,
            isLoading: true,
            selectedModalItems: [],
            selectedModalMember: null
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected' },
                { key: 'user_id', label: 'User ID', sortable: true, ajaxSortable: false ,thStyle: { width: '150px' }},
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true ,thStyle: { width: '150px' }},
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false , thStyle: { width: '230px' }},
                { key: 'group', label: 'Group', sortable: true, ajaxSortable: false, thStyle: { width: '150px' }}
            ];
        },
        isMultiSelected () {
            return this.selectedModalItems.length > 1;
        },
        hasSelectedMember () {
            return this.selectedModalItems.length > 0;
        },
        selectedMembers () {
            return this.selectedModalItems.map((item) => {
                return item.data;
            });
        },
        selectedMembersOnSc () {
            let htmlStr = '';
            let lombok = {};
            this.selectedModalItems.map((item) => {
                return lombok[item.data.user_id] = item.data.name;
            });
            let lombokStr = JSON.stringify(lombok);
            let lombokArr = JSON.stringify(lombok).split(',');
            lombokArr.forEach(function(curItem){
                let removedStr = curItem.replace('{','');
                removedStr = removedStr.replace('}','');
                htmlStr += `<b-button variant="light">${removedStr}</b-button>`;
            });
            console.log(htmlStr);
            return htmlStr;
        }
    },
    mounted() {
        this.isLoading = false;
    },
    methods: {
        init() {
            this.listMembersOnModal(this.perPage, 0);
        },
        reset () {
            this.members = [];
            this.selectedModalMember = null;
            this.isLoading = true;
        },
        saveMeta (limit, start, sort, filter, filterOr) {
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
                    start: start,
                    limit
                },
                filter_or: filterOr
            };
        },
        saveMemberModalMeta (limit, start, sort, filter, filterOr) {
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
            this.memberModalQuery = {
                sort,
                page: {
                    start: start,
                    limit
                },
                filter_or: filterOr
            };
        },
        async listMembersOnModal (limit, start, sort, filter, filterOr){
            this.reset();
            this.saveMemberModalMeta(limit, start, sort, filter, filterOr);
            await this.$axios.post('/identity/user/list',{
                query: this.memberModalQuery
            }).then((response) => {
                this.members = response.data.results;
                this.totalCount = response.data.total_count;
                this.isLoading = false;
            }).catch((error) =>{
                console.error(error);
                this.isLoading = false;
            });
        },
        rowSelected (rows) {
            this.selectedModalItems = rows;
            if (rows.length === 1) {
                this.selectedIdx = rows[0].idx;
                this.selectedModalMember = rows[0];
            }
        },
        rowAllSelected (isSelectedAll, rows) {
            this.selectedModalItems = rows;
        },
        limitChanged(val) {
            this.perPage = Number(val);
            this.init();
        },
        deleteSelected() {
            this.$refs.IDPJ006_DeleteCheck.showModal();
        },
        async addUser() {
            let url = null;
            const projectSelected = this.$attrs['selectedData'].nodes[0].data;
            const selected_id = projectSelected.id;
            const selected_type = projectSelected.item_type;

            let param = {
                query: this.searchQuery
            };

            if (selected_type === 'PROJECT_GROUP'){
                url = '/identity/project-group/member/add';
                param['project_group_id'] =  selected_id;
            } else {
                url = '/identity/project/member/add';
                param['project_id'] =  selected_id;
            }
            if (this.selectedModalItems.length > 0){
                const currentUsers = this.selectedModalItems;
                param['users'] = this.getSelectedValArr(currentUsers,'data.user_id');
            } else {
                return;
            }

            await this.$axios.post(url, param).then((response) => {
                this.$parent.$parent.$parent.$parent.$parent.listMembers();
                this.$emit('close');
            }).catch((error) =>{
                console.error(error);
            });
        },
        closeWindow(e) {
            this.$emit('close');
        }
    }
};
</script>

<style lang="scss" scoped>
    .base-table {
        @extend %sheet;
    }
</style>
