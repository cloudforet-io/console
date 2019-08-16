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
            <div class="row">
              <b-col cols="6">
                <BaseModal ref="addServer"
                           title="Add Server"
                           :centered="true" :hide-footer="true"
                >
                  <template #activator>
                    <b-button block variant="primary">
                      {{ tr('BTN_CRT') }}
                    </b-button>
                  </template>
                  <template #contents />
                </BaseModal>
              </b-col>
              <b-col cols="6">
                <b-dropdown class="dropdown" text="Actions" variant="secondary">
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-comment-plus mr-1" />
                          &nbsp;{{ tr('BTN_CRT') }}
                  </b-dropdown-item>
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fal fa-comment-edit mr-1" />
                    {{ tr('BTN_UPT') }}
                  </b-dropdown-item>
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-comment-minus mr-1" />
                    {{ tr('BTN_DELETE') }}
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-exclamation-circle mr-1" />
                    {{ tr('BTN_S_MANT') }}
                  </b-dropdown-item>
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-empty-set mr-1" />
                    {{ tr('BTN_US_MANT') }}
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-comment-alt-edit mr-1" />
                    {{ tr('CHG_PRO') }}
                  </b-dropdown-item>
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-comment-alt-edit mr-1" />
                    {{ tr('CHG_POOL') }}
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-file-import mr-1" />
                    &nbsp;{{ tr('IMPORT') }}
                  </b-dropdown-item>
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-file-export mr-1" />
                    {{ tr('EXPORT') }}
                  </b-dropdown-item>
                  <b-dropdown-divider />
                  <b-dropdown-item class="b-dro-pad">
                    <i class="fad fa-sync mr-1" />
                    {{ tr('COL_INFO') }}
                  </b-dropdown-item>
                </b-dropdown>
              </b-col>
            </div>
          </template>
        </BaseTable>
      </template>
    </BaseDragY>

    <b-row>
      <b-col cols="12">
        <BaseTabNav v-if="selectedServer"
                    :key="selectedServer.user_id"
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
        serverAdmin

    },
    data() {
        return {
            tabs: [
                {
                    tabTitle: this.tr('COL_NM.C_SUMMARY'),
                    tabIdxTitle: 'SUMMARY'
                },
                {
                    tabTitle: this.tr('COL_NM.C_DT'),
                    tabIdxTitle: 'DATA'
                },
                {
                    tabTitle: this.tr('COL_NM.C_RAW_DT'),
                    tabIdxTitle: 'RAWDATA'
                },
                {
                    tabTitle: this.tr('COL_NM.C_ADMIN'),
                    tabIdxTitle: 'ADMIN'
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
    computed: {
        fields () {
            return [
                { key: 'selected' },
                { key: 'user_id', label: this.tr('COL_NM.NAME'), sortable: true, ajaxSortable: false },
                { key: 'name', label: this.tr('COL_NM.STATE'), sortable: true, ajaxSortable: true },
                { key: 'state', label: this.tr('COL_NM.IP'), sortable: true, ajaxSortable: true },
                { key: 'password', label: this.tr('COL_NM.CORE'), sortable: true, ajaxSortable: false },
                { key: 'user_first_name', label: this.tr('COL_NM.MEMORY'), sortable: true, ajaxSortable: false },
                { key: 'user_last_name', label: this.tr('COL_NM.O_TYPE'), sortable: true, ajaxSortable: false },
                { key: 'mobile', label: this.tr('COL_NM.O_DIS'), sortable: true, ajaxSortable: false },
                { key: 'role_id', label: this.tr('COL_NM.SE_TYPE'), sortable: true, ajaxSortable: false },
                { key: 'project_id', label: this.tr('COL_NM.PLATFORM'), sortable: true, ajaxSortable: true },
                { key: 'pp', label: this.tr('COL_NM.PROJ'), sortable: true, ajaxSortable: false },
                { key: 'pool', label: this.tr('COL_NM.POOL'), sortable: true, ajaxSortable: false },
                { key: 'project_group_id', label: this.tr('COL_NM.UPDATE'), sortable: true, ajaxSortable: false },
                { key: 'query', label: this.tr('COL_NM.DISK_SZ'), sortable: true, ajaxSortable: false }
            ];
        }
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

    .b-dro-pad {
     padding: 0px 10px 0px 10px;
    }

</style>
