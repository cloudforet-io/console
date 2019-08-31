<template>
  <div>
    <div class="search-container">
      <b-input-group class="row no-gutters">
        <div class="input-container">
          <div ref="inputBox" class="input-box" @click.self="focusOnInput">
            <InputTag v-for="(tag, idx) in tagList"
                      ref="tag"
                      :key="tag.id"
                      class="input-tag"
                      :tabindex="idx"
                      :idx="idx"
                      :list-data="contextData.queryList" 
                      :contents="tag"
                      :class="{focused: tag.focused}"
                      @delete="deleteTagAndSearch(idx)"
                      @update="upsertTagAndSearch"
                      @moveLeft="moveFocusToLeft(idx)"
                      @moveRight="moveFocusToRight(idx)"
                      @deleteLeft="deleteLeftTag(idx - 1)"
            />

            <BaseInput ref="input" 
                       class="input"
                       :list-data="contextData.queryList"
                       add-only
                       @add="addTagAndSearch" 
                       @moveLeft="moveFocusToLeft(tagList.length - 1)"
                       @moveRight="moveFocusToRight(tagList.length - 1)"
                       @deleteLeft="deleteLeftTag(tagList.length - 1)"
            />
          </div>
          <span class="input-delete-button" @click="deleteAll"><i class="fal fa-times" /></span>
        </div>

        <b-input-group-append class="pl-0">
          <b-button block class="search-btn" @click="onClickSearch">
            <i class="fas fa-search" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus';
import BaseInput from '@/components/base/input/BAIN_001_BaseInput';
import InputTag from '@/components/base/input/BAIN_002_EXT_InputTag';

const testdata = [{
    id: 0,
    key: 'test_key',
    label: 'TEST',
    value: 'cloud one',
    operator: ':',
    type: 'String',
    subKey: ''
}];

const contextDataModel = {
    queryList: [],
    autokeyList: []
};

export default {
    name: 'BaseSearch',
    event: ['search'],
    directives: { focus: focus },
    components: { BaseInput, InputTag },
    props: {
        contextData: {
            type: Object,
            default: () => Object.assign({}, contextDataModel),
            validator (obj) {
        /**
         * TODO: Add validation for queryList format
         */
                return obj.queryList !== undefined && obj.queryList !== null && obj.queryList instanceof Array &&
              obj.autokeyList !== undefined && obj.autokeyList !== null && obj.autokeyList instanceof Array;
            }
        },
        searchData: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            tagList: this.searchData.length > 0 ? this.searchData : [],
            queryList: [],
            lastId: 0,
            focusInput: false,
            filterList: [],
            filterOrList: []
        };
    },
    methods: {
        addTagAndSearch (items) {
            this.addTag(items);
            this.search();
        },
        addTag (tags) {
            tags.map((tag) => {
                let newTag = this.getNewTag(tag);
                this.addQuery(newTag);
                this.tagList.push(newTag);
            });
        },
        addQuery (obj) {
            if (this.isEmpty(obj.key)) {
                this.addQueryToFilterOrListWithAutoKey(obj);
            } else {
                this.addQueryToFilterList(obj);
            }
        },
        addQueryToFilterOrListWithAutoKey (obj) {
            if (this.filterOrList.length === 0) {
                this.generateValueEmptyFilterOrList();
            } 

            this.filterOrList.map((filter) => {
                filter.value.push(obj.value);
            });
            obj.filterName = 'filterOr';
            obj.filterIdx = null;
            obj.valueIdx = this.filterOrList[0].value.length - 1;
        },
        generateValueEmptyFilterOrList () {
            this.contextData.autokeyList.map((autokey) => {
                this.filterOrList.push({ 
                    key: autokey,
                    value: [],
                    operator: this.getOperator(':')
                });
            });
        },
        removeEmptyValueFilterOrList () {
            this._.remove(this.filterOrList, (filter) => {
                return filter.value.length === 0;
            });
        },
        addQueryToFilterList (obj) {
            let idx = 0;
            let isExist = this.filterList.some((item, i) => {
                if (item.key === obj.key && item.operator === this.getOperator(obj.operator)) {
                    idx = i;
                }
                return item.key === obj.key && item.operator === this.getOperator(obj.operator); 
            });

            if (isExist) {
                this.filterList[idx].value.push(obj.value);
                obj.valueIdx = this.filterList[idx].value.length - 1;
            } else {
                this.filterList.push({
                    key: obj.key,
                    value: [obj.value],
                    operator: this.getOperator(obj.operator)
                });
                obj.valueIdx = 0;
            }
            
            obj.filterName = 'filter';
            obj.filterIdx = idx;
        },
        upsertTagAndSearch (tags, idx) {
            this.upsertTag(tags, idx);
            this.search();
        },
        upsertTag (tags, startIdx) {
            tags.map((tag, idx) => {
                if (idx === 0) {
                    this.updateTag(tag, startIdx);
                    this.updateQuery(this.tagList[startIdx]);
                } else {
                    this.insertTag(tag, startIdx + idx);
                    this.addQuery(this.tagList[startIdx + idx]);
                }
            });
        },
        updateTag (tag, idx) {
            this.$set(this.tagList, idx, Object.assign(this.tagList[idx], tag));
        },
        updateQuery (obj) {
            this.deleteQuery(obj);
            this.addQuery(obj);
        },
        insertTag (tag, idx) {
            this.tagList.splice(idx, 0, this.getNewTag(tag));
        },
        deleteTagAndSearch (idx) {
            this.deleteTag(idx);
            this.search();
        },
        deleteTag (idx) {
            this.deleteQuery(this.tagList[idx]);
            this.$delete(this.tagList, idx);
        },
        deleteQuery (obj) {
            if (obj.filterName === 'filter') {
                this.deleteQueryFromFilterList(obj);
            }  else if (obj.filterName === 'filterOr') {
                this.deleteQueryFromFilterOrList(obj);
            }
        },
        deleteQueryFromFilterList (obj) {
            this.filterList[obj.filterIdx].value.splice(obj.valueIdx, 1);
            obj.filterIdx = null;
            obj.valueIdx = null;
            obj.filterName = '';
        },
        deleteQueryFromFilterOrList (obj) {
            this.filterOrList.map((filter) => {
                filter.value.splice(obj.valueIdx, 1);
            });
            obj.filterIdx = null;
            obj.valueIdx = null;
            obj.filterName = '';
        },
        deleteAll () {
            this.tagList = [];
            this.filterList = [];
            this.filterOrList = [];
            this.$refs.input.inputText = '';
            this.focusOnInput();
        },
        search () {
            this.removeEmptyValueFilterOrList();
            this.$emit('search', this.filterList, this.filterOrList);
        },
        onClickSearch () {
            this.$refs.input.onEnter();
        },
        getNewTag (item) {
            return Object.assign({ 
                id: ++this.lastId, 
                filterName: '', 
                filterIdx: null,
                valueIdx: null,
                focused: false
            }, item);
        },
        getOperator (op) {
            switch (op) {
            case this.$root.ENUM.OPERATORS.CONTAIN_IN.sign: return this.$root.ENUM.OPERATORS.CONTAIN_IN.string;
            case this.$root.ENUM.OPERATORS.IN.sign: return this.$root.ENUM.OPERATORS.IN.string;
            case this.$root.ENUM.OPERATORS.GTE.sign: return this.$root.ENUM.OPERATORS.GTE.string;
            case this.$root.ENUM.OPERATORS.LTE.sign: return this.$root.ENUM.OPERATORS.LTE.string;
            case this.$root.ENUM.OPERATORS.NOT_IN.sign: return this.$root.ENUM.OPERATORS.NOT_IN.string;
            case this.$root.ENUM.OPERATORS.REGEX_IN.sign: return this.$root.ENUM.OPERATORS.REGEX_IN.string;
            default: return this.$root.ENUM.OPERATORS.CONTAIN_IN.string;
            }
        },
        focusOnInput () {
            this.$refs.input.isFocused = true;
        },
        moveFocusToLeft (idx) {
            if (--idx > 0) {
                return;
            }
            // console.log('move focus to LEFT', idx);
            if (this.tagList[idx + 1]) {
                this.tagList[idx + 1].focused = false;
            }
            this.tagList[idx].focused = true;
            this.$refs.tag[idx].$el.focus();
        },
        moveFocusToRight (idx) {
            if (++idx < this.tagList.length) {
                return;
            }
            // console.log('move focus to RIGHT', idx);
            if (this.tagList[idx - 1]) {
                this.tagList[idx - 1].focused = false;
            }
            this.tagList[idx].focused = true;
        },
        deleteLeftTag (idx) {
            if (idx >= 0) {
                this.deleteTagAndSearch(idx);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
$input-height: 30px;
$line-height: 30px;
$search-btn-width: 50px;

.search-container {
  position: relative;
  .input-container {
    border: 0;
    border-radius: 5px 0 0 5px;
    background-color: $white;
    padding-left: 5px;
    width: calc(100% - #{$search-btn-width});
    vertical-align: middle;
    line-height: $line-height;

    $close-btn-width: 35px;
    .input-box {
        display: inline-block;
        width: calc(100% - #{$close-btn-width});
        cursor: text;
        vertical-align: middle;
        min-height: $input-height;
        .input {
            display: inline-block;
            vertical-align: middle;
        }
    }
    .input-delete-button {
      display: inline-block;
      width: $close-btn-width;
      padding-right: 8px;
      font-size: 1.2em;
      color: $darkgray;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
    }
  }
  .search-btn {
      border: 0;
    border-radius: 0 5px 5px 0;
    color: darken($darkgray, 25%);
    width: $search-btn-width;
    background: $darkgray;
    &:hover {
        color: $white;
        background: $navy;
    }
  }
}
</style>
