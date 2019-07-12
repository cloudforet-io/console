<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col cols="4" sm="6" md="2"
               class="mb-md-0 mb-3"
        >
          {{ caption }}
        </b-col>
        <b-col cols="12" sm="12" md="6" xl="7"
               order="3" order-md="2"
        >
          <BaseSearch v-if="searchable" :context-data="searchContextData" @search="onSearch" />
        </b-col>
        <b-col cols="8" sm="6" md="4" xl="3"
               order="2" order-md="3"
               class="mb-3 mb-md-0"
        >
          <b-row align-v="center" no-gutters align-h="between" class="text-center">
            <b-col>
              <span class="prev-btn" @click.prevent="onPrev"><i class="icon-arrow-left" /></span>
            </b-col>
            <b-col>
              <span>{{ currentPage }} / {{ maxPage }}</span>
            </b-col>
            <b-col>
              <span class="next-btn" @click.prevent="onNext"><i class="icon-arrow-right" /></span>
            </b-col>
            <b-col>
              <BaseModal :name="'tableSettings'" :title="'Table Settings'"
                         :centered="true" :size="'md'" @ok="$emit('limitChanged', limitInput)"
              >
                <template #activator>
                  <span class="settings-btn"><i class="icon-settings" /></span>
                </template>
                <template #contents>
                  <b-form>
                    <b-form-group label="Rows per page: " :label-cols="3">
                      <b-form-input v-model="limitInput" type="number" min="1" :max="perPageMax" @blur="filterLimit" />
                    </b-form-group>
                  </b-form>
                </template>
              </BaseModal>
            </b-col>
            <b-col>
              <span class="refresh-btn" @click="onRefresh"><i class="icon-refresh" /></span>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </div>
    <b-table class="b-table" :items="items" :fields="heads"
             :striped="striped" :bordered="bordered" :borderless="borderless"
             :dark="dark" :hover="hover"
             :small="small" :fixed="fixed" :responsive="responsive" :stacked="stacked"
             :no-local-sorting="!isLocalSort"
             :tbody-tr-class="rowClass"
             :selectable="selectable" :select-mode="selectMode"
             @head-clicked="headClicked"
             @row-clicked="rowClicked"
             @row-selected="rowSelected"
             @sort-changed="sortingChanged"
             @context-changed="contextChanged"
    >
      <template v-if="selectable" slot="HEAD_selected">
        <b-check v-model="isSelectedAll" class="select-all-checkbox" />
      </template>

      <template v-if="selectable" slot="selected" slot-scope="data">
        <b-check v-model="data.item.selected" class="select-checkbox"
                 @change="checkboxClicked"
        />
      </template>

      <template slot="status" slot-scope="data">
        <b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge>
      </template>
    </b-table>
  </b-card>
</template>

<script>
import BaseSearch from '@/component/base/search/BASR_001_BaseSearch.vue'
import BaseModal from '@/component/base/modal/BAMO_001_BaseModal.vue'
export default {
  name: 'BaseTable',
  event: ['list', 'rowClicked', 'limitChanged', 'rowSelected'],
  components: {
    BaseSearch,
    BaseModal
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
    searchContextData: {
      type: Object,
      default: null
    },
    selectable: {
      type: Boolean,
      default: true
    },
    hover: {
      type: Boolean,
      default: true
    },
    striped: {
      type: Boolean,
      default: true
    },
    bordered: {
      type: Boolean,
      default: false
    },
    borderless: {
      type: Boolean,
      default: true
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    responsive: {
      type: String,
      default: 'true'
    },
    stacked: {
      type: String,
      default: 'false'
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
    perPageMax: {
      type: Number,
      default: 100
    },
    dark: {
      type: Boolean,
      default: false
    },
    totalRows: {
      type: Number,
      default: null
    }
  },
  data () {
    return {
      currentPage: 1,
      clickedRow: undefined,
      clickedRows: [],
      selectMode: 'single',
      sortBy: undefined,
      searchList: [],
      isLocalSort: true,
      limitInput: this.perPage,
      isSelectedAll: false
    }
  },
  computed: {
    items () {
      console.log('items', this.tableData.map(item => item))
      return this.tableData
    },
    heads () { return this.fields },
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
    filterLimit () {
      if (this.limitInput < 1) this.limitInput = 1
      else if (this.limitInput > this.perPageMax) this.limitInput = this.perPageMax
    },
    rowClicked (item, idx, e) {
      this.$emit('rowClicked', item, idx, e)
    },
    rowSelected (items) {
      if (this.selectMode === 'single') this.selectMode = 'multi'

      let item = items[items.length - 1]

      if (this.clickedRow) this.clickedRow.selected = false

      if (item) item.selected = true

      this.clickedRow = item
      this.clickedRows = items

      this.$emit('rowSelected', items, item)
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
    onRefresh () {
      this.currentPage = 1
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    onSearch (conditionList) {
      this.searchList = conditionList
      this.$emit('list', this.limit, this.skip, this.sortBy, conditionList)
    },
    headClicked (key, item) {
      if (item.ajaxSortable) this.isLocalSort = false
      else this.isLocalSort = true
    },
    sortingChanged (ctx) {
      console.log('sortingChanged')
      if (this.isLocalSort) return

      this.sortBy = ctx.sortDesc ? `-${ctx.sortBy}` : ctx.sortBy
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    checkboxClicked (val) {
      console.log('checkbox clicked')
      this.selectMode = 'multi'
      // if (val)
    },
    contextChanged (ctx) { this.$emit('changed', ctx) },
    rowClass (item, type) { return 'tbody-tr-default' } // custom global style
  }
}
</script>

<style lang="scss" scoped>
%btn {
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  i {
    vertical-align: middle;
  }
  &:hover {
    background-color: lightgray;
  }
}
.prev-btn {
  @extend %btn;
}
.next-btn {
  @extend %btn;
}
.refresh-btn {
  @extend %btn;
  i {
    font-weight: 500;
    font-size: 1.2em;
  }
}
.settings-btn {
  @extend %btn;
  i {
    font-size: 1.2em;
  }
}

.card {
  border: 0;
  box-shadow: 0px 0px 2px 1px #a9a9a94f;
  .card-header {
    border: 0;
  }
  .card-body {
    overflow-x: scroll;
  }
  .b-table {
    display: inline-table;
  }
}

</style>
