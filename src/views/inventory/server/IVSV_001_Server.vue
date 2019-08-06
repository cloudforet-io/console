<template>
  <div class="animated fadeIn">
    <b-row class="server-table">
      <b-col cols="12">
        <BaseTable :table-data="servers"
                   :fields="fields"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :search-context-data="queryData"
                   :busy="isLoading"
                   :cardless="false"
                   :underlined="true"
                   @rowSelected="rowSelected"
                   @list="listServers"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <BaseModal :name="'addServer'" :title="'Add Server'" :centered="true" :hide-footer="true">
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    Add
                  </b-button>
                </template>
                <template #contents />
              </BaseModal>
              <BaseModal v-if="selectedServer" :name="'editServer'" :title="'Edit Server'"
                         :centered="true" :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-primary">
                    Edit
                  </b-button>
                </template>
                <template #contents />
              </BaseModal>
            </div>
          </template>
        </BaseTable>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <BaseTabNav v-if="selectedServer"
                    :fill="false"
                    :nav-tabs="tabs"
                    :keep-alive="true"
                    :is-footer-visible="false"
                    :use-slot="true"
        >
          <template #SUMMARY>
            <serverSummary>
            </serverSummary>
          </template>
          <template #DATA>
            <serverData>
            </serverData>
          </template>
          <template #RAWDATA>
            <serverRawData> </serverRawData>
          </template>
          <template #ADMIN>
            <serverAdmin> </serverAdmin>
          </template>
          <template #MONITORING>
            <serverMonitoring> </serverMonitoring>
          </template>
          <template #COMMAND>
            <serverCommand> </serverCommand>
          </template>
          <template #AUDIT>
            <serverAudit> </serverAudit>
          </template>
        </BaseTabNav>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import query from './search_context/query.js';
import serverSummary from '@/views/inventory/server/IVSV_002_ServerSummary';
import serverData from '@/views/inventory/server/IVSV_003_ServerData';
import serverRawData from '@/views/inventory/server/IVSV_004_ServerRawData';
import serverAdmin from '@/views/inventory/server/IVSV_005_ServerAdmin';
import serverMonitoring from '@/views/inventory/server/IVSV_006_ServerMonitoring';
import serverCommand from '@/views/inventory/server/IVSV_007_ServerCommand';
import serverAudit from '@/views/inventory/server/IVSV_008_ServerAudit';


const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

export default {
    name: 'Server',
    components: {
        BaseTable,
        BaseModal,
        BaseTabNav,
        serverSummary,
        serverData,
        serverRawData,
        serverAdmin,
        serverMonitoring,
        serverCommand,
        serverAudit

    },
    data () {
        return {
            fields: [
                { key: 'selected' },
                { key: '_id', label: 'Name', sortable: true, ajaxSortable: false },
                { key: 'user_name', label: 'State', sortable: true, ajaxSortable: true },
                { key: 'password', label: 'IP', sortable: true, ajaxSortable: false },
                { key: 'user_first_name', label: 'Core', sortable: true, ajaxSortable: false },
                { key: 'user_last_name', label: 'Memory', sortable: true, ajaxSortable: false },
                { key: 'mobile', label: 'OS Type', sortable: true, ajaxSortable: false },
                { key: 'role_id', label: 'OS Distro', sortable: true, ajaxSortable: false },
                { key: 'project_id', label: 'Server Type', sortable: true, ajaxSortable: true },
                { key: 'project_group_id', label: 'Platform', sortable: true, ajaxSortable: false },
                { key: 'query', label: 'Disk Size', sortable: true, ajaxSortable: false }
            ],
            tabs: [
                {
                    tabTitle: 'SUMMARY',
                },
                {
                    tabTitle: 'DATA',
                },
                {
                    tabTitle: 'RAW DATA',
                },
                {
                    tabTitle: 'ADMIN',
                },
                {
                    tabTitle: 'MONITORING',
                },
                {
                    tabTitle: 'COMMAND',
                },
                {
                    tabTitle: 'AUDIT',
                }
            ],
            defaultTab: 0,
            servers: [],
            selectedServer: null,
            selectedIdx: undefined,
            addModal: false,
            totalCount: 17,
            queryData: query,
            isReadyForSearch: false,
            perPage: 3,
            isLoading: true
        };
    },
    mounted () {
        this.init();
    },
    methods: {
        init () {
            this.listServers(this.perPage, 0);
        },
        reset () {
            this.servers = [];
            this.selectedServer = null;
            this.isLoading = true;
        },
        async listServers (limit, skip, sort, search) {
            this.reset();

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
                search = [];
            }
            let res;
            try {
                res = await this.$axios.get('/identity/user', {
                    params: { limit, skip, sort }
            /**
             * TODO: set limit, skip, sort and search in the right format
             */
                });
            } catch (e) {
                console.error(e);
            }

            setTimeout(() => { // this is for test
                this.servers = res.data;
                this.isLoading = false;
            }, 1000);
        /**
         * TODO: set totalCount with data from server
         */
        },
        rowSelected (row) {
            if (row instanceof Array || !row) {
                this.selectedServer = null;
            } else {
                this.selectedServer = row.data;
            }
        },
        limitChanged (val) {
            this.perPage = Number(val);
            this.init();
        }
    }
};
</script>

<style lang="scss" scoped>
  .animated.fadeIn {
    padding: $top-pad $side-pad $bottom-pad $side-pad;
  }
  .base-table {
    @extend %sheet;
  }
  .btn {
    padding: 3px 15px;
    margin: 0 5px;
  }
  .server-table {
    margin-bottom: 20px;
  }
</style>
