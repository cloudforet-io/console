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
                    @create="createUser"
                  />
                </template>
              </BaseModal>
              <BaseModal v-if="selectedUser" 
                         ref="editUser"
                         title="Edit User"
                         :centered="true" 
                         :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    {{ tr('BTN_EDIT') }}
                  </b-button>
                </template>
                <template #contents>
                  <UserDetail :updatable="true" 
                              :user-prop="selectedUser" 
                              @update="updateUser"
                              @delete="deleteUser"
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
          <UserInfo :user-prop="selectedUser" @update="updateSelectedUserInfo" />
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
            isLoading: true,
            meta: {}
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'user_id', label: this.tr('COL_NM.ID'), sortable: true, ajaxSortable: false, thStyle: { width: '150px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'mobile', label: this.tr('COL_NM.PHONE'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'group', label: this.tr('COL_NM.GROUP'), sortable: true, ajaxSortable: false, thStyle: { width: '200px' }},
                { key: 'language', label: this.tr('COL_NM.LANGUAGE'), sortable: true, ajaxSortable: false , thStyle: { width: '200px' }},
                { key: 'domain_id', label: this.tr('COL_NM.DOMAIN_ID'), thStyle: { width: '200px' }},
                { key: 'timezone', label: this.tr('COL_NM.TIMEZONE'), thStyle: { width: '200px' }}
            ];
        },
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
            this.selectedIdx = undefined;
            this.isLoading = true;
        },
        saveMeta (limit, skip, sort, search) {
            this.meta = { limit, skip, sort, search };
        },
        async listUsers (limit, skip, sort, search) {
            this.reset();
            this.saveMeta(limit, skip, sort, search);

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
        rowSelected (row, idx) {
            if (row instanceof Array || !row) {
                this.selectedUser = null;
                this.selectedIdx = undefined;
            } else {
                this.selectedUser = row.data;
                this.selectedIdx = idx;
            }
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        },
        updateSelectedUserInfo (user) {
            this.selectedUser = user;
        },
        updateUser (user) {
            this.$refs.editUser.hideModal();
            this.selectedUser = user;
            this.selectedUser.selected = true;
            this.$set(this.users, this.selectedIdx, user);
        },
        createUser () {
            this.$refs.addUser.hideModal();
            this.listUsers();
        },
        deleteUser () {
            console.log('delete user');
            this.$refs.editUser.hideModal();
            this.listUsers();
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
