<script>
import ServerDataTemplate from '@/views/inventory/server/IVSV_003_ServerDataTemplate';

export default {
    name: 'ServerData',
    extends: ServerDataTemplate,
    methods: {
        setQuery (limit, start, sort, keyword) {
            this.query.page.limit = limit || 10;
            this.query.page.start = start || 0;
            this.query.sort = sort || {};
            this.query.keyword = keyword || '';
        },
        async listServerData (limit, start, sort, keyword) {
            this.reset();
            this.setQuery(limit, start, sort, keyword);
            try {
                let res = await this.$axios.post('/inventory/server/get-data', { 
                    domain_id: sessionStorage.getItem('domainId'),
                    server_id: this.serverData.server_id,
                    data_type: this.activeNav,
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
        }
    }
};
</script>