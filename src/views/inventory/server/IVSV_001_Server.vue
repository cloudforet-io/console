<template>
  <div class="animated fadeIn">
    <b-row class="server-table">
      <b-col cols="12">
        <BaseTable :table-data="servers" :fields="fields" :per-page="perPage"
                   :searchable="true" :total-rows="totalCount" :search-context-data="queryData"
                   :busy="isLoading" :cardless="false" :underlined="true"
                   @rowSelected="rowSelected" @list="listServers" @limitChanged="limitChanged"
        >
          <template #caption>
            <div>
              <BaseModal :name="'addServer'" :title="'Add Server'" :centered="true" :hide-footer="true">
                <template #activator>
                  <b-button class="btn" variant="outline-dark">
                    Add
                  </b-button>
                </template>
                <template #contents>
                  <ServerDetail :creatable="true" :updatable="true" />
                </template>
              </BaseModal>
              <BaseModal v-if="selectedServer" :name="'editServer'" :title="'Edit Server'"
                         :centered="true" :hide-footer="true"
              >
                <template #activator>
                  <b-button class="btn" variant="outline-primary">
                    Edit
                  </b-button>
                </template>
                <template #contents>
                  <ServerDetail :updatable="true" :server-prop="selectedServer" />
                </template>
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
          <template #INFO>
            <ServerDetail :server-prop="selectedServer" />
          </template>
        </BaseTabNav>
        <!-- <b-tabs v-if="selectedServer">
          <b-tab active>
            <template slot="title">
              <i class="icon-info mr-1" /> Server Information
            </template>
            <div slot="header">
              <strong>Server Detail</strong>
            </div>
            <ServerDetail v-if="selectedServer" :server-prop="selectedServer" />
          </b-tab>
        </b-tabs> -->
      </b-col>
    </b-row>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import query from './search_context/query.js';
import ServerDetail from '@/views/inventory/server/IVSV_002_ServerDetail';
const BaseModal = () => import('@/components/base/modal/BAMO_001_BaseModal');
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

export default {
    name: 'Server',
    components: {
        BaseTable,
        BaseModal,
        ServerDetail,
        BaseTabNav
    },
    data () {
        return {
            fields: [
                { key: 'selected' },
                { key: 'serverId', label: 'ID', sortable: true, ajaxSortable: false },
                { key: 'name', label: 'Name', sortable: true, ajaxSortable: true },
                { key: 'email', label: 'Email', sortable: true, ajaxSortable: false },
                { key: 'mobile', label: 'Phone', sortable: true, ajaxSortable: false },
                { key: 'group', label: 'Group Name', sortable: true, ajaxSortable: false },
                { key: 'language', label: 'Language', sortable: true, ajaxSortable: false },
                { key: 'domainId', label: 'Domain ID' }
            ],
            tabs: [
                {
                    tabTitle: 'INFO',
                    component: ServerDetail
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

            if (limit === undefined || limit === null) {
                limit = 10;
            }
            if (skip === undefined || skip === null) {
                skip = 0;
            }
            if (sort === undefined || sort === null) {
                sort = '-created_date';
            }
            if (search === undefined || search === null) {
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
