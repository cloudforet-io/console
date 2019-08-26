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
                   field-id="user_id"
                   @rowSelected="rowSelected"
                   @onSelectAll="onAllRowSelected"
                   @list="listUsers"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <b-button class="btn mr-4" variant="primary" @click="onClickAdd">
                {{ tr('BTN_ADD') }}
              </b-button>
              <b-dropdown v-if="hasSelectedUser" no-caret
                          variant="outline-dark"
                          class="no-selected"
              >
                <template #button-content>
                  <span>Actions</span> &nbsp;
                  <i class="fal fa-angle-down" />
                </template>
                <b-dropdown-item v-if="selectedUser" @click="onClickUpdate">
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

    <BaseModal ref="IDUS001_UserDetailModal"
               :title="isCreateMode ? 'Add User' : 'Edit User'"
               centered
               hide-footer
               backdrop-off
               prevent-esc-close
               size="xl"
               interactive
               @esc="checkCancel"
               @cancel="checkCancel"
    >
      <template #contents>
        <UserDetail ref="IDUS001_UserDetail"
                    :user-prop="isCreateMode ? undefined : selectedUser" 
                    :creatable="isCreateMode ? true : false"
                    size="xl"
                    @create="createUser"
                    @update="updateUser"
                    @cancel="hideUserDetail"
        />
      </template>
    </BaseModal>
    
    <BaseModal
      ref="DeleteCheck"
      title="User Delete"
      type="danger"
      centered
      @ok="deleteUser"
    >
      <template #contents>
        <h4>Are you sure you want to delete selected user(s) below?</h4>
        <br>
        <ul>
          <li v-if="selectedUser">
            <h5>{{ selectedUser.name }}</h5>
          </li>
          <div v-for="(user) in multiSelectedUserList" v-else :key="user.user_id">
            <BaseCheckbox :key="user.user_id"
                          :selected="user.selected"
                          class="select-checkbox"
            />
            <!-- @change="checkboxClicked" -->
            <h5>{{ user.name }}</h5>
          </div>
        </ul>
      </template>
    </BaseModal>

              
    <BaseTabNav v-if="hasSelectedUser" class="user-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                :use-slot="true"
    >
      <template #INFO>
        <b-card class="base first-tab">
          <BaseMultiPanel v-if="isMultiSelected" 
                          :data="multiSelectedUserList"
                          :data-fields="multiInfoFields" 
          />
          <UserInfo v-else 
                    :user-data="selectedUser"
                    @update="updateSelectedUserInfo"
          />
        </b-card>
      </template>
    </BaseTabNav>
    <div v-else class="empty">
      <span class="msg">Select a User Above.</span>
    </div>
  </div>
</template>

<script>
import BaseDrag from '@/components/base/drag/BADG_002_BaseDragY';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import query from './search_context/query.js';

const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');
const UserInfo = () => import('./IDUS_003_UserInfo');
const BaseMultiPanel = () => import('@/components/base/panel/BAPA_005_BaseMultiPanel');

const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const UserDetail = () => import('./IDUS_002_UserDetail');

const BaseCheckbox = () => import('@/components/base/checkbox/BACB_001_BaseCheckbox');


export default {
    name: 'User',
    components: {
        BaseDrag,
        BaseTable,
        BaseTabNav,
        UserInfo,
        BaseMultiPanel,
        BaseModal,
        UserDetail,
        BaseCheckbox
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
            query: {},
            isCreateMode: true,
            isMultiSelected: false,
            multiSelectedList: []
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
                { 
                    key: 'language', 
                    label: this.tr('COL_NM.LANGUAGE'), 
                    sortable: true, 
                    ajaxSortable: false , 
                    thStyle: { width: '200px' },
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getLanguageName(val);
                    }
                },
                { key: 'timezone', label: this.tr('COL_NM.TIMEZONE'), thStyle: { width: '200px' }}
            ];
        },
        multiInfoFields () {
            return [
                { key: 'user_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') },
                { key: 'group', label: this.tr('COL_NM.GROUP') }
            ];
        },
        hasSelectedUser () {
            return !!(this.isMultiSelected || this.selectedUser);
        },
        multiSelectedUserList () {
            return this.multiSelectedList.map((item) => {
                return item.data;
            });
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
            this.multiSelectedList = [];
            this.isMultiSelected = false;
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
        },
        rowSelected (selected, isSelection, rows) {
            if (rows && rows.length > 1) {
                this.isMultiSelected = true;
                this.multiSelectedList = rows;
            } else {
                this.isMultiSelected = false;
            }

            if (isSelection && !this.isMultiSelected) {
                this.setSelectedUser(selected);
            } else if (rows && rows.length === 1) {
                this.setSelectedUser(rows[0]);
            } else {
                this.initSelectedUser();
            }
        },
        onAllRowSelected (isSelectedAll, rows) {
            if (isSelectedAll) {
                this.isMultiSelected = true;
                this.multiSelectedList = rows;
            } else {
                this.isMultiSelected = false;
            }
            this.initSelectedUser();

        },
        initSelectedUser () {
            this.selectedUser = undefined;
            this.selectedIdx = undefined;
        },
        setSelectedUser (item) {
            this.selectedUser = this.users[item.idx];
            this.selectedIdx = item.idx;
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        },
        updateSelectedUserInfo (user) {
            this.selectedUser = user;
        },
        updateUser (user) {
            this.hideUserDetail();
            user.selected = true;
            this.selectedUser = user;
            this.$set(this.users, this.selectedIdx, user);
        },
        createUser () {
            this.hideUserDetail();
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
            this.isCreateMode = true;
            this.showUserDetail();
        },
        onClickUpdate () {
            this.isCreateMode = false;
            this.showUserDetail();
        },
        onClickDelete () {
            this.$refs.DeleteCheck.showModal();
        },
        showUserDetail () {
            this.$refs.IDUS001_UserDetailModal.showModal();
        },
        hideUserDetail () {
            this.$refs.IDUS001_UserDetailModal.hideModal();
        },
        checkCancel () {
            this.$refs.IDUS001_UserDetail.onCancel();
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
.empty {
    text-align: center;
    margin-top: 40px;
    .msg {
        color: $darkgray;
        font-size: 1.3rem;
        font-weight: 600;
    }

}
</style>
