<template>
  <div class="animated fadeIn">
    <b-card class="base border-top-0">
      <b-row>
        <b-col cols="12">
          <BaseTable :table-data="users"
                     :fields="fields"
                     :per-page="perPage"
                     :searchable="true"
                     :total-rows="totalCount"
                     :search-context-data="queryData"
                     :busy="isLoading"
                     @rowSelected="rowSelected"
                     @list="listUsers"
                     @limitChanged="limitChanged"
          >
            <template #caption>
              <b-row align-v="center">
                <b-col cols="6">
                  <BaseModal :name="'addUser'" :title="'Add User'" :centered="true" :hide-footer="true">
                    <template #activator>
                      <b-button block variant="outline-primary">
                        {{ $t('MSG.BUTTON_ADD') }}
                      </b-button>
                    </template>
                    <template #contents>
                      <MemberDetail :creatable="true" :updatable="true" />
                    </template>
                  </BaseModal>
                </b-col>
                <b-col cols="6">
                  <BaseModal v-if="selectedUser"
                             :centered="true"
                             :hide-footer="true"
                             :name="'editUser'"
                             :title="'Edit User'"
                  >
                    <template #activator>
                      <b-button block variant="outline-danger">
                        {{ $t('MSG.BUTTON_DELETE') }}
                      </b-button>
                    </template>
                    <template #contents>
                      <MemberDetail :updatable="true" :user-prop="selectedUser" />
                    </template>
                  </BaseModal>
                </b-col>
              </b-row>
            </template>
          </BaseTable>
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>
<script>

import query from '@/service/identity/project/search_context/search_context';
import BaseTable from '@/component/base/table/BATB_001_BaseTable.vue';
const BaseModal = () => import('@/component/base/modal/BAMO_001_BaseModal');
const MemberDetail = () => import('@/service/identity/project/IDPJ_006_ProjectMemberDetail');

export default {
  name: 'ProjectMember',
  components: {
    BaseTable,
    BaseModal,
    MemberDetail
  },
  data () {
    return {
      fields: [
        { key: 'selected' },
        { key: 'userId', label: 'ID', sortable: true, ajaxSortable: false },
        { key: 'name', label: 'Name', sortable: true, ajaxSortable: true },
        { key: 'email', label: 'Email', sortable: true, ajaxSortable: false },
        { key: 'mobile', label: 'Phone', sortable: true, ajaxSortable: false },
        { key: 'group', label: 'Group Name', sortable: true, ajaxSortable: false },
        { key: 'language', label: 'Language', sortable: true, ajaxSortable: false },
        { key: 'domainId', label: 'Domain ID' }
      ],
      users: [],
      selectedUser: null,
      selectedIdx: undefined,
      addModal: false,
      totalCount: 17,
      queryData: query,
      isReadyForSearch: false,
      perPage: 3,
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

      if (limit === undefined || limit === null) limit = 10;
      if (skip === undefined || skip === null) skip = 0;
      if (sort === undefined || sort === null) sort = '-created_date';
      if (search === undefined || search === null) search = [];

      let res;
      try {
        res = await this.$http.get('/identity/user', {
          params: { limit, skip, sort }
                    /**
             * TODO: set limit, skip, sort and search in the right format
             */
        });
      } catch (e) {
        console.error(e);
      }

      setTimeout(() => { // this is for test
                // let temp = []
                // for (var i = 0; i < 1000; i++) {
                //   temp[i] = res.data[0]
                // }
                // this.users = temp
        this.users = res.data;
        this.isLoading = false;
      }, 1000);
        /**
         * TODO: set totalCount with data from server
         */
    },
    rowSelected (row) {
      if (row instanceof Array || !row) this.selectedUser = null;
      else this.selectedUser = row.data;
    },
    limitChanged (val) {
      this.perPage = Number(val);
      this.init();
    }
  }
};
</script>

<style lang="scss" scoped>
  .up-corner-no-radius {
    border-top-left-radius: 0px !important;
    border-top-right-radius: 0px !important;;
  }
</style>
