<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="6" sm="4" md="1" class="mb-3">
        <b-button block variant="outline-primary">
          Add
        </b-button>
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
        <UserDetail v-if="selectedUser" :user="selectedUser" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTable from '@/components/base/BaseTable.vue'
const UserDetail = () => import('@/services/identity/UserDetail.vue')

export default {
  name: 'User',
  components: {
    BaseTable,
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
      selectedUser: null
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
    rowClicked (item) {
      this.selectedUser = item
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
