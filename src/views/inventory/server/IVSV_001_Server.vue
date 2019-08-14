<template>
  <div class="animated fadeIn">
    <BaseDragY>
      <template #container="{ height }">
        <BaseTable :table-data="servers"
                   :fields="fields"
                   :per-page="perPage"
                   :searchable="true"
                   :total-rows="totalCount"
                   :search-context-data="queryData"
                   :busy="isLoading"
                   :height="height"
                   :cardless="false"
                   :underlined="true"
                   @rowSelected="rowSelected"
                   @list="listServers"
                   @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <BaseModal ref="addServer"
                         title="Add Server"
                         :centered="true" :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    {{ tr('BTN_ADD') }}
                  </b-button>
                </template>
                <template #contents>
                  cotents
                </template>
              </BaseModal>
              <BaseModal v-if="selectedServer"
                         ref="editServer"
                         title="Edit Server"
                         :centered="true" :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-primary">
                    {{ tr('BTN_DELETE') }}
                  </b-button>
                </template>
                <template #contents />
              </BaseModal>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDragY>

    <b-row>
      <b-col cols="12">
        <BaseTabNav v-if="selectedServer"
                    :key="selectedServer._id"
                    :fill="false"
                    :nav-tabs="tabs"
                    :keep-alive="true"
                    :is-footer-visible="false"
                    :use-slot="true"
        >
          <template #SUMMARY>
            <b-card class="base first-tab">
              <serverSummary />
            </b-card>
          </template>
          <template #DATA>
            <serverData />
          </template>
          <template #RAWDATA>
            <serverRawData />
          </template>
          <template #ADMIN>
            <serverAdmin />
          </template>
          <template #MONITORING>
            <serverMonitoring />
          </template>
          <template #COMMAND>
            <serverCommand />
          </template>
          <template #AUDIT>
            <serverAudit />
          </template>
        </BaseTabNav>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import BaseDragY from '@/components/base/drag/BADG_002_BaseDragY.vue';

import query from './search_context/query.js';
import serverSummary from '@/views/inventory/server/IVSV_002_ServerSummary';
import serverData from '@/views/inventory/server/IVSV_003_ServerData';
import serverRawData from '@/views/inventory/server/IVSV_004_ServerRawData';
import serverAdmin from '@/views/inventory/server/IVSV_005_ServerAdmin';
import serverMonitoring from '@/views/inventory/server/IVSV_006_ServerMonitoring';
import serverCommand from '@/views/inventory/server/IVSV_007_ServerCommand';
import serverAudit from '@/views/inventory/server/IVSV_008_ServerAudit';


export default {
    name: 'Server',
    components: {
        BaseDragY,
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
    data() {
        return {
            fields: [
                { key: 'selected' },
                { key: '_id', label: 'Name', sortable: true, ajaxSortable: false },
                { key: 'name', label: 'ab', sortable: true, ajaxSortable: true },
                { key: 'state', label: 'State', sortable: true, ajaxSortable: true },
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
                    tabIdxTitle: 'SUMMARY'
                },
                {
                    tabTitle: 'DATA',
                    tabIdxTitle: 'DATA'
                },
                {
                    tabTitle: 'RAW DATA',
                    tabIdxTitle: 'RAWDATA'
                },
                {
                    tabTitle: 'ADMIN',
                    tabIdxTitle: 'ADMIN'
                },
                {
                    tabTitle: 'MONITORING',
                    tabIdxTitle: 'MONITORING'
                },
                {
                    tabTitle: 'COMMAND',
                    tabIdxTitle: 'COMMAND'
                },
                {
                    tabTitle: 'AUDIT',
                    tabIdxTitle: 'AUDIT'
                }
            ],
            servers: [],
            selectedServer: null,
            selectedIdx: null,
            addModal: false,
            totalCount: 0,
            queryData: query,
            isReadyForSearch: false,
            perPage: 3,
            isLoading: true
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.listServers(this.perPage, 0);
        },
        reset() {
            this.servers = [];
            this.selectedServer = null;
            this.isLoading = true;
        },

        async listServers(limit, skip, sort, search) {

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

            await this.$axios.post('/identity/user/list', {
                params: { limit, skip, sort }
            }).then((response) => {
                this.servers = response.data.results;
                this.totalCount = response.data.total_count;
                this.isLoading = false;
            }).catch((error) => {
                console.error(error);
                this.isLoading = false;
            });

        },
        rowSelected(row) {
            if (row instanceof Array || !row) {
                this.selectedServer = null;
            } else {
                this.selectedServer = row.data;
            }
        },
        limitChanged(val) {
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
        margin: 0 5px;
    }

    .server-table {
        margin-bottom: 20px;
    }
</style>
