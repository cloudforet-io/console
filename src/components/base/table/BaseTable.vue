<template>
  <div class="base-table">
    <b-card :class="{ 'no-card': cardless,
                      dark: darkHeader }"
            :style="{ height: `${height}px` }"
    >
      <template v-if="!headerless" #header>
        <b-row ref="headerContainer"
               align-v="center" 
               align-h="between"
               class="header-container"
               :style="{ 'padding-left': `${pad}px`, 'padding-right': `${pad}px` }"
        >
          <div ref="captionContainer"
               class="caption-container"
               :style="{ width: `${captionContainerWidth}px` }"
          >
            <slot name="caption" />
          </div>
          <div ref="searchboxContainer"
               class="searchbox-container"
               :class="{ 'no-caption': noCaption }"
               :style="{ width: searchContainerWidth }"
          >
            <div v-if="searchable" class="searchbox" :style="{ width: searchboxWidth }">
              <BaseSearch ref="search"
                          :context-data="searchContextData"
                          :is-empty-search="isEmptySearch"
                          :plain-search="plainSearch"
                          :border="!darkHeader"
                          @search="onSearch"
                          @empty="$emit('empty')"
              />
            </div>
          </div>
          <div ref="toolContainer"
               class="tool-container mr-0"
               :style="{ width: `${toolContainerWidth}px` }"
          >
            <div class="toolbox" :style="{ width: toolboxWidth }">
              <b-row align-v="center" no-gutters align-h="end">
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
                  :slot="headerSlot.key" 
                  slot-scope="data"
        >
          <slot :name="headerSlot.name" :field="data.field" />
        </template>

        <template v-for="cellSlot in getCustomCellNameList()" 
                  :slot="cellSlot.key" 
                  slot-scope="data"
        >
          <slot :name="cellSlot.name" :field="data.field" :data="data" />
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

        <template #plugin_info="data">
          <div v-html="getResourceTypeInStr(data.item.plugin_info)" />
        </template>

        <template #name="data">
          <div v-if="data.item.hasOwnProperty('collector_id')">
            <template v-if="selectIconType(data.item.tags)">
              <img class="row-icons" :src="require(`@/assets/icons/${getCollectorIcon(data.item.tags.icon)}`)"
                   height="42vh"
                   width="42vh"
              > {{ data.item.name }}
            </template>
            <template v-else>
              <img class="row-gears" src="@/assets/icons/common-gear.svg"
                   height="42vh"
                   width="42vh"
              > {{ data.item.name }}
            </template>
          </div>
          <div v-else>
            {{ data.item.name }}
          </div>
        </template>

        <template #link="data">
          <a :href="data.item.link">{{ data.item.linkText }}</a>
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script>
const BaseSearch = () => import('@/components/base/search/BaseSearch.vue');
const BaseModal = () => import('@/components/base/modal/BaseModal.vue');
const BaseCheckbox = () => import('@/components/base/checkbox/BaseCheckbox.vue');
const BaseStateTag = () => import('@/components/base/tags/BATG_002_BaseStateTag');

export default {
    name: 'BaseTable',
    events: ['list', 'rowClicked', 'limitChanged', 'rowSelected', 'onSelectAll', 'empty'],
    components: {
        BaseSearch,
        BaseModal,
        BaseCheckbox,
        BaseStateTag
    },
    inheritAttrs: false,
    props: {
        searchable: {
            type: Boolean,
            default: false
        },
        searchContextData: {
            type: Object,
            default: undefined
        },
        plainSearch: {
            type: Boolean,
            default: false
        },
        isEmptySearch: {
            type: Boolean,
            default: false
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
        },
        toolWidth: {
            type: Number,
            default: 280
        },
        captionWidth: {
            type: Number,
            default: 240
        },
        searchWidth: {
            type: Number,
            default: null
        }
    },
    data() {
        return {
            currentPage: 1,
            selectedRows: [],
            sort: undefined,
            filter: [],
            filterOr: [],
            keyword: '',
            isLocalSort: true,
            limitInput: this.perPage,
            isSelectedAll: false,
            width: 0,
            pad: 20
        };
    },
    computed: {
        heads () {
            return this.fields;
        },
        limit () {
            return this.perPage;
        },
        start () {
            return (this.currentPage - 1) * this.limit;
        },
        maxPage () {
            return Math.ceil(this.totalRows / this.limit);
        },
        noCaption () {
            return !(this.$slots.caption || this.$scopedSlots.caption);
        },
        headerWidth () {
            return this.width - (this.pad * 2);
        },
        captionContainerWidth () {
            if (this.noCaption) {
                return 0;
            }
            return this.captionWidth > this.width ? this.width : this.captionWidth;
        },
        toolContainerWidth () {
            if (this.headerWidth < this.captionContainerWidth + this.toolWidth) {
                return this.headerWidth;
            } else if (this.searchWidth && 
                        this.headerWidth < this.searchWidth + this.captionContainerWidth + this.toolWidth) {
                return this.headerWidth;
            }
            return this.toolWidth > this.width ? this.width : this.toolWidth;
        },
        toolboxWidth () {
            if (this.toolContainerWidth > this.toolWidth) {
                return `${this.toolWidth}px`; 
            }
            return '100%';
        },
        searchContainerWidth () {
            let calculatedWidth;
            calculatedWidth = this.headerWidth - this.toolContainerWidth - (this.noCaption ? 0 : this.captionContainerWidth);

            if (this.searchWidth && calculatedWidth < this.searchWidth) {
                calculatedWidth = this.searchWidth;
            }

            return `${calculatedWidth}px`;
        },
        searchboxWidth () {
            if (this.searchWidth) {
                return `${this.searchWidth}px`; 
            }
            return '100%';
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
    mounted () {
        this.setWidth();
        self.addEventListener('resize', this.setWidth);
    },
    destroyed () {
        self.removeEventListener('resize', this.setWidth);
    },
    methods: {
        isValidToRun (v){
            return !this.isEmpty(v);
        },
        setWidth () {
            if (this.headerless) {
                return;
            }
            this.width = this.$refs.headerContainer.clientWidth;
        },
        validateProperties () {
            if (this.selectable && this.selectMode === 'multi' && this.isEmpty(this.busy)) {
                throw new Error('The required property was not provided.\n\
             \'busy\' property is required when it is selectable with \'multi\' mode for detecting refresh.');
            }
        },
        capitalizeFirstLetter (s) {
            return s.hasOwnProperty('text') ? this.capitalize(s.text) : s.hasOwnProperty('flag') ? this.capitalize(s.flag) : '';
        },
        getResourceTypeInStr (val) {
            let returnVal = '';
            const resourceInfoArry = val.options.supported_resource_type;
            if (!this.isEmpty(resourceInfoArry) && resourceInfoArry.length > 0){
                resourceInfoArry.forEach((curItem, idx) =>{
                    if (idx == 0){
                        returnVal +=  `${this.capitalize(curItem)}`;
                    } else {
                        returnVal +=  `<br>${this.capitalize(curItem)}`;
                    }
                });
            }
            return returnVal;
        },
        getCollectorIcon(str){
            return str.includes('svg') ?  str : str + '.svg';
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
            this.emitListEvent();
        },
        onNext () {
            if (this.currentPage >= this.maxPage) {
                return;
            }
            this.currentPage++;
            this.reset();
            this.emitListEvent();
        },
        onRefresh () {
            this.currentPage = 1;
            this.reset();
            this.emitListEvent();
        },
        onSearch (filter, filterOr) {
            if (this.plainSearch) {
                this.keyword = filter;
            } else {
                this.filter = filter;
                this.filterOr = filterOr;
            }
            this.reset();
            this.emitListEvent();
        },
        emitListEvent () {
            if (this.searchContextData) {
                this.$emit('list', this.limit, this.start, this.sort, this.filter, this.filterOr);
            } else {
                this.$emit('list', this.limit, this.start, this.sort, this.keyword);    
            }
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
                key: ctx.sortBy,
                desc: ctx.sortDesc ? 1 : 0
            };
            this.reset();
            this.emitListEvent();
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
                    result.push({ key: slot, name: slot });
                }
            });
            return result;
        },
        getCustomCellNameList () {
            let result = [];
            Object.keys(this.$scopedSlots).map((slot) => {
                if (slot.startsWith('CELL')) {
                    result.push({ key: slot.substring(5), name: slot });
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
        padding-bottom: 0;
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

    %container {
        margin-bottom: 15px;
    }
    .caption-container {
        @extend %container;
    }
    .searchbox-container {
        @extend %container;
        text-align: right;
        &.no-caption {
            text-align: right;
        }
        .searchbox {
            display: inline-block;
            text-align: left;
        }
    }
    .tool-container {
        @extend %container;
        display: inline-block;
        text-align: right;
        .toolbox {
            display: inline-block;
            text-align: right; 
        }
    }
    .row-icons {
      padding: 5px 5px 5px 5px;
    }
    .row-gears {
      padding: 5px 5px 5px 5px;
    }
}
</style>