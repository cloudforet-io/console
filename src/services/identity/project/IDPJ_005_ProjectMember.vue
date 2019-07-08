<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="6" sm="4" md="2" class="mb-3">
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
      <b-col cols="6" sm="4" md="2" class="mb-3">
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
        <BaseTable :table-data="users" :fields="fields" :per-page="3"
                   caption="Users" :searchable="true" :list-fn="listUsers"
                   :row-clicked-fn="rowClicked" :total-rows="totalCount"

        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <b-card v-if="selectedUser">
          <div slot="header">
            <strong>User Detail</strong>
          </div>
          <UserDetail v-if="selectedUser" :user-prop="selectedUser" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue'
  const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal.vue')
  const ProjectMemberDetail = () => import('./IDPJ_006_ProjectMemberDetail.vue')

  import {api} from '@/setup/api'

  export default {
    name: 'ProjectMember',
    components: {
      BaseTable,
      BaseModal,
      ProjectMemberDetail
    },
    props:{

    },
    created(){
      debugger;
    },
    mounted () {
      this.listUsers(3, 0);
    },
    data() {
      return {
          fields: [
            { key: 'userId', label: 'ID', sortable: true },
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'mobile', label: 'Phone', sortable: true },
            { key: 'group', label: 'Group Name', sortable: true },
            { key: 'language', label: 'Language', sortable: true },
            { key: 'domainId', label: 'Domain ID', sortable: true }
          ],
          users: [],
          selectedUser: null,
          selectedIdx: undefined,
          addModal: false,
          totalCount: 17,
      }
    },
    methods: {
      async listUsers (limit, skip, sort, search) {
        console.log("Check :list User")
        if (limit === undefined) limit = 10
        if (skip === undefined) skip = 0
        if (sort === undefined) sort = '-created_date'
        if (search === undefined) search = {}

        let res
        try {
          res = await this.$http.get(`/identity/user`, {
            params: { limit, skip, sort, search }
          })
        } catch (e) {
          console.error(e)
        }
        this.users = res.data
        this.selectedUser = null
        /**
         * TODO: set totalCount with data from server
         */
      },
      rowClicked (item, idx) {
        this.selectedUser = item
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
