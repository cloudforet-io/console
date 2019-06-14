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
             @row-clicked="rowClicked"
    >
      <template slot="status" slot-scope="data">
        <b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge>
      </template>
    </b-table>
    <b-button type="button" @click.prevent="onPrev">
      Prev
    </b-button>
    <b-button type="button" @click.prevent="onNext">
      Next
    </b-button>
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
    rowClickedFn: {
      type: Function,
      default: () => () => {}
    },
    totalRows: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      currentPage: 1,
      selected: null
    }
  },
  computed: {
    items () {
      console.log('item computed', this.tableData.map(item => (item.name)))
      return this.tableData
    },
    captions () { return this.fields },
    maxPage () { return Math.ceil(this.totalRows / this.perPage) }
  },
  methods: {
    getBadge (status) {
      return status === 'Active' ? 'success'
        : status === 'Inactive' ? 'secondary'
          : status === 'Pending' ? 'warning'
            : status === 'Banned' ? 'danger' : 'primary'
    },
    rowClicked (item, idx, target) {
      if (this.selected) {
        delete this.selected._rowVariant
        this.tableData.splice(idx, 1, this.selected)
      }
      this.selected = Object.assign({}, item, { _rowVariant: 'success' })
      this.tableData.splice(idx, 1, this.selected)
      this.rowClickedFn(item, idx, target)
    },
    onPrev () {
      console.log('prev')
      if (this.currentPage <= 1) return
      this.currentPage--
      this.listFn(this.perPage, this.currentPage * this.perPage)
    },
    onNext () {
      console.log('next')
      if (this.currentPage >= this.maxPage) return
      this.currentPage++
      this.listFn(this.perPage, this.currentPage * this.perPage)
    }
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
