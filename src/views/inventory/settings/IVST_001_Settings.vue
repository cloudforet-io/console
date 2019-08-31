<template>
  <div class="animated fadeIn">
    <BaseDragHorizontal>
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
                         name="addServer" title="Add Server"
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
                         name="editServer"
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
    </BaseDragHorizontal>

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
          <template #BACKEND>
            <serverData />
          </template>
          <template #JOB>
            <serverRawData />
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
import BaseDragHorizontal from '@/components/base/drag/BADG_002_BaseDragHorizontal.vue';

import query from './search_context/query.js';
import serverSummary from '@/views/inventory/settings/IVST_002_SettingsSummary';
import serverData from '@/views/inventory/settings/IVST_003_SettingsBackEnd';
import serverRawData from '@/views/inventory/settings/IVST_004_SettingsJob';


export default {
    name: 'Settings',
    components: {
        BaseDragHorizontal,
        BaseTable,
        BaseModal,
        BaseTabNav,
        serverSummary,
        serverData,
        serverRawData
    },
    data() {
        return {
            fields: [
                { key: 'selected' },
                { key: '_id', label: 'Name', sortable: true, ajaxSortable: false },
                { key: 'user_name', label: 'ab', sortable: true, ajaxSortable: true },
                { key: 'state', label: 'State', sortable: true, ajaxSortable: true },
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
                    tabTitle: 'BACKEND',
                    tabIdxTitle: 'BACKEND'
                },
                {
                    tabTitle: 'JOB',
                    tabIdxTitle: 'JOB'
                }
            ],
            servers: [],
            selectedServer: null,
            selectedIdx: null,
            addModal: false,
            totalCount: 17,
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
            let res;
            try {
                res = await this.$axios.get('/identity/user', {
                    params: { limit, skip, sort }
            /**
             * TODO: set limit, skip, sort and search in the right format
             */
                });
                setTimeout(() => { // this is for test
                    this.servers = res.data;
                    this.isLoading = false;
                }, 500);
          /**
           * TODO: set totalCount with data from server
           */
            } catch (e) {
                console.error(e);
            }
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
    padding: 3px 15px;
    margin: 0 5px;
  }

  .server-table {
    margin-bottom: 20px;
  }
</style>
