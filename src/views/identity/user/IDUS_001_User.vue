<template>
  <div class="animated fadeIn">
    <BaseDragHorizontal>
      <template #container="{ height }">
        <BaseTable class="user-table" 
                   :table-data="users" 
                   :fields="fields" 
                   :per-page="query.page.limit"
                   searchable
                   :total-rows="totalCount" 
                   :search-context-data="contextData"
                   :busy="isLoading" 
                   :cardless="false" 
                   underlined
                   :height="height"
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
                          variant="outline-info"
                          class="no-selected"
              >
                <template #button-content>
                  <span>{{ tr('BTN_ACTION') }}</span> &nbsp;
                  <i class="fal fa-angle-down" />
                </template>
                <b-dropdown-item v-if="!isMultiSelected" @click="onClickUpdate">
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
                <b-dropdown-item @click="onClickEnable">
                  <div class="item sm">
                    <i class="icon fal fa-check-circle" />
                    <span class="name">{{ tr('BTN_ENABLE') }}</span>
                  </div>
                </b-dropdown-item>
                <b-dropdown-item @click="onClickDisable">
                  <div class="item sm">
                    <i class="icon fal fa-ban" />
                    <span class="name">{{ tr('BTN_DISABLE') }}</span>
                  </div>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDragHorizontal>

    <BaseModal ref="IDUS001_UserDetailModal"
               :title="tr('TITLE', [isCreateMode ? tr('BTN_ADD') : tr('BTN_EDIT'), tr('USER')])"
               centered
               hide-footer
               backdrop-off
               prevent-esc-close
               size="xl"
               interactive
               @esc="hideUserDetail"
               @cancel="hideUserDetail"
    >
      <template #contents>
        <UserDetail ref="IDUS001_UserDetail"
                    :user-prop="isCreateMode ? undefined : selectedItems[0].data" 
                    :creatable="isCreateMode ? true : false"
                    size="xl"
                    @create="createUser"
                    @update="updateUser"
                    @cancel="hideUserDetail"
        />
      </template>
    </BaseModal>

    <ActionCheckModal ref="IDUS001_ActionCheckModal" 
                      :data="selectedUsers" 
                      :fields="multiActionFields"
                      :action="action"
                      :title="actionCheckTitle"
                      :type="actionCheckType"
                      :text="actionCheckText"
                      primary-key="user_id"
                      @succeed="listUsers"
                      @failed="listUsers"
    />
    
              
    <BaseTabNav v-if="hasSelectedUser" class="user-info"
                :fill="false"
                :nav-tabs="tabs"
                :keep-alive="true"
                :is-footer-visible="false"
                :use-slot="true"
    >
      <template #info>
        <b-card class="base first-tab">
          <BaseMultiPanel v-if="isMultiSelected" 
                          :data="selectedUsers"
                          :data-fields="multiInfoFields" 
          />
          <UserInfo v-else 
                    :user-data="selectedItems[0].data"
                    @update="updateSelectedUserInfo"
          />
        </b-card>
      </template>
    </BaseTabNav>
    <div v-else class="empty">
      <span class="msg">{{ tr('PANEL.NO_SELECT', [tr('USER')]) }}</span>
    </div>
  </div>
</template>

<script>
import BaseDragHorizontal from '@/components/base/drag/BADG_002_BaseDragHorizontal';
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import contextData from './search_context/query.js';

const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');
const UserInfo = () => import('./IDUS_003_UserInfo');
const BaseMultiPanel = () => import('@/components/base/panel/BAPA_005_BaseMultiPanel');

const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const UserDetail = () => import('./IDUS_002_UserDetail');

const ActionCheckModal = () => import('@/components/base/modal/BAMO_003_EXT_ActionCheckModal.vue');

export default {
    name: 'User',
    components: {
        BaseDragHorizontal,
        BaseTable,
        BaseTabNav,
        UserInfo,
        BaseMultiPanel,
        BaseModal,
        UserDetail,
        ActionCheckModal
    },
    data () {
        return {
            tabs: [
                {
                    title: this.tr('PANEL.INFO'),
                    key: 'info'
                }
            ],
            users: [],
            selectedItems: [],
            addModal: false,
            totalCount: 0,
            isReadyForSearch: false,
            isLoading: true,
            contextData: contextData,
            query: { 
                sort: {}, 
                page: {
                    start: 1, 
                    limit: 10
                }, 
                filter: [],
                filter_or: []
            },
            isCreateMode: true,
            action: null,
            actionCheckTitle: '',
            actionCheckType: '',
            actionCheckText: ''
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'user_id', label: this.tr('COL_NM.ID'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'state', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'mobile', label: this.tr('COL_NM.PHONE'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { key: 'group', label: this.tr('COL_NM.GROUP'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }},
                { 
                    key: 'language', 
                    label: this.tr('COL_NM.LANGUAGE'), 
                    sortable: true, 
                    ajaxSortable: true , 
                    thStyle: { width: '200px' },
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getLanguageName(val);
                    }
                },
                { key: 'timezone', label: this.tr('COL_NM.TIMEZONE'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }}
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
        multiActionFields () {
            return [
                { key: 'user_id',label: this.tr('COL_NM.ID') },
                { key: 'name', label: this.tr('COL_NM.NAME') },
                { key: 'email', label: this.tr('COL_NM.EMAIL') }
            ];
        },
        isMultiSelected () {
            return this.selectedItems.length > 1;
        },
        hasSelectedUser () {
            return this.selectedItems.length > 0;
        },
        selectedUsers () {
            return this.selectedItems.map((item) => {
                return item.data;
            });
        }
    },
    mounted () {
        this.listUsers();
    },
    methods: {
        reset () {
            this.users = [];
            this.selectedItems = [];
            this.isLoading = true;
        },
        setQuery (limit, start, sort, filter, filterOr) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.filter = filter || [];
            this.query.filter_or = filterOr || [];
        },
        async listUsers (limit, start, sort, filter, filterOr) {
            this.reset();
            this.setQuery(limit, start, sort, filter, filterOr);
            let res = null;
            try {
                res = await this.$axios.post('/identity/user/list', {
                    query: this.query
                });
                this.users = res.data.results;
                this.totalCount = res.data.total_count;
                this.isLoading = false;
            } catch (e) {
                console.error(e);
                this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('USER')]));
                this.isLoading = false;
            }
        },
        rowSelected (rows) {
            this.selectedItems = rows;
        },
        onAllRowSelected (isSelectedAll, rows) {
            this.selectedItems = rows;
        },
        limitChanged (val) {
            this.query.page.limit = Number(val);
            this.listUsers();
        },
        updateSelectedUserInfo (user) {
            this.selectedItems[0].data = user;
        },
        updateUser (user) {
            this.hideUserDetail();
            user.selected = true;
            this.selectedItems[0].data = user;
            this.$set(this.users, this.selectedItems[0].idx, user);
        },
        createUser () {
            this.hideUserDetail();
            this.listUsers();
        },
        getParams (items) {
            let params = { users: []};
            items.map((item) => {
                params.users.push(item.user_id);
            });
            return params;
        },
        async deleteUser (commitItems) {
            await this.$axios.post('/identity/user/delete', this.getParams(commitItems));
        },
        async enableUser (commitItems) {
            await this.$axios.post('/identity/user/enable', this.getParams(commitItems));
        },
        async disableUser (commitItems) {
            await this.$axios.post('/identity/user/disable', this.getParams(commitItems));
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
            this.action = this.deleteUser;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DELETE'), this.tr('USER')]);
            this.actionCheckType = 'danger';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DELETE'), this.tr('USER')]);
            this.showActionModal();
        },
        onClickEnable () {
            this.action = this.enableUser;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_ENABLE'), this.tr('USER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_ENABLE'), this.tr('USER')]);
            this.showActionModal();
        },
        onClickDisable () {
            this.action = this.disableUser;
            this.actionCheckTitle = this.tr('TITLE', [this.tr('BTN_DISABLE'), this.tr('USER')]);
            this.actionCheckType = 'warning';
            this.actionCheckText = this.tr('ACTION.CHECK', [this.tr('BTN_DISABLE'), this.tr('USER')]);
            this.showActionModal();
        },
        showUserDetail () {
            this.$refs.IDUS001_UserDetailModal.showModal();
        },
        hideUserDetail () {
            this.$refs.IDUS001_UserDetailModal.hideModal();
        },
        showActionModal () {
            this.$refs.IDUS001_ActionCheckModal.showModal();
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
// .delete-user {
//     vertical-align: middle;
// }
// .user-name {
//     font-size: 1.2rem;
// }
</style>
