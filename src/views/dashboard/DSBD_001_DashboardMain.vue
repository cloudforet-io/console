<template>
  <div class="animated fadeIn dashboard-container">
    <main>
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
    </main>
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
    text-align: center;
    main {
        display: inline-block;
        width: 100%;
        max-width: 1080px;
        padding: 40px 15px;
        text-align: left;
        .row {
            margin: 0 0 60px 0;
        }
        .board-title {
            font-size: 1.2rem;
            font-weight: 600;
        }
    }
}
</style>
