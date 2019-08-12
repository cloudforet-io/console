<template>
  <div class="base-table">
    <b-card :class="{'no-card': cardless}"
            :style="{ height: `${height}px` }"
    >
      <template #header>
        <b-row align-v="center">
          <b-col cols="4" sm="6" md="2"
                 class="mb-md-0 mb-3"
          >
            <slot name="caption" />
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
                <span class="prev-btn" @click.prevent="onPrev"><i class="fal fa-chevron-left" /></span>
              </b-col>
              <b-col>
                <span>{{ currentPage }} / {{ maxPage }}</span>
              </b-col>
              <b-col>
                <span class="next-btn" @click.prevent="onNext"><i class="fal fa-chevron-right" /></span>
              </b-col>
              <b-col>
                <BaseModal ref="modal" 
                           title="Table Settings"
                           :centered="true" 
                           :size="'md'" 
                           @ok="limitChanged"
                >
                  <template #activator>
                    <span class="settings-btn"><i class="fal fa-cog" /></span>
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
                <span class="refresh-btn" @click="onRefresh"><i class="fal fa-sync" /></span>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </template>

      <b-table class="b-table"
               show-empty
               :borderless="true"
               :items="items"
               :fields="heads"
               :striped="striped"
               :bordered="bordered" 
               :dark="dark" :hover="hover"
               :small="small"
               :fixed="fixed"
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
            <i class="fad fa-spinner fa-pulse"
               :style="{'margin-top': `${10}px`}"
            />
          </b-row>
        </template>

        <template slot="emptyfiltered" slot-scope="scope">
          <h4>{{ scope.emptyFilteredText }}</h4>
        </template>

        <template v-if="selectable" slot="HEAD_selected">
          <b-check v-model="isSelectedAll"
                   class="select-all-checkbox"
                   @change="onSelectAll"
          />
        </template>

        <!-- <template slot="thead-top" slot-scope="data">
           <tr>
             <th>
                 &nbsp;
             </th>
             <th>Type 1</th>
             <th>
               Type 2
             </th>
             <th>Type 3</th>
           </tr>
         </template> -->


        <template v-if="selectable" slot="selected" slot-scope="data">
          <BaseCheckbox :key="data.index"
                        :selected="data.item.selected"
                        class="select-checkbox"
                        @change="checkboxClicked"
          />
        </template>


        <template slot="status" slot-scope="data">
          <div :style="getVariantSize(data.item.variantSize)">
            <b-badge :variant="getBadge(data.item.status)">
              {{ capitalizeFirstLetter(data.item.status) }}
            </b-badge>
          </div>
        </template>

        <template slot="state" slot-scope="data">
          <!-- <div>
            <b-badge :variant="getBadge(data.item.status)">
              {{ capitalizeFirstLetter(data.item.status) }}
            </b-badge>
          </div> -->
          <div v-html="getServerStates(data.item.state)" />
        </template>

        <template slot="link" slot-scope="data">
          <a :href="data.item.link">{{ data.item.linkText }}</a>
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script>
import BaseSearch from '@/components/base/search/BASR_001_BaseSearch.vue';
import BaseModal from '@/components/base/modal/BAMO_001_BaseModal.vue';
import BaseCheckbox from '@/components/base/checkbox/BACB_001_BaseCheckbox.vue';

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
            validator(str) {
                return str === 'multi' || str === 'single';
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
        underlined: {
            type: Boolean,
            default: true
        },
        bordered: {
            type: Boolean,
            default: false
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
        },
        height: {
            type: Number,
            default: 500
        }
    },
    data() {
        return {
            currentPage: 1,
            selectedRows: [],
            sortBy: undefined,
            searchList: [],
            isLocalSort: true,
            limitInput: this.perPage,
            isSelectedAll: false
        };
    },
    computed: {
        items() {
            return this.tableData;
        },
        heads() {
            return this.fields;
        },
        limit() {
            return this.perPage;
        },
        skip() {
            return (this.currentPage - 1) * this.limit;
        },
        maxPage() {
            return Math.ceil(this.totalRows / this.limit);
        }
    },
    methods: {
        getServerStates(state){
            return this.bindEnumToHtml(state);
        },
        getVariantSize(size) {
            return this.setFontSize(size);
        },
        getBadge(status) {
            return this.selectBadges(status);
        },
        filterLimit() {
            if (this.limitInput < 1) {
                this.limitInput = 1;
            } else if (this.limitInput > this.perPageMax) {
                this.limitInput = this.perPageMax;
            }
        },
        rowClicked(item, idx, e) {
            if (this.selectable) {
                this.rowSelected(item, idx, e);
            }
            this.$emit('rowClicked', item, idx, e);
        },
        /**
         * @param item
         * @param idx
         * @param e
         */
        rowSelected(item, idx) {
            this.consoleLogEnv('row Selected');
            this.selectedRows.map((row) => {
                if (row.data !== item) {
                    row.data.selected = false;
                    this.updateTableData(row.idx, row.data);
                }
            });
            this.selectedRows = [];

            item.selected = true;
            this.updateTableData(idx, item);
            this.selectedRows.push({ idx: idx, data: this.tableData[idx] });
            this.setIsSelectAll();
            this.$emit('rowSelected', this.selectedRows[0]);
        },
        checkSingleMode(item, idx, newValue) {
            this.consoleLogEnv('check Single-Mode');
            if (this.selectedRows[0]) {
                this.selectedRows[0].data.selected = false;
            }
            if (newValue) {
                this.selectedRows[0] = { idx: idx, data: item };
            } else {
                this.selectedRows.pop();
            }

            this.updateTableData(idx, newValue);
            this.setIsSelectAll();
            this.$emit('rowSelected', this.selectedRows[0]);
        },
        checkMultiMode(item, idx, newValue) {
            this.consoleLogEnv('check Multi-Mode');
            let isOnceSelected = this.selectedRows.some((row, i) => {
                if (row.data._id === item._id) {
                    row.data.selected = false;
                    this.updateTableData(row.idx, row.data);
                    this.$delete(this.selectedRows, i);
                }
                return row.data._id === item._id;
            });
            if (!isOnceSelected) {
                this.selectedRows.push({ idx: idx, data: item });
            }
            item.selected = newValue;
            this.updateTableData(idx, item);
            this.setIsSelectAll();
            this.$emit('rowSelected', this.selectedRows);
        },
        checkboxClicked(val, key) {
            this.consoleLogEnv('row Selected');
            switch (this.selectMode) {
            case 'single':
                this.checkSingleMode(this.tableData[key], key, val);
                break;
            case 'multi':
                this.checkMultiMode(this.tableData[key], key, val);
                break;
            }
        },
        setIsSelectAll() {
            if (this.selectedRows.length === this.tableData.length) {
                this.isSelectedAll = true;
            } else {
                this.isSelectedAll = false;
            }
        },
        onSelectAll(val) {
            if (val) {
                this.selectedRows = [];
                this.tableData.map((data, i) => {
                    data.selected = true;
                    this.updateTableData(i, data);
                    this.selectedRows.push({ data: data, idx: i });
                });
            } else {
                this.selectedRows.map((row) => {
                    row.data.selected = false;
                    this.updateTableData(row.idx, row.data);
                });
                this.selectedRows = [];
            }

            this.$emit('onSelectAll', this.selectedRows, this.isSelectedAll);
        },
        updateTableData(idx, data) {
            if (this.isEmpty(idx)) {
                idx = 0;
            }
            if (this.isEmpty(data)) {
                data = this.tableData[idx];
            }
            this.$set(this.tableData, idx, Object.assign({}, data));
        },
        onPrev() {
            if (this.currentPage <= 1) {
                return;
            }
            this.currentPage--;
            this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList);
        },
        onNext() {
            if (this.currentPage >= this.maxPage) {
                return;
            }
            this.currentPage++;
            this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList);
        },
        onRefresh() {
            this.currentPage = 1;
            this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList);
        },
        onSearch(conditionList) {
            this.searchList = conditionList;
            this.$emit('list', this.limit, this.skip, this.sortBy, conditionList);
        },
        headClicked(key, item) {
            if (item.ajaxSortable) {
                this.isLocalSort = false;
            } else {
                this.isLocalSort = true;
            }
        },
        sortingChanged(ctx) {
            if (this.isLocalSort) {
                return;
            }

            this.sortBy = ctx.sortDesc ? `-${ctx.sortBy}` : ctx.sortBy;
            this.$emit('list', this.limit, this.skip, this.sortBy, this.searchList);
        },
        contextChanged(ctx) {
            this.$emit('changed', ctx);
        },
        rowClass(item) { // custom global style
            let className = 'tbody-tr-default';
            if (item && item.selected) {
                className += ' tbody-tr-selected';
            }
            if (this.underlined) {
                className += ' tbody-tr-underlined';
            }
            return className;
        },
        limitChanged() {
            this.filterLimit();
            let currentPageLastRowIdx = this.currentPage * this.limitInput;
            if (currentPageLastRowIdx > this.totalRows) {
                this.currentPage = Math.ceil(this.totalRows / this.limitInput);
            }
            this.$emit('limitChanged', this.limitInput);
        },
        onLimitInputEnter() {
            this.$refs.modal.hideModal();
            this.$refs.modal.$emit('ok');
        },
        capitalizeFirstLetter(s) {
            return this.capitalize(s);
        }
    }
};
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
        background-color: $lightgray;
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
}
.settings-btn {
    @extend %btn;
}

.card {
    border: 0;
    border-radius: inherit;
    background-color: transparent;
    &.no-card {
        border: 0;
        all: unset;

        .card-header {
            background-color: transparent;
        }

        .card-body {
            box-shadow: none;
            overflow-x: hidden;
        }
    }
    .card-header {
        padding-top: 30px;
        padding-bottom: 30px;
        background-color: $whiteblue;
        border: 0;
        border-radius: inherit;
    }
    .card-body {
        overflow-x: scroll;
        padding: 20px 20px;
        background-color: $white;
        @extend %sheet;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
    .b-table {
        display: inline-table;
        margin: 0;
    }
}
</style>