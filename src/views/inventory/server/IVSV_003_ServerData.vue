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
              <div class="row">
                <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
                  <b-card class="base summary border-top-0">
                    Audit
                  </b-card>
                </b-col>
              </div>
            </template>
            <template #MOUNT>
              <div class="row">
                <b-col class="col-xs-6 col-sm-6 col-md-6 col-lg-12">
                  <b-card class="base summary border-top-0">
                    Audit
                  </b-card>
                </b-col>
              </div>
            </template>
            <template #ROUTE/>
            <template #PORT/>
            <template #PCI/>
            <template #SOFTWARE/>
            <template #WINUPDATE/>
            <template #SHARE/>
            <template #SECURITYGROUP/>
          </BaseTabNav>
        </b-col>
      </b-card>
    </b-col>
  </div>
</template>

<script>
import BaseTable from '@/components/base/table/BATB_001_BaseTable';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal';
import BaseTabNav from '@/components/base/tab/BATA_002_BaseTabNav';

export default {
    name: 'ServerData',
    components: {
        BaseTable,
        BaseModal,
        BaseTabNav
    },
    props: {

    },
    data () {
        return {
            tabs: [
                {
                    tabTitle: 'DISK',
                    tabIdxTitle: 'DISK'
                },
                {
                    tabTitle: 'MOUNT',
                    tabIdxTitle: 'MOUNT'
                },
                {
                    tabTitle: 'NIC',
                    tabIdxTitle: 'NIC'
                },
                {
                    tabTitle: 'ROUTE',
                    tabIdxTitle: 'ROUTE'
                },
                {
                    tabTitle: 'PORT',
                    tabIdxTitle: 'PORT'
                },
                {
                    tabTitle: 'PCI',
                    tabIdxTitle: 'PCI'
                },
                {
                    tabTitle: 'SOFTWARE',
                    tabIdxTitle: 'SOFTWARE'
                },
                {
                    tabTitle: 'WIN UPDATE',
                    tabIdxTitle: 'WINUPDATE'
                },
                {
                    tabTitle: 'SHARE',
                    tabIdxTitle: 'SHARE'
                },
                {
                    tabTitle: 'SECURITY GROUP',
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
