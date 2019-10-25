<template>
  <b-card class="base first-tab">
    <BaseTable :table-data="tableData"
               :fields="fields"
               :dark-header="false"
               :caption-width="500"
               :search-width="300"
               :busy="isLoading"
               state-type="JOB_STATE"
               :per-page="query.page.limit"
               :total-rows="totalCount"
               plain-search
               cardless
               underlined
               searchable
               @limitChanged="limitChanged"
               @list="listJobsData"
    >
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
    data() {
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
        fields() {
            return [
                { key: 'selected', thStyle: { width: '50px' }},
                {
                    key: 'job_id',
                    label: this.tr('COL_NM.JOB_ID'),
                    sortable: true,
                    ajaxSortable: true,
                    thStyle: { width: '120px' }
                },
                {
                    key: 'state',
                    label: this.tr('COL_NM.STATE'),
                    sortable: true,
                    ajaxSortable: true,
                    thStyle: { width: '120px' }
                },
                {
                    key: 'collect_mode',
                    label: this.tr('COL_NM.COL_MODE'),
                    sortable: true,
                    ajaxSortable: true,
                    thStyle: { width: '150px' }
                },
                {
                    key: 'created_count',
                    label: this.tr('COL_NM.CRT_COUNT'),
                    sortable: true,
                    ajaxSortable: true,
                    thStyle: { width: '170px' }
                },
                {
                    key: 'updated_count',
                    label: this.tr('COL_NM.UPT_COUNT'),
                    sortable: true,
                    ajaxSortable: true,
                    thStyle: { width: '170px' }
                },
                {
                    key: 'created_at',
                    label: this.tr('COL_NM.CREATED'),
                    sortable: true,
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val, localStorage.getItem('timezone'));
                    },
                    thStyle: { width: '160px' }
                },
                {
                    key: 'finished_at',
                    label: this.tr('COL_NM.FINISHED'),
                    sortable: true,
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val, localStorage.getItem('timezone'));
                    },
                    thStyle: { width: '160px' }
                }
            ];
        }
    },
    watch: {
        collectorData() {
            this.reset();
            this.listJobsData();
        }
    },
    created() {
        this.listJobsData();
    },
    methods: {
        setQuery(limit, start, sort, keyword) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.keyword = keyword || '';
        },
        getComputedTime(selectedTimeStamp) {
            return !this.isEmpty(selectedTimeStamp) ? this.getDatefromTimeStamp(selectedTimeStamp.seconds, localStorage.getItem('timezone')) : '';
        },
        async getJobs(selectedId, key) {
            let paramObj = { domain_id: sessionStorage.domainId };
            let keyId = `${key.replace(/-/gi, '_')}_id`;
            paramObj[keyId] = selectedId;

            try {
                return await this.$axios.post(`/secret/${key}/list`, paramObj);
            } catch (err) {
                this.alertError(err);

            }
        },
        async listJobsData(limit, start, sort, keyword) {

            this.reset();
            this.setQuery(limit, start, sort, keyword);

            let param = { query: this.query,
                domain_id: sessionStorage.domainId,
                collector_id: this.isEmpty(this.collectorData.collector_id)? '': this.collectorData.collector_id };
            await this.$axios.post('/inventory/job/list-items', param).then((response) => {
                this.tableData = response.data.results;
                this.totalCount = response.data.total_count;
                this.isLoading = false;
            }).catch((error) => {
                this.isLoading = false;
                console.error(error);
            });
        },
        reset() {
            this.isLoading = true;
            this.tableData = [];
        },
            
        onClickSecurityGroup() {
            this.activeNav = this.collectorDataKeyEnum.SG;
            this.listJobsData();
        },
        portRangeFormatter(val, key, data) {
            return `${data.port_range_min} - ${data.port_range_max}`;
        },
        tagFormatter(tags) {
            let keys = Object.keys(tags);
            let results = '';
            keys.map((key) => {
                results += ` ${key}: ${tags[key]}`;
            });
            return results;
        },
        alertError(err) {
            console.error(err);
            this.$alertify.error(this.tr('ALERT.ERROR', [this.tr('GET_CONT'), this.tr('SERVER')]));
        },
        limitChanged(val) {
            this.query.page.limit = val;
            this.listJobsData();
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
