<template>
  <b-col xs="12" lg="12">
    <b-card>
      <b-tabs v-model="tabIndex[0]">
        <b-tab active>
          <template slot="title">
            <i class="icon-calculator"></i> {{tabs[0]}}
          </template>
          <br>
        </b-tab>
        <b-tab>
          <template slot="title">
            <i class="icon-basket-loaded"></i> {{tabs[1]}}
          </template>
          <br>
        </b-tab>
        <b-tab>
          <template slot="title">
            <i class="icon-pie-chart"></i> {{tabs[2]}}
          </template>
          <br>
        </b-tab>
      </b-tabs>
    </b-card>
    <b-row>
      <slot>

      </slot>
    </b-row>
  </b-col>
</template>

<script>

  import {api} from '@/setup/api'

  export default {
    name: 'BaseTabs',
    components: {
    },
    props: {

    },

    data() {
      return {
        tabIndex: [0, 0],
        tabs: [
          'SUMMARY',
          'MEMBER',
          'AUDIT'
        ]
      }
    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>
  @import '../../assets/css/sl-vue-tree-ecessntial.css';

  .conmenu-leaf {
    border-bottom: #181b1e;
  }

  .contextmenu {
    position: absolute;
    background-color: #fff;
    color: #23282c;
    border: 1px solid #c8ced3;
    border-color: #20a8d8;
    border-radius: 0.25rem;
    cursor: pointer;
    z-index: 99999;
  }

  .contextmenu > div {
    padding: 10px;
  }

  .contextmenuleaf {
    border-bottom: 0.5px solid #c8ced3;
  }

  .contextmenu > div:hover {
    background-color: rgba(159, 206, 255, 0.5);
  }


  .last-event {
    color: white;
    background-color: rgba(100, 100, 255, 0.5);
    padding: 10px;
    border-radius: 2px;
  }

  .tree-container {
    flex-grow: 1;
  }

  .sl-vue-tree.sl-vue-tree-root {
    flex-grow: 1;
    overflow-x: hidden;
    overflow-y: auto;
    height: 600px;
    //height: 50vw;
  }

  .item-icon {
    display: inline-block;
    text-align: left;
    width: 20px;
  }
</style>
