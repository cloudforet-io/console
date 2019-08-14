<template>
  <div class="animated fadeIn">
    <BaseDrag>
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
              <BaseModal ref="addUser"
                         title="Add User" 
                         :centered="true" 
                         :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-primary">
                    {{ tr('BTN_ADD') }}
                  </b-button>
                </template>
                <template #contents>
                  <UserDetail 
                    :creatable="true" 
                    :updatable="true"
                    @close="$refs.addUser.hideModal()"/>
                </template>
              </BaseModal>
              <BaseModal v-if="selectedUser" 
                         ref="editUser"
                         :title="'Edit User'"
                         :centered="true" 
                         :hide-footer="true">
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    {{ tr('BTN_EDIT') }}
                  </b-button>
                </template>
                <template #contents>
                  <UserDetail :updatable="true" 
                              :user-prop="selectedUser" 
                              @close="$refs.editUser.hideModal()"
                  />
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
                :use-slot="true"
    >
      <template #INFO>
        <b-card class="base first-tab">
          <UserInfo :user-prop="selectedUser" />
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
import UserInfo from './IDUS_003_UserInfo.vue';
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

export default {
    name: 'User',
    components: {
        BaseDrag,
        BaseTable,
        BaseModal,
        UserDetail,
        BaseTabNav,
        UserInfo
    },
    data () {
        return {
            fields: [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'user_id', label: 'ID', sortable: true, ajaxSortable: false, thStyle: { width: '150px' }},
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'mobile', label: 'Phone', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'group', label: 'Group Name', sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'language', label: 'Language', sortable: true, ajaxSortable: false , thStyle: { width: '200px' }},
                { key: 'domain_id', label: 'Domain ID', thStyle: { width: '200px' }},
                { key: 'timezone', label: 'Timezone', thStyle: { width: '200px' }}
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
            totalCount: 0,
            queryData: query,
            isReadyForSearch: false,
            perPage: 10,
            isLoading: true
        };
    },
    computed: {
        selectedUserData () {
            return this.selectedUser;
        }
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

            let res = null;
            try {
                res = await this.$axios.post('/identity/user/list', {
                    // params: { limit, skip, sort }
                /**
                 * TODO: set limit, skip, sort and search in the right format
                 */
                });
                setTimeout(() => { // this is for test
                    this.users = res.data.results;
                    this.totalCount = res.data.total_count;
                    this.isLoading = false;
                }, 1000);
            } catch (e) {
                console.error(e);
                this.isLoading = false;
            }
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
  margin: 0 5px;
}
.user-table {
  margin-top: 20px;
}
.user-info {
  margin-bottom: 20px;
}
</style>
