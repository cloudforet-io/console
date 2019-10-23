<template>
  <div class="animated fadeIn dashboard-container">
    <main>
      <b-row>
        <b-col cols="5">
          <b-row align-h="start">
            <b-col class="board" cols="12">
              <Summary title="Summary" />
            </b-col>
            <b-col class="board" cols="12">
              <ServerState />
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="7">
          <b-row align-h="end">
            <b-col class="board" cols="12">
              <CollectionState />
            </b-col>
          </b-row>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="5">
          <b-row>
            <b-col class="board" cols="12">
              <ItemsByRegion />
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="7">
          <b-row align-h="end">
            <b-col class="board" cols="12">
              <ServersByType />
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </main>
  </div>
</template>

<script>
import Summary from '@/views/dashboard/modules/Summary';
import CollectionState from '@/views/dashboard/modules/CollectionState';
import ServerState from '@/views/dashboard/modules/ServerState';
import ItemsByRegion from '@/views/dashboard/modules/ItemsByRegion';
import ServersByType from '@/views/dashboard/modules/ServersByType';


export default {
    name: 'Dashboard',
    components: {
        Summary,
        CollectionState,
        ServerState,
        ItemsByRegion,
        ServersByType
    },
    data: function () {
        return {
            chartjs: null
        };
    },
    computed: {
    },
    methods: {
    },
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.$store.dispatch('header/setSubHeader', {
                headerGroup: { label: 'Dashboard', link: '/dashboard', icon: 'fal fa-chart-line' },
                headerList: []
            });
        });
    }
};
</script>

<style lang="scss" scoped>
.dashboard-container {
    text-align: center;
    padding-left: 20px;
    padding-right: 20px;
    main {
        display: inline-block;
        width: 100%;
        padding: 40px 15px;
        text-align: left;
        .board {
            margin: 0 0 40px 0;
            max-width: 100%;
        }
    }
}
</style>
