<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="users"
                   :fields="fields"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :search-context-data="queryData"
                   :show-caption="true"
                   :busy="isLoading"
                   :cardless="false"
                   :underlined="true"
                   @rowSelected="rowSelected"
                   @list="listUsers"
                   @limitChanged="limitChanged"
                   @onSelectAll="rowAllSelected"
        />
      </b-col>
    </b-row>
      <b-row>
          <slot name="footerArea">
              <div class="col-md-12">
                  <div class="modal-footer" style="border-top:none; padding-right: 0px">
                      <b-button size="md" variant="primary" @click="addUser">
                          Create
                      </b-button>
                      <b-button size="md" variant="light" @click="closeWindow">
                          Cancel
                      </b-button>
                  </div>
              </div>
          </slot>
      </b-row>
  </div>
</template>

<script>
import query from '@/views/identity/project/search_context/search_context';
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';

export default {
    name: 'ProjectMember',
    components: {
        BaseTable
    },
    data() {
        return {
            fields: [
                {key: 'selected'},
                {key: 'role_id', label: 'User ID', sortable: true, ajaxSortable: false},
                {key: 'user_name', label: 'Name', sortable: true, ajaxSortable: true},
                {key: 'email', label: 'Email', sortable: true, ajaxSortable: false},
                {key: 'group', label: 'Group', sortable: true, ajaxSortable: false}
            ],
            users: [],
            anySelectedRow: false,
            selectedUserMulti: null,
            selectedUser: null,
            selectedIdx: undefined,
            isFooterVisible: true,
            addModal: false,
            totalCount: 17,
            queryData: query,
            isReadyForSearch: false,
            perPage: 3,
            isLoading: true
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.listUsers(this.perPage, 0);
        },
        reset() {
            this.users = [];
            this.selectedUser = null;
            this.isLoading = true;
        },
        async listUsers(limit, skip, sort, search) {
            this.reset();

            if (this.isEmpty(limit)) {
                limit = 10;
            }
            if (this.isEmpty(skip)) {
                skip = 0;
            }
            if (this.isEmpty(sort)) {
                sort = '-created_date';
            }
            if (this.isEmpty(search)) {
                search = [];
            }

            this.$axios.get('/identity/user', {
                params: { limit, skip, sort }
            }).then((response) => {
                this.users = response.data;
                this.isLoading = false;
            }).catch((ex) => {
                console.error(ex);
            });

        },
        rowSelected(row) {
            if (this.isEmpty(row) || row.length < 1) {
                this.selectedUser = null;
                this.anySelectedRow = false;
            } else {
                this.selectedUser = row;
                this.selectedUserMulti = row;
                this.anySelectedRow = true;
            }
        },
        rowAllSelected(row) {
            if (row instanceof Array && !this.isEmpty(row)) {
                this.selectedUserMulti = row;
                this.anySelectedRow = true;
            } else {
                this.selectedUserMulti = null;
                this.anySelectedRow = false;
            }
        },
        limitChanged(val) {
            this.perPage = Number(val);
            this.init();
        },
        deleteSelected() {
            this.$alertify.confirmWithTitle(
                'Delete Users',
                'Do you want to delete selected?',
                () => {
                    this.consoleLogEnv('success');
                    this.$alertify.success('Selected User Successfully deleted.');
                },
                () => {
                    this.consoleLogEnv('fail');
                    this.$alertify.success('Action Cancel');
                }
            );
        },
        addUser() {
            console.log('')
        },
        closeWindow(e) {
            this.$parent.$store.dispatch('modal/closeModal');
        }
    }
};
</script>

<style lang="scss" scoped>
    .base-table {
        @extend %sheet;
    }
</style>
