<template>
  <b-card :class="{'no-card': cardless}">
    <b-row slot="header" align-v="center">
      <b-col cols="4" sm="6" md="2"
             class="mb-md-0 mb-3">

        <template v-if="showCaption">
          {{ caption }}
        </template>

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
            <BaseModal ref="modal" :name="'tableSettings'" :title="'Table Settings'"
                       :centered="true" :size="'md'" @ok="limitChanged"
            >
              <template #activator>
                <span class="settings-btn"><i class="icon-settings" /></span>
              </template>
              <template #contents>
                <b-form-group label="Rows per page: " :label-cols="3">
                  <b-form-input v-model="limitInput" type="number" min="1" :max="perPageMax"
                                @blur="filterLimit" @keydown.enter="onLimitInputEnter"
                  />
                </b-form-group>
              </template>
            </BaseModal>
          </b-col>
          <b-col>
            <span class="refresh-btn" @click="onRefresh"><i class="icon-refresh" /></span>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-table class="b-table"
             :items="items"
             :fields="heads" show-empty
             :striped="striped"
             :bordered="bordered"
             :borderless="borderless"
             :dark="dark" :hover="hover"
             :small="small" :fixed="fixed"
             :responsive="responsive"
             :stacked="stacked"
             :no-local-sorting="!isLocalSort"
             :tbody-tr-class="rowClass"
             :busy="busy"
             @head-clicked="headClicked"
             @row-clicked="rowClicked"
             @sort-changed="sortingChanged"
             @context-changed="contextChanged"
    >
      <template slot="table-busy">
        <b-row align-h="center">
          <b-spinner :variant="'secondary'" />
        </b-row>
      </template>

      <template slot="emptyfiltered" slot-scope="scope">
        <h4>{{ scope.emptyFilteredText }}</h4>
      </template>

      <template v-if="selectable" slot="HEAD_selected">
        <b-check v-model="isSelectedAll" class="select-all-checkbox"
                 @change="onSelectAll"
        />
      </template>

      <template v-if="selectable" slot="selected" slot-scope="data">
        <BaseCheckbox :key="data.index" :selected="data.item.selected" class="select-checkbox"
                      @change="checkboxClicked"
        />
      </template>

      <template slot="status" slot-scope="data">
        <h5><b-badge :variant="getBadge(data.item.status)">
          {{ data.item.status }}
        </b-badge></h5>
      </template>

      <template slot="link" slot-scope="data">
        <a :href="data.item.link">{{data.item.linkText}}</a>
      </template>


    </b-table>
  </b-card>
</template>

<script>
import BaseSearch from '@/component/base/search/BASR_001_BaseSearch.vue'
import BaseModal from '@/component/base/modal/BAMO_001_BaseModal.vue'
import BaseCheckbox from '@/component/base/checkbox/BACB_001_BaseCheckbox.vue'

export default {
  name: 'BaseTable',
  event: ['list', 'rowClicked', 'limitChanged', 'rowSelected'],
  components: {
    BaseSearch,
    BaseModal,
    BaseCheckbox
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
    selectMode: {
      type: String,
      default: 'multi',
      validator (str) {
        return str === 'multi' || str === 'single'
      }
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
    cardless: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: true
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
      default: 20
    },
    showCaption: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
    totalRows: {
      type: Number,
      default: null
    },
    busy: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      currentPage: 1,
      selectedRows: [],
      sortBy: undefined,
      searchList: [],
      isLocalSort: true,
      limitInput: this.perPage,
      isSelectedAll: false
    }
  },
  computed: {
    items () {
      return this.tableData
    },
    heads () { return this.fields },
    limit () { return this.perPage },
    skip () { return (this.currentPage - 1) * this.limit },
    maxPage () { return Math.ceil(this.totalRows / this.limit) }
  },
  methods: {
    getBadge (status) {
      return this.selectBadges(status);
    },
    filterLimit () {
      if (this.limitInput < 1) this.limitInput = 1
      else if (this.limitInput > this.perPageMax) this.limitInput = this.perPageMax
    },
    rowClicked (item, idx, e) {
      if (this.selectable) this.rowSelected(item, idx, e)
      this.$emit('rowClicked', item, idx, e)
    },
    rowSelected (item, idx, e) {
      this.selectedRows.map((row, i) => {
        if (row.data !== item) {
          row.data.selected = false
          this.updateTableData(row.idx, row.data)
        }
      })
      this.selectedRows = []

      item.selected = true
      this.updateTableData(idx, item)
      this.selectedRows.push({ idx: idx, data: this.tableData[idx] })
      this.setIsSelectAll()
      this.$emit('rowSelected', this.selectedRows[0])
    },
    checkSingleMode (item, idx, newValue) {
      if (this.selectedRows[0]) this.selectedRows[0].data.selected = false

      if (newValue) this.selectedRows[0] = { idx: idx, data: item }
      else this.selectedRows.pop()

      this.updateTableData(idx, newValue)
      this.setIsSelectAll()
      this.$emit('rowSelected', this.selectedRows[0])
    },
    checkMultiMode (item, idx, newValue) {
      let isOnceSelected = this.selectedRows.some((row, i) => {
        if (row.data === item) {
          row.data.selected = false
          this.updateTableData(row.idx, row.data)
          this.selectedRows.splice(i, 1)
        }
        return row.data === item
      })
      if (!isOnceSelected) {
        this.selectedRows.push({ idx: idx, data: item })
      }

      item.selected = newValue
      this.updateTableData(idx, item)
      this.setIsSelectAll()
      this.$emit('rowSelected', this.selectedRows)
    },
    checkboxClicked (val, key) {
      console.log('checkbox clicked')
      switch (this.selectMode) {
        case 'single':
          this.checkSingleMode(this.tableData[key], key, val)
          break
        case 'multi':
          this.checkMultiMode(this.tableData[key], key, val)
          break
      }
    },
    setIsSelectAll () {
      if (this.selectedRows.length === this.tableData.length) this.isSelectedAll = true
      else this.isSelectedAll = false
    },
    onSelectAll (val) {
      if (val) {
        this.selectedRows = []
        this.tableData.map((data, i) => {
          data.selected = true
          this.updateTableData(i, data)
          this.selectedRows.push({ data: data, idx: i })
        })
      } else {
        this.selectedRows.map((row, i) => {
          row.data.selected = false
          this.updateTableData(row.idx, row.data)
        })
        this.selectedRows = []
      }
      if (val) this.$emit('rowSelected', this.selectedRows)
    },
    updateTableData (idx, data) {
      if (idx === undefined) idx = 0
      if (data === undefined) data = this.tableData[idx]
      this.$set(this.tableData, idx, Object.assign({}, data))
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
      if (this.isLocalSort) return

      this.sortBy = ctx.sortDesc ? `-${ctx.sortBy}` : ctx.sortBy
      this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList)
    },
    contextChanged (ctx) {
      this.$emit('changed', ctx)
    },
    rowClass (item, type) { // custom global style
      let className = 'tbody-tr-default'
      if (item && item.selected) className += ' tbody-tr-selected'
      return className
    },
    limitChanged () {
      this.filterLimit()
      let currentPageLastRowIdx = this.currentPage * this.limitInput
      if (currentPageLastRowIdx > this.totalRows) this.currentPage = Math.ceil(this.totalRows / this.limitInput)
      this.$emit('limitChanged', this.limitInput)
    },
    onLimitInputEnter () {
      this.$refs.modal.hideModal()
      this.$refs.modal.$emit('ok')
    }
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
  height: 500px;
  &.no-card {
    border: 0;
    box-shadow: 0px 0px 2px 1px #a9a9a94f;
    height: 500px;
    &.no-card {
      all: unset;

      .card-header {
        background-color: transparent;
      }
      .card-body {
        overflow-x: hidden;
        height: 600px;
      }
    }
  }
  .card-header {
    border: 0;
  }
  .card-body {
    overflow-x: scroll;
  }
  .b-table {
    display: inline-table;
    margin: 0;
  }
}

</style>
