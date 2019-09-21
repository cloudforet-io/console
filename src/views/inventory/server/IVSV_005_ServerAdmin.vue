<template>
  <b-card class="base first-tab">
    <BaseTable :table-data="tableData" 
               :fields="fields"
               :selectable="false"
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
               @list="listServerAdmin"
    >
      <template #caption />
    </BaseTable>
  </b-card>
</template>

<script>
const BaseTable = () => import('@/components/base/table/BATB_001_BaseTable');

export default {
    name: 'ServerAdmin',
    components: {
        BaseTable
    },
    props: {
        serverId: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
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
                { key: 'user_id', label: this.tr('COL_NM.ID'), sortable: true, formatter: this.userInfoFormatter, thStyle: { width: '150px' }},
                { key: 'name', label: this.tr('COL_NM.NAME'), sortable: true, formatter: this.userInfoFormatter, thStyle: { width: '150px' }},
                { key: 'email', label: this.tr('COL_NM.EMAIL'), sortable: true, formatter: this.userInfoFormatter, thStyle: { width: '180px' }},
                { key: 'group', label: this.tr('COL_NM.GROUP'), sortable: true, formatter: this.userInfoFormatter, thStyle: { width: '130px' }}
            ];
        }
    },
    watch: {
        serverId () {
            this.reset();
            this.listServerAdmin();
        }
    },
    created () {
        this.listServerAdmin();
    },
    methods: {
        setQuery (limit, start, sort, keyword) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.keyword = keyword || '';
        },
        async listServerAdmin (limit, start, sort, keyword) {
            this.reset();
            this.setQuery(limit, start, sort, keyword);
            try {
                let res = await this.$axios.post('/inventory/server/admin/list', { 
                    domain_id: sessionStorage.getItem('domainId'),
                    server_id: this.serverId,
                    query: this.query
                });
                this.tableData = res.data.results;
                this.totalCount = res.data.total_count;
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
            this.listServerAdmin();
        },
        userInfoFormatter (val, key, data) {
            return data.user_info ? data.user_info[key] : '';
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
