<template>
  <div class="animated fadeIn dashboard-container">
    <b-row>
      <b-col cols="12">
        <p class="board-title">
          Summary
        </p>
        <Summary />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <p class="board-title">
          Collection State
        </p>
        <CollectionState />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <p class="board-title">
          Server State
        </p>
        <ServerState />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Summary from '@/views/dashboard/DSBD_002_Summary';
import CollectionState from '@/views/dashboard/DSBD_003_CollectionState';
import ServerState from '@/views/dashboard/DSBD_004_ServerState';


export default {
    name: 'Dashboard',
    components: {
        Summary,
        CollectionState,
        ServerState
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
    padding: 40px 15px;
    .row {
        margin: 0;
    }
    .board-title {

    }
}
</style>
