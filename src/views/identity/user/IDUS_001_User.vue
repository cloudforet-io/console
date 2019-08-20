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
              <b-button class="btn mr-4" variant="outline-primary" @click="onClickAdd">
                {{ tr('BTN_ADD') }}
              </b-button>
              <b-dropdown v-if="selectedUser" no-caret
                          variant="outline-secondary"
                          class="no-selected"
              >
                <template #button-content>
                  <span>Actions</span> &nbsp;
                  <i class="fal fa-angle-down" />
                </template>
                <b-dropdown-item @click="onClickUpdate">
                  <div class="item sm">
                    <i class="icon fal fa-pencil-alt" />
                    <span class="name">{{ tr('BTN_UPT') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickDelete">
                  <div class="item sm">
                    <i class="icon fal fa-trash-alt" />
                    <span class="name">{{ tr('BTN_DELETE') }}</span>
                  </div>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDrag>

    <BaseModal ref="addUser"
               title="Add User" 
               :centered="true" 
               :hide-footer="true"
               :backdrop-off="true"
    >
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
               :backdrop-off="true"
    >
      <template #contents>
        <UserDetail :updatable="true" 
                    :user-prop="selectedUser" 
                    @update="updateUser"
        />
      </template>
    </BaseModal>

    <BaseSimpleModal
      ref="DeleteCheck"
      title="User Delete"
      text="Are you sure you want to delete?"
      type="danger"
      :ok-only="false"
      @ok="deleteUser"
    />

              
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
const BaseSimpleModal = () => import('@/components/base/modal/BAMO_002_BaseSimpleModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

export default {
    name: 'User',
    components: {
        BaseDrag,
        BaseTable,
        BaseModal,
        BaseSimpleModal,
        UserDetail,
        BaseTabNav,
        UserInfo
    },
    data () {
        return {
            tabs: [
                {
                    tabTitle: this.tr('PN.INFO'),
                    tabIdxTitle: 'INFO'
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
            query: {}
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
            
            this.query = { 
                sort, 
                page: {
                    start: start, 
                    limit
                }, 
                filter,
                filter_or: filterOr
            };
        },
        async listUsers (limit, start, sort, filter, filterOr) {
            this.reset();
            // sort = {
            //     key: 'user_id',
            //     desc: true
            // };
            // start = 4;
            // limit = 2;
            // filter = [
            //     { k: 'user_id', v: 'nobody', o: 'eq' }
            // ];
            // filterOr = [
            //     { k: 'user_id', v: 'nobody', o: 'eq' },
            //     { k: 'user_id', v: 'admin', o: 'eq' }
            // ];
            
            this.saveMeta(limit, start, sort, filter, filterOr);
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/list', {
                    query: this.query
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
        async deleteUser () {
            try {
                await this.$axios.post('/identity/user/delete', {
                    user_id: this.selectedUser.user_id
                });
                this.$alertify.success('Selected User Successfully Deleted.');
                this.listUsers();
            } catch (e) {
                console.error(e);
                this.$alertify.error('ERROR OCCURED during Deleting User.');
            }
        },
        onClickAdd () {
            this.$refs.addUser.showModal();
        },
        onClickUpdate () {
            this.$refs.editUser.showModal();
        },
        onClickDelete () {
            this.$refs.DeleteCheck.showModal();
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
