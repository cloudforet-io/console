<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col cols="12" md="2" class="mb-md-0 mb-3">
          {{ caption }}
        </b-col>
        <b-col cols="10" md="8">
          <BaseSearch v-if="searchable" :search-fn="listFn" />
        </b-col>
        <b-col v-if="listFn" cols="1" md="2">
          <div class="refresh-btn text-right">
            <i class="icon-refresh" @click="listFn" />
          </div>
        </b-col>
      </b-row>
    </div>
    <b-table class="b-table" :dark="dark" :hover="hover" :striped="striped" :bordered="bordered"
             :small="small" :fixed="fixed" responsive="sm" :items="items" :fields="captions"
             :current-page="currentPage" :per-page="perPage" @row-clicked="rowClicked"
    >
      <template slot="status" slot-scope="data">
        <b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge>
      </template>
    </b-table>
    <nav>
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage"
                    prev-text="Prev" next-text="Next" hide-goto-end-buttons
      />
    </nav>
  </b-card>
</template>

<script>
import BaseSearch from '@/components/base/BaseSearch.vue'
export default {
  name: 'BaseTable',
  components: {
    BaseSearch
  },
  inheritAttrs: false,
  props: {
    caption: {
      type: String,
      default: 'Table'
    },
    searchable: {
      type: Boolean,
      default: false
    },
    listFn: {
      type: Function,
      default: null
    },
    hover: {
      type: Boolean,
      default: true
    },
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Array,
      default: () => []
    },
    fields: {
      type: [Array, Object],
      default: () => []
    },
    perPage: {
      type: Number,
      default: 5
    },
    dark: {
      type: Boolean,
      default: false
    },
    rowClicked: {
      type: Function,
      default: () => () => {}
    }
  },
  data () {
    return {
      currentPage: 1
      // items: this.tableData
    }
  },
  computed: {
    items () {
      return this.tableData
    },
    totalRows () { return this.getRowCount() },
    captions () { return this.fields }
  },
  methods: {
    getBadge (status) {
      return status === 'Active' ? 'success'
        : status === 'Inactive' ? 'secondary'
          : status === 'Pending' ? 'warning'
            : status === 'Banned' ? 'danger' : 'primary'
    },
    getRowCount () {
      return this.items.length
    }
    // rowClicked () {
    //   let res = this.rowClickedFn()
    //   console.log(res)
    // }
  }
}
</script>

<style lang="scss" scoped>
.b-table {
  cursor: pointer;
}
.refresh-btn i {
  cursor: pointer;
  font-weight: 800;
  font-size: 1.5em;
}
</style>
