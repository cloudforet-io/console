<template>
  <b-card :header="caption">
    <b-table :selectable="selectable" :select-mode="selectMode" :dark="dark" :hover="hover" :striped="striped" :bordered="bordered" :small="small" :fixed="fixed" responsive="sm" :items="items" :fields="captions" :current-page="currentPage" :per-page="perPage" @row-clicked="rowClicked">
      <template slot="status" slot-scope="data">
        <b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge>
      </template>
    </b-table>
    <nav>
      <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" prev-text="Prev" next-text="Next" hide-goto-end-buttons />
    </nav>
  </b-card>
</template>

<script>
export default {
  name: 'BaseTable',
  inheritAttrs: false,
  props: {
    caption: {
      type: String,
      default: 'Table'
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectMode: {
      type: String,
      default: 'single'
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
      type: [Array, Function],
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
      default: () => {}
    }
  },
  data: () => {
    return {
      currentPage: 1
    }
  },
  computed: {
    items: function () {
      const items = this.tableData
      return Array.isArray(items) ? items : items()
    },
    totalRows: function () { return this.getRowCount() },
    captions: function () { return this.fields }
  },
  methods: {
    getBadge (status) {
      return status === 'Active' ? 'success'
        : status === 'Inactive' ? 'secondary'
          : status === 'Pending' ? 'warning'
            : status === 'Banned' ? 'danger' : 'primary'
    },
    getRowCount: function () {
      return this.items.length
    }
  }
}
</script>
