<template>
  <div class="animated fadeIn">
    <b-card class="base border-top-0">
      <b-row>
        <b-col cols="12">
          <BaseTable :show-caption="showCaption"
                     :cardless="true"
                     :table-data="audits"
                     :fields="fields"
                     :per-page="3"
                     :searchable="false"
                     :busy="isLoading"
                     :row-clicked-fn="rowClicked"
                     :total-rows="totalCount"
                     @list="listAudits"
          />
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';

const thisTestData = [{
    eventName: 'UpdateProjectGroup',
    status: 'fail',
    Description: '정보가 변경되었습니다.',
    Executor: 'Name',
    Created: '2019-10-16',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: 'Success',
    Description: '정보가 변경되었습니다.',
    Executor: 'Name',
    Created: '2019,10,16',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: 'Success',
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: 'Success',
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: 'Success',
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
}

];

export default {
    name: 'ProjectAudit',
    components: {
        BaseTable
    },
    props: {},
    data () {
        return {
            isLoading: true,
            showCaption: false,
            fields: [
                { key: 'eventName', label: 'Event', sortable: true },
                { key: 'status', label: 'State', sortable: true },
                { key: 'Description', label: 'Description', sortable: true },
                { key: 'Executor', label: 'Excutor', sortable: true },
                { key: 'Created', label: 'Created', sortable: true },
                { key: 'link', label: '', sortable: true }
            ],
            audits: [],
            selectedAudit: null,
            addModal: false,
            totalCount: 17
        };
    },
    created () {
    },
    mounted () {
        this.listAudits(3, 0);
    },
    methods: {
        async listAudits (limit, skip, sort, search) {
            if (limit === undefined) {
                limit = 10;
            }
            if (skip === undefined) {
                skip = 0;
            }
            if (sort === undefined) {
                sort = '-created_date';
            }
            if (search === undefined) {
                search = {};
            }

            let res;
            /* try {
            res = await this.$http.get(`/identity/users`, {
              params: { limit, skip, sort, search }
            })
          } catch (e) {
            console.error(e)
          } */
            this.audits = thisTestData;
            this.selectedAudit = null;
            this.isLoading = false;
        /**
         * TODO: set totalCount with data from server
         */
        },
        rowClicked (item, idx) {
            this.selectedAudit = item;
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
