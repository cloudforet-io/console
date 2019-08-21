<template>
  <div class="row">
    <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
      <b-card class="base summary border-top-0">
        <b-col cols="12">
          <BaseTabNav
            :tabs="true"
            :pill="true"
            :fill="false"
            :nav-tabs="tabs"
            :keep-alive="true"
            :is-footer-visible="false"
            :use-slot="true"
          >
            <template #DISK>
              <data-disk />
            </template>
            <template #NIC>
              <data-n-i-c />
            </template>
            <template #SECURITYGROUP>
              <data-security-group />
            </template>
          </BaseTabNav>
        </b-col>
      </b-card>
    </b-col>
  </div>
</template>
<script>
import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';
import dataDisk from '@/views/inventory/server/inner_data_tabs/SVID_001_DataDisk.vue';
import dataNIC from '@/views/inventory/server/inner_data_tabs/SVID_003_DataNIC.vue';

import dataSecurityGroup from '@/views/inventory/server/inner_data_tabs/SVID_010_DataSecurityGroup.vue';


export default {
    name: 'ServerData',
    components: {
        BaseTabNav,
        dataDisk,
        dataNIC,
        dataSecurityGroup
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
