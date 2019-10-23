<template>
  <b-card class="base first-tab">
    <BaseTable :table-data="tableData"
               :fields="fields"
               :dark-header="false"
               :caption-width="500"
               :search-width="300"
               :busy="isLoading"
               :per-page="query.page.limit"
               :total-rows="totalCount"
               plain-search
               cardless
               underlined
               searchable
               @limitChanged="limitChanged"
               @list="listCredentialsData">
      <template #caption />
    </BaseTable>
  </b-card>
</template>

<script>
const BaseTable = () => import('@/components/base/table/BaseTable');
export default {
    name: 'CollectorJobs',
    components: {
        BaseTable
    },
    props: {
        collectorData: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            collectorDataKeyEnum: Object.freeze({
                DISK: 'disk',
                NIC: 'nic',
                SG: 'security_group'
            }),
            activeNav: '',
            tableData: [],
            query: {
                page: {
                    start: 1,
                    limit: 10
                },
                keyword: ''
            },
            isLoading: true,
            totalCount: 0
        };
    },
    computed: {
        fields () {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                { key: 'job_id', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '120px' }},
                { key: 'state', label: this.tr('COL_NM.SCHEDULE'), sortable: true, ajaxSortable: true, thStyle: { width: '120px' }},
                { key: 'collect_mode', label: this.tr('COL_NM.COL_MODE'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'updated_count', label: this.tr('COL_NM.LAST_SCHEDULED'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                { key: 'name', label: this.tr('COL_NM.CREATED'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
            ];
        }
    },
    watch: {
        collectorData () {
            this.reset();
            this.listCredentialsData();
        }
    },
    created () {
        this.listCredentialsData();
    },
    methods: {
        setQuery (limit, start, sort, keyword) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.keyword = keyword || '';
        },
        getComputedTime (selectedTimeStamp) {
            return !this.isEmpty(selectedTimeStamp) ? this.getDatefromTimeStamp(selectedTimeStamp.seconds, localStorage.getItem('timezone')) : '';
        },
        async getCredentials(selectedId, key) {
            let paramObj = { domain_id: sessionStorage.domainId };
            let keyId = `${key.replace(/-/gi,'_')}_id`;
            paramObj[keyId] = selectedId;

            try {
                return await this.$axios.post(`/secret/${key}/list`, paramObj);
            } catch (err) {
                this.alertError(err);

            }
        },
        async listCredentialsData (limit, start, sort, keyword) {

            this.reset();
            this.setQuery(limit, start, sort, keyword);

            const credential_group_id = this.collectorData.plugin_info.credential_group_id;
            const credential_id = this.collectorData.plugin_info.credential_id;
            let mergeGroup = [];
            let merge = (a, b, p) => a.filter(aa => ! b.find ( bb => aa[p] === bb[p])).concat(b);

            try {

                this.tableData = [];
                this.totalCount = 0;

            } catch (err) {
                this.alertError(err);
            }
            this.isLoading = false;
        },
        reset () {
            this.isLoading = true;
            this.tableData = [];
        },
        alertError (err) {
            console.error(err);
            this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('SERVER')]));
        },
        limitChanged (val) {
            this.query.page.limit = val;
            this.listCredentialsData();
        }
    }
};
</script>


<style lang="scss" scoped>
  .data-container {
    background-color: $white;
  }

  .nav-container.nav {
    .nav-item {
      margin-right: 5px;
      .nav-link {
        vertical-align: middle;
        padding: 5px 10px 3px 10px;
        border-radius: 3px;
        background-color: $lightgray;
        &.active {
          background-color: $blue;
        }
        &:hover {
          background-color: $gray;
          &.active {
            background-color: darken($blue, 10%);
          }
        }
      }
    }
  }
</style>
