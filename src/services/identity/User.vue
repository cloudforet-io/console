<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="6" sm="4" md="1" class="mb-3">
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
      <b-col cols="6" sm="4" md="1" class="mb-3">
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
        <BaseTable :table-data="users" :fields="fields" :per-page="10"
                   caption="Users" :searchable="true" :refresh-fn="listUsers"
                   :row-clicked="rowClicked"
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
import BaseTable from '@/components/base/BaseTable.vue'
const BaseModal = () => import('@/components/base/BaseModal.vue')
const UserDetail = () => import('@/services/identity/UserDetail.vue')

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
      addModal: false
    }
  },
  mounted () {
    this.listUsers()
  },
  methods: {
    async listUsers () {
      let res
      try {
        res = await this.$http.get('/users')
        console.log(res.data)
      } catch (e) {
        console.error(e)
      }
      this.users = res.data
      this.selectedUser = null
    },
    rowClicked (item, idx, target) {
      if (this.selectedUser) {
        delete this.selectedUser._rowVariant
        this.users.splice(this.selectedIdx, 1, this.selectedUser)
      }
      this.selectedUser = Object.assign({}, item, { _rowVariant: 'success' })
      this.users.splice(idx, 1, this.selectedUser)
      this.selectedIdx = idx
    },
    okFn () {
      console.log('ok Fn')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
