<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
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
    </b-col>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable.vue';
const thisTestData = [{
    eventName: 'UpdateProjectGroup',
    status: {
        flag: 'fail',
        variantSize: 3,
        text: 'Success'
    } ,
    Description: '정보가 변경되었습니다.',
    Executor: 'Name',
    Created: '2019-10-16',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: {
        flag: 'Success',
        variantSize: 3,
        text: 'Success'

    },
    Description: '정보가 변경되었습니다.',
    Executor: 'Name',
    Created: '2019-10-16',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: {
        flag: 'fail',
        variantSize: 2,
        text: 'fail'
    },
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: {
        flag: 'fail',
        variantSize: 3,
        text: 'fail'
    },
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
},
{
    eventName: 'UpdateProjectGroup',
    status: {
        flag: 'fail',
        variantSize: 2,
        text: 'fail'
    },
    Description: '정보가 변경되었습니다.',
    Created: '2019-10-16',
    Executor: 'Name',
    linkText: 'update Group',
    link: 'www.google.com'
}

];

export default {
    name: 'ServerAudit',
    components: {
        BaseTable
    },
    props: {},
    data () {
        return {
            isLoading: true,
            showCaption: false,
            fields: [
                { key: 'comm', label: 'Command ID', sortable: true },
                { key: 'status', label: 'State', sortable: true },
                { key: 'Description', label: 'Status', sortable: true },
                { key: 'Executor', label: 'Created', sortable: true },
                { key: 'Created', label: 'Finished', sortable: true },
                { key: 'Result', label: 'Result', sortable: true }
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
            if (this.isEmpty(limit)) {
                limit = 10;
            }
            if (this.isEmpty(skip)) {
                skip = 0;
            }
            if (this.isEmpty(sort)) {
                sort = '-created_date';
            }
            if (this.isEmpty(search)) {
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
