<template>
  <div>
    <b-row>
      <b-col class="col-xs-12 col-sm-3 col-md-3">
        <b-card class="s-card ">


        </b-card>
        <b-card class="s-card">


        </b-card>
      </b-col>
      <b-col class="col-xs-12 col-sm-9 col-md-9">
        <b-card class="m-card">

        </b-card>
      </b-col>
    </b-row>
  </div>
</template>
<script>
const BaseTable = () => import('@/components/base/table/BATB_001_BaseTable');
const collectorModel = {
    collector_id: null,
    name: null,
    state: null,
    email: null,
    priority: null,
    resource_type: null,
    default_collect_state: null,
    last_collected_at: null,
    created_at: null,
    tags: []
};
export default {
    name: 'CredentialsData',
    components: {
        BaseTable
    },
    props: {
        collectorData: {
            type: Object,
            default: () => (collectorModel),
            required: true
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
                { key: 'credential_id', label: this.tr('COL_NM.ID'), sortable: true, ajaxSortable: true, thStyle: { width: '120px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: true, thStyle: { width: '150px' }},
                { key: 'project', label: this.tr('COL_NM.PROJ'), sortable: true, ajaxSortable: true, thStyle: { width: '170px' }},
                {
                    key: 'created_at',
                    label: this.tr('COL_NM.CREATED'),
                    sortable: true,
                    ajaxSortable: true,
                    filterByFormatted: true,
                    formatter: (val) => {
                        return this.getComputedTime(val, localStorage.getItem('timezone'));
                    } ,
                    thStyle: { width: '160px' }
                },
                { key: 'verified', label: this.tr('COL_NM.VERIFIED'), sortable: true, ajaxSortable: true, thStyle: { width: '200px' }}
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
            debugger;
            const credential_group_id = this.collectorData.plugin_info.credential_group_id;
            const credential_id = this.collectorData.plugin_info.credential_id;
            let mergeGroup = [];
            let merge = (a, b, p) => a.filter(aa => ! b.find ( bb => aa[p] === bb[p])).concat(b);

            try {

                if (!this.isEmpty(credential_group_id)) {
                    let response = await this.getCredentials(credential_group_id, 'credential-group');
                    if (!this.isEmpty(response.data)){
                        const credentails = response.data.results[0].credentials;
                        mergeGroup = credentails;
                    }
                }

                if (!this.isEmpty(credential_id)) {
                    let response = await this.getCredentials(credential_id, 'credential');
                    if (!this.isEmpty(response.data)){
                        this.tableData = this.isEmpty(mergeGroup) ? response.data.results : merge(mergeGroup, response.data.results, 'credential_id');
                    }
                }

                this.totalCount = this.tableData.length;

            } catch (err) {
                this.alertError(err);
            }
            this.isLoading = false;
        },
        reset () {
            this.isLoading = true;
            this.tableData = [];
        },
        onClickCollectData () {
            alert(1);
        },
        onClickVerify () {
            alert(2);
        },
        onClickSecurityGroup () {
            this.activeNav = this.collectorDataKeyEnum.SG;
            this.listCredentialsData();
        },
        portRangeFormatter (val, key, data) {
            return `${data.port_range_min} - ${data.port_range_max}`;
        },
        tagFormatter (tags) {
            let keys = Object.keys(tags);
            let results = '';
            keys.map((key) => {
                results += ` ${key}: ${tags[key]}`;
            });
            return results;
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
  .s-card {
    min-height: 30vh;
    margin: 5px -5px 5px 10px;
  }
  .m-card {
    min-height: 60vh;
    margin: 5px 10px 5px -5px;
  }
</style>
