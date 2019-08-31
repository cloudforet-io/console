<template>
  <div class="base-table">
    <b-card :class="{ 'no-card': cardless,
                      dark: darkHeader }"
            :style="{ height: `${height}px` }"
    >
      <template v-if="!headerless" #header>
        <b-row align-v="center" align-h="between" class="header-container">
          <div v-if="!offCaption" class="caption-container">
            <slot name="caption" />
          </div>
          <div v-if="offCaption" class="searchbox-noCaption order-md-2 order-3">
            <div class="searchbox">
              <BaseSearch v-if="searchable" :context-data="searchContextData" @search="onSearch" />
              <BaseSearch v-else-if="noContextSearchable" @search="onSearch" />
            </div>
          </div>
          <div v-else class="searchbox-container order-md-2 order-3">
            <div class="searchbox">
              <BaseSearch v-if="searchable" :context-data="searchContextData" @search="onSearch" />
              <BaseSearch v-else-if="noContextSearchable" @search="onSearch" />
            </div>
          </div>
          <div class="tool-container mr-0 order-md-3 order-2">
            <b-row align-v="center"
                   no-gutters 
                   align-h="end" 
            >
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
                           :title="tr('TABLE.SETTINGS')"
                           :centered="true" 
                           :size="'md'" 
                           @ok="limitChanged"
                >
                  <template #activator>
                    <span class="settings-btn"><i class="fal fa-cog" /></span>
                  </template>
                  <template #contents>
                    <b-form-group :label="tr('TABLE.LIMIT_LABEL')" :label-cols="3">
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
          </div>
        </b-row>
      </template>

      <b-table class="b-table"
               show-empty
               sticky-header
               :borderless="true"
               :items="tableData"
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
        <template #table-busy>
          <b-row align-h="center">
            <i class="fad fa-spinner fa-pulse"
               :style="{'margin-top': `${10}px`}"
            />
          </b-row>
        </template>

        <template #emptyfiltered="scope">
          <h4>{{ scope.emptyFilteredText }}</h4>
        </template>

        <template v-for="headerSlot in getCustomHeaderSlotNameList()" 
                  :slot="headerSlot" 
                  slot-scope="data"
        >
          <slot :name="headerSlot" :field="data.field" />
        </template>


        <template v-if="selectable" #HEAD_selected>
          <BaseCheckbox :selected="isSelectedAll"
                        class="select-all-checkbox"
                        @change="onSelectAll"
          />
        </template>

        <template v-if="selectable" #selected="data">
          <BaseCheckbox :key="data.index"
                        v-model="data.item.selected"
                        class="select-checkbox"
                        @change="checkboxClicked"
          />
        </template>


        <template #status="data">
          <div :style="getVariantSize(data.item.status)">
            <b-badge :variant="getBadge(data.item.status)">
              {{ capitalizeFirstLetter(data.item.status) }}
            </b-badge>
          </div>
        </template>

        <template #state="data">
          <BaseStateTag :state="stateType" :data="data.item.state" />
        </template>

        <template #link="data">
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
import BaseStateTag from '@/components/base/tags/BATG_002_BaseStateTag';

export default {
    name: 'BaseTable',
    event: ['list', 'rowClicked', 'limitChanged', 'rowSelected', 'onSelectAll'],
    components: {
        BaseSearch,
        BaseModal,
        BaseCheckbox,
        BaseStateTag
    },
    inheritAttrs: false,
    props: {
        noContextSearchable: {
            type: Boolean,
            default: false
        },
        offCaption: {
            type: Boolean,
            default: false
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
        },
        darkHeader: {
            type: Boolean,
            default: true
        },
        headerless: {
            type: Boolean,
            default: false
        },
        stateType: {
            type: String,
            default: 'MEMBER_STATE'
        }
    },
    data() {
        return {
            currentPage: 1,
            selectedRows: [],
            sort: undefined,
            filter: [],
            filterOr: [],
            isLocalSort: true,
            limitInput: this.perPage,
            isSelectedAll: false
        };
    },
    computed: {
        heads() {
            return this.fields;
        },
        limit() {
            return this.perPage;
        },
        start() {
            return (this.currentPage - 1) * this.limit;
        },
        maxPage() {
            return Math.ceil(this.totalRows / this.limit);
        } 
    },
    watch: {
        busy (val) {
            if (!val) {
                this.resetSelectedRows();
            }
        }
    },
    created () {
        this.validateProperties();
    },
    methods: {
        validateProperties () {
            if (this.selectable && this.selectMode === 'multi' && this.isEmpty(this.busy)) {
                throw new Error('The required property was not provided.\n\
             \'busy\' property is required when it is selectable with \'multi\' mode for detecting refresh.');
            }
        },
        capitalizeFirstLetter (s) {
            return s.hasOwnProperty('text') ? this.capitalize(s.text) : s.hasOwnProperty('flag') ? this.capitalize(s.flag) : '';
        },
        getVariantSize (size) {
            let variantFontSize = 3;
            if (size.hasOwnProperty('variantSize')){
                variantFontSize = size.variantSize;
            }
            return this.setFontSize(variantFontSize);
        },
        getBadge (status) {
            let badge = '';
            if (this.isEmpty(status)){
                status = badge;
            } else if (status.hasOwnProperty('flag')){
                badge = status.flag;
            }
            return this.selectBadges(badge);
        },
        filterLimit () {
            if (this.limitInput < 1) {
                this.limitInput = 1;
            } else if (this.limitInput > this.perPageMax) {
                this.limitInput = this.perPageMax;
            }
        },
        rowClicked (item, idx, e) {
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
        rowSelected (item, idx) {
            this.selectedRows.map((row) => {
                this.updateTableDataSelectedValue(row.idx, false);
            });
            this.resetSelectedRows();

            this.updateTableDataSelectedValue(idx, true);
            this.selectedRows.push({ idx: idx, data: this.tableData[idx] });

            this.setIsSelectAll();
            this.$emit('rowSelected', this.selectedRows, true);
        },
        checkboxClicked (val, key) {
            switch (this.selectMode) {
            case 'single':
                this.setSelectedRowsWithSingleMode(key, val);
                break;
            case 'multi':
                this.setSelectedRowsWithMultiMode(key, val);
                break;
            }
            this.setIsSelectAll();
            this.$emit('rowSelected', this.selectedRows, val);
        },
        setSelectedRowsWithSingleMode (idx, val) {
            if (val) {
                this.selectedRows.map((row) => {
                    this.updateTableDataSelectedValue(row.idx, false);
                });
                this.resetSelectedRows();
                this.selectedRows.push({ idx: idx, data: this.tableData[idx] });
            } else {
                this.selectedRows.pop();
            }
        },
        setSelectedRowsWithMultiMode (idx, val) {
            if (val) {
                this.selectedRows.push({ idx: idx, data: this.tableData[idx] });
            } else {
                this.selectedRows.some((row, i) => {
                    if (idx === row.idx) {
                        this.$delete(this.selectedRows, i);
                    }
                    return idx === row.idx;
                });
            }
        },
        resetSelectedRows () {
            this.selectedRows = [];
        },
        setIsSelectAll () {
            if (this.selectedRows.length === this.tableData.length) {
                this.isSelectedAll = true;
            } else {
                this.isSelectedAll = false;
            }
        },
        onSelectAll (val) {
            if (val) {
                this.resetSelectedRows();
                this.tableData.map((data, i) => {
                    this.updateTableDataSelectedValue(i, val);
                    this.selectedRows.push({ data: data, idx: i });
                });
            } else {
                this.selectedRows.map((row) => {
                    this.updateTableDataSelectedValue(row.idx, val);
                });
                this.resetSelectedRows();
            }
            this.setIsSelectAll();
            this.$emit('onSelectAll', this.isSelectedAll, this.selectedRows);
        },
        updateTableDataSelectedValue (idx, value) {
            if (this.isEmpty(idx)) {
                idx = 0;
            }
            this.tableData[idx].selected = value;
            this.$set(this.tableData, idx, Object.assign({}, this.tableData[idx]));
        },
        onPrev () {
            if (this.currentPage <= 1) {
                return;
            }
            this.currentPage--;
            this.reset();
            this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
        },
        onNext () {
            if (this.currentPage >= this.maxPage) {
                return;
            }
            this.currentPage++;
            this.reset();
            this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
        },
        onRefresh () {
            this.currentPage = 1;
            this.reset();
            this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
        },
        onSearch (filter, filterOr) {
            this.filter = filter;
            this.filterOr = filterOr;
            this.reset();
            this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
        },
        headClicked (key, item) {
            if (item.ajaxSortable) {
                this.isLocalSort = false;
            } else {
                this.isLocalSort = true;
            }
        },
        sortingChanged (ctx) {
            if (this.isLocalSort) {
                return;
            }

            this.sort = {
                key: ctx.sort,
                desc: ctx.sortDesc ? 1 : 0
            };
            this.reset();
            this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
        },
        reset () {
            this.isSelectedAll = false;
        },
        contextChanged (ctx) {
            this.$emit('changed', ctx);
        },
        rowClass (item) { // custom global style
            let className = 'tbody-tr-default';
            if (this.selectable) {
                className += ' tbody-tr-selectable';
            }
            if (item && item.selected) {
                className += ' tbody-tr-selected';
            }
            if (this.underlined) {
                className += ' tbody-tr-underlined';
            }
            return className;
        },
        limitChanged () {
            this.filterLimit();
            let currentPageLastRowIdx = this.currentPage * this.limitInput;
            if (currentPageLastRowIdx > this.totalRows) {
                this.currentPage = Math.ceil(this.totalRows / this.limitInput);
            }
            this.$emit('limitChanged', this.limitInput);
        },
        onLimitInputEnter () {
            this.$refs.modal.hideModal();
            this.$refs.modal.$emit('ok');
        },
        getCustomHeaderSlotNameList () {
            let result = [];
            Object.keys(this.$scopedSlots).map((slot) => {
                if (slot.startsWith('HEAD')) {
                    result.push(slot);
                }
            });
            return result;
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
        background-color: rgba($darkgray, 0.5);
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
    &.dark {
        .card-header {
            background-color: $gray;
        }
    }
    .card-header {
        padding-top: 15px;
        padding-bottom: 15px;
        border: 0;
        background-color: $whiteblue;
        border-radius: inherit;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }
    .card-body {
        overflow-x: scroll;
        padding: 5px 20px 20px 20px;
        background-color: $white;
        border-radius: 0 $border-radius $border-radius 0;
    }
    .b-table {
        display: inline-table;
        margin: 0;
    }
    $caption-min-width: 220px;
    $caption-max-width: 240px;
    $tool-min-width: 250px;
    $tool-max-width: 340px;
    $pad-side: 20px;
    .header-container {
        padding-left: $pad-side;
        padding-right: $pad-side;
    }
    .caption-container {
        min-width: $caption-min-width;
        max-width: $caption-max-width;
    }
    .searchbox-container {
        width: calc(100% - #{$caption-max-width} - #{$tool-max-width});
        text-align: right;
        .searchbox {
            display: inline-block;
            text-align: left;
            width: 100%;
        }
    }
    .searchbox-noCaption {
    width: calc(100% - #{$tool-max-width};
    text-align: right;
    .searchbox {
      display: inline-block;
      text-align: left;
      width: 100%;
    }
  }
    .tool-container {
        display: inline-block;
        min-width: $tool-min-width;
        max-width: $tool-max-width;
        text-align: right;
    }
}
</style>