<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="6" sm="4" md="2" xl="1" class="mb-3">
        <BaseModal :name="'addUser'" :title="'Add User'" :centered="true" :hide-footer="true">
          <template #activator>
            <b-button block variant="outline-primary">
              Add
            </b-button>
          </template>
          <template #contents>
            <UserDetail :creatable="true" :updatable="true" />
          </template>
        </BaseModal>
      </b-col>
      <b-col cols="6" sm="4" md="2" xl="1" class="mb-3">
        <BaseModal v-if="selectedUser" :name="'editUser'" :title="'Edit User'"
                   :centered="true" :hide-footer="true"
        >
          <template #activator>
            <b-button block variant="outline-primary">
              Edit
            </b-button>
          </template>
          <template #contents>
            <UserDetail :updatable="true" :user-prop="selectedUser" />
          </template>
        </BaseModal>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="users" :fields="fields" :per-page="perPage"
                   caption="Users" :searchable="true" :total-rows="totalCount" :search-context-data="queryData"
                   :busy="isLoading"
                   @rowSelected="rowSelected" @list="listUsers" @limitChanged="limitChanged"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-tabs v-if="selectedUser">
          <b-tab active>
            <template slot="title">
              <i class="icon-info mr-1" /> User Information
            </template>
            <div slot="header">
              <strong>User Detail</strong>
            </div>
            <UserDetail v-if="selectedUser" :user-prop="selectedUser" />
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTable from '@/component/base/table/BATB_001_BaseTable.vue'
import query from './search_context/query.js'
const BaseModal = () => import('@/component/base/modal/BAMO_001_BaseModal.vue')
const UserDetail = () => import('./IDUS_002_UserDetail.vue')

export default {
  name: 'User',
  components: {
    BaseTable,
    BaseModal,
    UserDetail
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
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.listUsers(this.perPage, 0)
    },
    reset () {
      this.users = []
      this.selectedUser = null
      this.isLoading = true
    },
    async listUsers (limit, skip, sort, search) {
      this.reset()

      if (limit === undefined || limit === null) limit = 10
      if (skip === undefined || skip === null) skip = 0
      if (sort === undefined || sort === null) sort = '-created_date'
      if (search === undefined || search === null) search = []

      let res
      try {
        res = await this.$http.get(`/identity/user`, {
          params: { limit, skip, sort }
          /**
           * TODO: set limit, skip, sort and search in the right format
           */
        })
      } catch (e) {
        console.error(e)
      }

      setTimeout(() => { // this is for test
        // let temp = []
        // for (var i = 0; i < 1000; i++) {
        //   temp[i] = res.data[0]
        // }
        // this.users = temp
        this.users = res.data
        this.isLoading = false
      }, 1000)
      /**
       * TODO: set totalCount with data from server
       */
    },
    rowSelected (row) {
      if (row instanceof Array || !row) this.selectedUser = null
      else this.selectedUser = row.data
    },
    limitChanged (val) {
      this.perPage = Number(val)
      this.init()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
