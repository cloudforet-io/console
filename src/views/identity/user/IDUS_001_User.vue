<template>
  <div class="animated fadeIn">
    <BaseDrag >
      <template #container="{ height }">
        <BaseTable class="user-table" 
                   :table-data="users" 
                   :fields="fields" 
                   :per-page="perPage"
                   :searchable="true" 
                   :total-rows="totalCount" 
                   :search-context-data="queryData"
                   :busy="isLoading" 
                   :cardless="false" 
                   :underlined="true"
                   :height="height"
                   @rowSelected="rowSelected" 
                   @list="listUsers"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <BaseModal :name="'addUser'" :title="'Add User'" :centered="true" :hide-footer="true">
                <template #activator>
                  <b-button class="btn" variant="outline-primary">
                    Add
                  </b-button>
                </template>
                <template #contents>
                  <UserDetail :creatable="true" :updatable="true" />
                </template>
              </BaseModal>
              <BaseModal v-if="selectedUser" :name="'editUser'" :title="'Edit User'"
                         :centered="true" :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    Edit
                  </b-button>
                </template>
                <template #contents>
                  <UserDetail :updatable="true" :user-prop="selectedUser" />
                </template>
              </BaseModal>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDrag>
    <BaseTabNav v-if="selectedUser" class="user-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                :use-slot="true">
      <template #INFO>
        <b-card class="base">
          <UserDetail :user-prop="selectedUser" />
        </b-card>
      </template>
    </BaseTabNav>
  </div>
</template>

<script>
import BaseDrag from '@/components/base/drag/BADG_002_BaseDragY.vue';
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';
import query from './search_context/query.js';
import UserDetail from './IDUS_002_UserDetail.vue';

const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

export default {
    name: 'User',
    components: {
        BaseDrag,
        BaseTable,
        BaseModal,
        UserDetail,
        BaseTabNav
    },
    data () {
        return {
            fields: [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'userId', label: 'ID', sortable: true, ajaxSortable: false, thStyle: { width: '150px' }},
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'mobile', label: 'Phone', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'group', label: 'Group Name', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'language', label: 'Language', sortable: true, ajaxSortable: false , thStyle: { width: '200px' }},
                { key: 'domainId', label: 'Domain ID' }
            ],
            tabs: [
                {
                    tabTitle: 'INFO',
                    component: UserDetail
                }
            ],
            defaultTab: 0,
            users: [],
            selectedUser: null,
            selectedIdx: undefined,
            addModal: false,
            totalCount: 17,
            queryData: query,
            isReadyForSearch: false,
            perPage: 10,
            isLoading: true
        };
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            this.listUsers(this.perPage, 0);
        },
        reset () {
            this.users = [];
            this.selectedUser = null;
            this.isLoading = true;
        },
        async listUsers (limit, skip, sort, search) {
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

            let res;
            try {
                res = await this.$axios.get('/identity/user', {
                    params: { limit, skip, sort }
          /**
           * TODO: set limit, skip, sort and search in the right format
           */
                });
            } catch (e) {
                console.error(e);
            }

            setTimeout(() => { // this is for test
                this.users = res.data;
                this.isLoading = false;
            }, 1000);
      /**
       * TODO: set totalCount with data from server
       */
        },
        rowSelected (row) {
            if (row instanceof Array || !row) {
                this.selectedUser = null;
            } else {
                this.selectedUser = row.data;
            }
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        }
    }
};
</script>

<style lang="scss" scoped>
.animated.fadeIn {
  padding: $top-pad $side-pad $bottom-pad $side-pad;
}
.base-table {
  @extend %sheet;
}
.btn {
  padding: 3px 15px;
  margin: 0 5px;
}
.user-table {
  margin-top: 20px;
}
.user-info {
  margin-bottom: 20px;
}
</style>
