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
import BaseDrag from '@/components/base/drag/BADG_001_BaseDrag.vue';
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';
import query from './search_context/query.js';
import UserDetail from './IDUS_002_UserDetail.vue';
import UserInfo from './IDUS_003_UserInfo.vue';
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal.vue');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');
const BasePanel = () => import('@/components/base/panel/BAPA_002_BasePanel');

export default {
    name: 'User',
    components: {
        BaseDrag,
        BaseTable,
        BaseModal,
        UserDetail,
        BaseTabNav,
        UserInfo,
        BasePanel
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

            if (limit === undefined || limit === null) {
                limit = 10;
            }
            if (skip === undefined || skip === null) {
                skip = 0;
            }
            if (sort === undefined || sort === null) {
                sort = '-created_date';
            }
            if (search === undefined || search === null) {
                search = [];
            }

            let res = null;
            try {
                res = await this.$axios.get('/identity/user', {
                    params: { limit, skip, sort }
                /**
                 * TODO: set limit, skip, sort and search in the right format
                 */
                });

                setTimeout(() => { // this is for test
                    this.users = res.data;
                    this.isLoading = false;
                }, 1000);
            } catch (e) {
                console.error(e);
                this.isLoading = false;
                this.users = [
                    {
                        userId: 'abc',
                        name: 'abc',
                        email: 'abc@abc',
                        mobile: '222',
                        group: 'abcabczzz',
                        language: 'en',
                        domainId: 'abcabc',
                        tags: [
                            { abc: 'abc11' },
                            { abc2: 'abc2222' },
                            { abc3: 'abc333' }
                        ]
                    },
                    {
                        userId: 'zzz',
                        name: 'zzz',
                        email: 'zzz@abc',
                        mobile: '333',
                        group: 'zdzfzdsfsdf',
                        language: 'en',
                        domainId: 'wrwrw',
                        tags: [
                            { zzz1: 'ztest' },
                            { zzz22: 'test222' },
                            { zzz333: 'teset33' }
                        ]
                    }
                ];
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
