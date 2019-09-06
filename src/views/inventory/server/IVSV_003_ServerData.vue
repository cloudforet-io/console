<template>
  <b-card class="base first-tab">
    <BaseTable :table-data="data" 
               :fields="fields"
               :selectable="false"
               :dark-header="false"
               :caption-width="500"
               :search-width="300"
               no-context-searchable
               cardless
               underlined
    >
      <template #caption>
        <b-nav class="nav-container" pills>
          <b-nav-item :active="activeNav === 'disk'" 
                      @click="onClickDisk"
          >
            {{ tr('COL_NM.C_DISK') }}
          </b-nav-item>
          <b-nav-item :active="activeNav === 'nic'"
                      @click="onClickNic"
          >
            {{ tr('COL_NM.C_NIC') }}
          </b-nav-item>
          <b-nav-item :active="activeNav === 'securityGroup'"
                      @click="onClickSecurityGroup"
          >
            {{ tr('COL_NM.C_SR_GROUP') }}
          </b-nav-item>
        </b-nav>
      </template>
    </BaseTable>
  </b-card>
</template>

<script>
const BaseTable = () => import('@/components/base/table/BATB_001_BaseTable');

export default {
    name: 'ServerData',
    components: {
        BaseTable
    },
    props: {

    },
    data () {
        return {
            activeNav: 'disk',
            data: []
        };
    },
    computed: {
        fields () {
            return [];
        }
    },
    methods: {
        onClickDisk () {
            this.activeNav = 'disk';
        },
        onClickNic () {
            this.activeNav = 'nic';
        },
        onClickSecurityGroup () {
            this.activeNav = 'securityGroup';
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
