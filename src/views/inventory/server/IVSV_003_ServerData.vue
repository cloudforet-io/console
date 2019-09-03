<template>
  <b-row>
    <b-col cols="6" lg="12">
      <b-card class="base first-tab">
        <b-col cols="12">
          <BaseTabNav tabs
                      pill
                      keep-alive
                      use-slot
                      :fill="false"
                      :nav-tabs="tabs"
                      :is-footer-visible="false"
          >
            <template #DISK>
              <DataDisk />
            </template>
            <template #NIC>
              <DataNIC />
            </template>
            <template #SECURITYGROUP>
              <DataSecurityGroup />
            </template>
          </BaseTabNav>
        </b-col>
      </b-card>
    </b-col>
  </b-row>
</template>
<script>
const BaseTabNav = () => import('@/components/base/tab/BATA_002_BaseTabNav');

const DataDisk = () => import('@/views/inventory/server/inner_data_tabs/SVID_001_DataDisk');
const DataNIC = () => import('@/views/inventory/server/inner_data_tabs/SVID_003_DataNIC');
const DataSecurityGroup = () => import('@/views/inventory/server/inner_data_tabs/SVID_010_DataSecurityGroup');

export default {
    name: 'ServerData',
    components: {
        BaseTabNav,
        DataDisk,
        DataNIC,
        DataSecurityGroup
    },
    props: {

    },
    data () {
        return {
            tabs: [
                {
                    tabTitle: this.tr('COL_NM.C_DISK'),
                    tabIdxTitle: 'DISK'
                },
                {
                    tabTitle: this.tr('COL_NM.C_NIC'),
                    tabIdxTitle: 'NIC'
                },
                {
                    tabTitle: this.tr('COL_NM.C_SR_GROUP'),
                    tabIdxTitle: 'SECURITYGROUP'
                }
            ],
            data: [],
            selectedData: null,
            selectedDataIdx: null
        };
    },

    watch: {

    },
    methods: {
        initTabs () {

        }
    }
};
</script>

<style lang="scss" scoped>
  .card.base {
    margin-top: 10px;
    margin-bottom: 10px;
    &.summary {
      margin-top: 0;
      border-top-left-radius: 0px !important;
    }
  }
</style>
