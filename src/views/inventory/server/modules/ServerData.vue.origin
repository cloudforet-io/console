<template>
  <b-card class="base first-tab">
    <BaseTable :table-data="tableData" 
               :fields="fields"
               :selectable="false"
               :dark-header="false"
               :caption-width="900"
               :search-width="300"
               :busy="isLoading"
               :per-page="query.page.limit"
               :total-rows="totalCount"
               plain-search
               cardless
               underlined
               searchable
               @limitChanged="limitChanged"
               @list="listServerData"
    >
      <template #caption>
        <b-nav class="nav-container" pills>
          <b-nav-item :active="activeNav === serverDataKeyEnum.DISK"
                      @click.prevent="onClickDisk"
          >
            {{ tr('COL_NM.C_DISK') }}
          </b-nav-item>
          <b-nav-item :active="activeNav === serverDataKeyEnum.NIC"
                      @click.prevent="onClickNic"
          >
            {{ tr('COL_NM.C_NIC') }}
          </b-nav-item>
          <b-nav-item :active="activeNav === serverDataKeyEnum.SG"
                      @click.prevent="onClickSecurityGroup"
          >
            {{ tr('COL_NM.C_SR_GROUP') }}
          </b-nav-item>
          <b-nav-item>MOUNT</b-nav-item>
          <b-nav-item>ROUTE</b-nav-item>
          <b-nav-item>PORT</b-nav-item>
          <b-nav-item>PCI</b-nav-item>
          <b-nav-item>SOFTWARE</b-nav-item>
          <b-nav-item>SERVICE</b-nav-item>
          <b-nav-item>WIN UPDATE</b-nav-item>
          <b-nav-item>SHARE</b-nav-item>
        </b-nav>
      </template>

      <template v-for="cellSlot in customSlotNames"
                :slot="`CELL_${cellSlot}`" 
                slot-scope="{ data, field }"
      >
        <span v-for="(addrs, idx) in data.item.ip_addresses" 
              :key="`${cellSlot}_${field.key}_${idx}`"
        >
          {{ addrs[field.key] || '' }}
          <br v-if="addrs[field.key]">
        </span>
      </template>
    </BaseTable>
  </b-card>
</template>

<script>
const BaseTable = () => import('@/components/base/table/BaseTable');

export default {
    name: 'ServerData',
    components: {
        BaseTable
    },
    props: {
        serverData: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            serverDataKeyEnum: Object.freeze({
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
        diskFields () {
            return [
                { key: 'device_index', label: '#', sortable: true, thStyle: { width: '50px' }},
                { key: 'device', label: this.tr('COL_NM.DEVICE'), sortable: true, thStyle: { width: '150px' }},
                { key: 'disk_type', label: this.tr('COL_NM.TYPE'), sortable: true, thStyle: { width: '150px' }},
                { key: 'size', label: this.tr('COL_NM.SIZE'), sortable: true, thStyle: { width: '150px' }},
                { 
                    key: 'tags', 
                    label: this.tr('COL_NM.TAG'), 
                    sortable: true, 
                    formatter: this.tagFormatter,
                    thStyle: { width: '150px' }
                }
            ];
        },
        nicFields () {
            return [
                { key: 'device_index', label: '#', sortable: true, thStyle: { width: '50px' }},
                { key: 'device', label: this.tr('COL_NM.DEVICE'), sortable: true, thStyle: { width: '150px' }},
                { key: 'ip_address', label: this.tr('COL_NM.IP'), thStyle: { width: '150px' }},
                { key: 'cidr', label: this.tr('COL_NM.CIDR'), thStyle: { width: '150px' }},
                { key: 'subnet_id', label: this.tr('COL_NM.NETWORK'), thStyle: { width: '150px' }},
                { key: 'mac_address', label: this.tr('COL_NM.MAC'), sortable: true, thStyle: { width: '150px' }},
                { 
                    key: 'tags', 
                    label: this.tr('COL_NM.TAG'), 
                    sortable: true, 
                    formatter: this.tagFormatter,
                    thStyle: { width: '150px' }
                }
            ];
        },
        securityGroupFields () {
            return [
                { key: 'direction', label: this.tr('COL_NM.DIRECTION'), sortable: true, thStyle: { width: '50px' }},
                { key: 'protocol', label: this.tr('COL_NM.PROTOCOL'), sortable: true, thStyle: { width: '150px' }},
                { key: 'port_range', label: this.tr('COL_NM.PORT_RANGE'), formatter: this.portRangeFormatter, thStyle: { width: '150px' }},
                { key: 'remote_cidr', label: this.tr('COL_NM.SRC_DEST'), formatter: this.remoteFormatter, thStyle: { width: '150px' }},
                { key: 'security_group_name', label: this.tr('COL_NM.SG_NAME'), thStyle: { width: '150px' }},
                { key: 'security_group_id', label: this.tr('COL_NM.SG_ID'), sortable: true, thStyle: { width: '150px' }}
            ];
        },
        fields () {
            if (this.activeNav === this.serverDataKeyEnum.DISK) {
                return this.diskFields;
            } else if (this.activeNav === this.serverDataKeyEnum.NIC) {
                return this.nicFields;
            } else {
                return this.securityGroupFields;
            }
        },
        customSlotNames () {
            if (this.activeNav === this.serverDataKeyEnum.NIC) {
                return ['cidr', 'ip_address', 'subnet_id'];
            } else {
                return [];
            }
        }
    },
    watch: {
        serverData () {
            this.reset();
            this.listServerData();
        }
    },
    created () {
        this.activeNav = this.serverDataKeyEnum.DISK;
        this.listServerData();
    },
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
                let res = await this.$http.post('/inventory/server/get-data', {
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
        },
        onClickDisk () {
            this.activeNav = this.serverDataKeyEnum.DISK;
            this.listServerData();
        },
        onClickNic () {
            this.activeNav = this.serverDataKeyEnum.NIC;
            this.listServerData();
        },
        onClickSecurityGroup () {
            this.activeNav = this.serverDataKeyEnum.SG;
            this.listServerData();
        },
        portRangeFormatter (val, key, data) {
            return `${data.port_range_min} - ${data.port_range_max}`;
        },
        remoteFormatter (val, key, data) {
            return data.remote_cidr || data.remote_group_id;
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
            this.listServerData();
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
