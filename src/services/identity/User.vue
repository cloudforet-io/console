<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="items" :fields="fields" :per-page="10" caption="Users" :row-clicked="rowClicked" />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <UserDetail />
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
    /**
     * TODO:
     * user fields: [user_id], [name], [state], [email], [mobile], [group], [role_id], [project_id], [project_group_id], [query(dict)], domain_id(meta)
     */
    return {
      items: [
        { username: 'Samppa Nori', registered: '2012/01/01', role: 'Member', status: 'Active' },
        { username: 'Estavan Lykos', registered: '2012/02/01', role: 'Staff', status: 'Banned' },
        { username: 'Chetan Mohamed', registered: '2012/02/01', role: 'Admin', status: 'Inactive' },
        { username: 'Derick Maximinus', registered: '2012/03/01', role: 'Member', status: 'Pending' },
        { username: 'Friderik Dávid', registered: '2012/01/21', role: 'Staff', status: 'Active' },
        { username: 'Yiorgos Avraamu', registered: '2012/01/01', role: 'Member', status: 'Active' },
        { username: 'Avram Tarasios', registered: '2012/02/01', role: 'Staff', status: 'Banned' },
        { username: 'Quintin Ed', registered: '2012/02/01', role: 'Admin', status: 'Inactive' },
        { username: 'Enéas Kwadwo', registered: '2012/03/01', role: 'Member', status: 'Pending' },
        { username: 'Agapetus Tadeáš', registered: '2012/01/21', role: 'Staff', status: 'Active' },
        { username: 'Carwyn Fachtna', registered: '2012/01/01', role: 'Member', status: 'Active' },
        { username: 'Nehemiah Tatius', registered: '2012/02/01', role: 'Staff', status: 'Banned' },
        { username: 'Ebbe Gemariah', registered: '2012/02/01', role: 'Admin', status: 'Inactive' },
        { username: 'Eustorgios Amulius', registered: '2012/03/01', role: 'Member', status: 'Pending' },
        { username: 'Leopold Gáspár', registered: '2012/01/21', role: 'Staff', status: 'Active' },
        { username: 'Pompeius René', registered: '2012/01/01', role: 'Member', status: 'Active' },
        { username: 'Paĉjo Jadon', registered: '2012/02/01', role: 'Staff', status: 'Banned' },
        { username: 'Micheal Mercurius', registered: '2012/02/01', role: 'Admin', status: 'Inactive' },
        { username: 'Ganesha Dubhghall', registered: '2012/03/01', role: 'Member', status: 'Pending' },
        { username: 'Hiroto Šimun', registered: '2012/01/21', role: 'Staff', status: 'Active' },
        { username: 'Vishnu Serghei', registered: '2012/01/01', role: 'Member', status: 'Active' },
        { username: 'Zbyněk Phoibos', registered: '2012/02/01', role: 'Staff', status: 'Banned' },
        { username: 'Einar Randall', registered: '2012/02/01', role: 'Admin', status: 'Inactive' },
        { username: 'Félix Troels', registered: '2012/03/21', role: 'Staff', status: 'Active' },
        { username: 'Aulus Agmundr', registered: '2012/01/01', role: 'Member', status: 'Pending' }
      ],
      fields: [
        { key: 'username', label: 'User', sortable: true },
        { key: 'registered' },
        { key: 'role' },
        { key: 'status', sortable: true }
      ]
    }
  },
  mounted () {
    this.createUsers()
  },
  methods: {
    createUsers () {
      console.log('create user start')
      this.$http.get('/users')
        .then(res => {
          console.log(res.data)
        }, err => console.error(err))
    },
    rowClicked (item) {
      console.log('rowClicked', item)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
