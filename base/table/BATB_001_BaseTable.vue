<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col cols="12" md="2" class="mb-md-0 mb-3">
          {{ caption }}
        </b-col>
        <b-col cols="10" md="6" xl="7" class="mb-md-0 mb-3">
          <BaseSearch v-if="searchable" :query-data="queryData" @search="onSearch" />
        </b-col>
        <b-col cols="12" md="4" xl="3" class="text-right">
          <b-button type="button" @click.prevent="onPrev">
            Prev
          </b-button>
          <span class="ml-2">
            {{ currentPage }} / {{ maxPage }}
          </span>
          <b-button type="button" class="ml-2" @click.prevent="onNext">
            Next
          </b-button>
          <b-button type="button" class="ml-4 refresh-btn"
                    variant="light" @click="onRefresh"
          >
            <i class="icon-refresh" />
          </b-button>
        </b-col>
      </b-row>
    </div>
    <b-table class="b-table" :dark="dark" :hover="hover" :striped="striped" :bordered="bordered"
             :small="small" :fixed="fixed" responsive="sm" :items="items" :fields="captions"
             @row-clicked="rowClicked" @sort-changed="sortingChanged"
    >
      <template slot="status" slot-scope="data">
        <b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge>
      </template>
    </b-table>
  </b-card>
</template>

<script>
import BaseSearch from '@/components/base/search/BASR_001_BaseSearch.vue'
export default {
  name: 'BaseTable',
  event: ['list'],
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
    queryData: {
      type: Array,
      default: () => []
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
      default: 10
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
      selectedRow: null,
      sortBy: undefined,
      searchList: []

    }
  },
  computed: {
    items () {
      console.log('item computed', this.tableData.map(item => (item.name)))
      return this.tableData
    },
    captions () { return this.fields },
    limit () { return this.perPage },
    skip () { return (this.currentPage - 1) * this.limit },
    maxPage () { return Math.ceil(this.totalRows / this.limit) }
  },
  methods: {
    getBadge (status) {
      return status === 'Active' ? 'success'
        : status === 'Inactive' ? 'secondary'
          : status === 'Pending' ? 'warning'
            : status === 'Banned' ? 'danger' : 'primary'
    },
    rowClicked (item, idx, target) {
      if (this.selectedRow) {
        delete this.selectedRow._rowVariant
        this.tableData.splice(idx, 1, this.selectedRow)
      }
      this.selectedRow = Object.assign({}, item, { _rowVariant: 'success' })
      this.tableData.splice(idx, 1, this.selectedRow)
      this.rowClickedFn(item, idx, target)
    },
    onPrev () {
      if (this.currentPage <= 1) return
      this.currentPage--
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    onNext () {
      if (this.currentPage >= this.maxPage) return
      this.currentPage++
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    sortingChanged (ctx) {
      this.sortBy = ctx.sortDesc ? `-${ctx.sortBy}` : ctx.sortBy
    },
    onRefresh () {
      this.currentPage = 1
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    onSearch (conditionList) {
      this.searchList = conditionList
      this.$emit('list', this.limit, this.skip, this.sortBy, conditionList)
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
