<template>
  <div class="animated fadeIn">
    <b-row>
      <b-col cols="12">
        <BaseTable :table-data="audits" :fields="fields" :per-page="3"
                   caption="" :searchable="false" :list-fn="listAudits"
                   :row-clicked-fn="rowClicked" :total-rows="totalCount"
                   :query-data="query"
        />
      </b-col>
    </b-row>
  </div>
</template>

<script>
  const thisTestData = [{
    eventName : 'UpdateProjectGroup',
    status: 'Success',
    Description: '정보가 변경되었습니다.',
    Executor: 'Name',
    Created: '2019,10,16',
    details: 'www.google.com'
  },
    {
      eventName : 'UpdateProjectGroup',
      status: 'Success',
      Description: '정보가 변경되었습니다.',
      Executor: 'Name',
      Created: '2019,10,16',
      details: 'www.google.com'
    },
    {
      eventName : 'UpdateProjectGroup',
      status: 'Success',
      Description: '정보가 변경되었습니다.',
      Executor: 'Name',
      Created: '2019,10,16',
      details: 'www.google.com'
    },
    {
      eventName : 'UpdateProjectGroup',
      status: 'Success',
      Description: '정보가 변경되었습니다.',
      Executor: 'Name',
      Created: '2019,10,16',
      details: 'www.google.com'
    },
    {
      eventName : 'UpdateProjectGroup',
      status: 'Success',
      Description: '정보가 변경되었습니다.',
      Executor: 'Name',
      Created: '2019,10,16',
      details: 'www.google.com'
    }
  ]

  import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue'
  const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal.vue')
  const ProjectMemberDetail = () => import('./IDPJ_006_ProjectMemberDetail.vue')

  import {api} from '@/setup/api'

  export default {
    name: 'ProjectAudit',
    components: {
      BaseTable,
      BaseModal,
      ProjectMemberDetail
    },
    props:{

    },
    created(){

    },
    mounted () {
      this.listAudits(3, 0);
    },
    data() {
      return {
        fields: [
          { key: 'eventName', label: 'Event', sortable: true },
          { key: 'status', label: 'State', sortable: true },
          { key: 'Description', label: 'Description', sortable: true },
          { key: 'Executor', label: 'Excutor', sortable: true },
          { key: 'Created', label: 'Created', sortable: true },
          { key: 'details', label: '', sortable: true },
        ],
        audits: [],
        selectedAudit: null,
        selectedIdx: undefined,
        addModal: false,
        totalCount: 17,
      }
    },
    methods: {
      async listAudits (limit, skip, sort, search) {
        if (limit === undefined) limit = 10
        if (skip === undefined) skip = 0
        if (sort === undefined) sort = '-created_date'
        if (search === undefined) search = {}

        let res
       /* try {
          res = await this.$http.get(`/identity/users`, {
            params: { limit, skip, sort, search }
          })
        } catch (e) {
          console.error(e)
        }*/
        this.audits = thisTestData
        this.selectedAudit = null
        /**
         * TODO: set totalCount with data from server
         */
      },
      rowClicked (item, idx) {
        this.selectedAudit = item
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
