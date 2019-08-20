<template>
  <div>
    <div class="search-container">
      <b-input-group class="row no-gutters">
        <b-col cols="10" class="input-container">
          <div ref="inputBox" class="p-1 input-box" @click.self="focusOnInput">
            <InputTag v-for="(tag, idx) in tagList" 
                      :key="tag.id"
                      :idx="idx"
                      :list-data="contextData.queryList" 
                      :contents="tag"
                      @delete="deleteTagAndSearch(idx)"
                      @update="upsertTagAndSearch"
            />

            <BaseInput ref="input" :list-data="contextData.queryList" @add="addTagAndSearch" />
          </div>
          <span class="input-delete-button" @click="deleteAll"><i class="fal fa-times" /></span>
        </b-col>

        <b-input-group-append class="col-2 pl-0">
          <b-button block class="search-btn" @click="search">
            <i class="fal fa-search" />
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
    created () {

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
                let idx = this.getIdxFromFilterListWithTag(obj);
                if (this.isEmpty(idx)) {
                    this.addQueryToFilterList(obj);
                } else {
                    let tag = this.getSameKeyTagFromTagListWithFilterName(obj, 'filter');
                    if (!this.isEmpty(tag)) {
                        this.deleteQueryFromFilterList(tag);
                        this.addQueryToFilterOrList(tag);
                    }
                    this.addQueryToFilterOrList(obj);
                }
            }
        },
        addQueryToFilterOrListWithAutoKey (obj) {
            this.contextData.autokeyList.map((autokey) => {
                this.filterOrList.push({ 
                    key: autokey,
                    value: obj.value,
                    operator: this.getOperator(obj.operator)
                });
                obj.filterIdxList.push(this.filterOrList.length - 1);
            });
            obj.filterName = 'filterOr';
        },
        addQueryToFilterOrList (obj) {
            this.filterOrList.push({
                key: obj.key,
                value: obj.value,
                operator: this.getOperator(obj.operator) 
            });
            obj.filterName = 'filterOr';
            obj.filterIdxList.push(this.filterOrList.length - 1);
        },
        addQueryToFilterList (obj) {
            this.filterList.push({
                key: obj.key,
                value: obj.value,
                operator: this.getOperator(obj.operator) 
            });
            obj.filterName = 'filter';
            obj.filterIdxList.push(this.filterList.length - 1);
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
        updateQueryFromFilterOrList (obj) {
            obj.filterIdxList.map((idx) => {
                this.filterOrList[idx] = {
                    key: obj.key,
                    value: obj.value,
                    operator: this.getOperator(obj.operator)
                };
            });
        },
        updateQueryFromFilterList (obj) {
            obj.filterIdxList.map((idx) => {
                this.filterList[idx] = {
                    key: obj.key,
                    value: obj.value,
                    operator: this.getOperator(obj.operator)
                };
            });
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
            this.filterList.splice(obj.filterIdxList[0], obj.filterIdxList.length);
            obj.filterIdxList = [];
            obj.filterName = '';
        },
        deleteQueryFromFilterOrList (obj) {
            this.filterOrList.splice(obj.filterIdxList[0], obj.filterIdxList.length);
            obj.filterIdxList = [];
            obj.filterName = '';
        },
        deleteAll () {
            this.tagList = [];
            this.filterList = [];
            this.filterOrList = [];
        },
        search () {
            this.$emit('search', this.filterList, this.filterOrList);
        },
        getNewTag (item) {
            return Object.assign({ 
                id: ++this.lastId, 
                filterName: '', 
                filterIdxList: []
            }, item);
        },
        getIdxFromFilterListWithTag (obj) {
            let idx = null;
            this.filterList.some((item, i) => {
                if (item.key === obj.key) { 
                    idx = i;
                }
                return item.key === obj.key; 
            });
            return idx;
        },
        getSameKeyTagFromTagListWithFilterName (obj, filterName) {
            let tag = null;
            if (this.isEmpty(filterName)) {
                filterName = 'filter';
            }
            this.tagList.some((item, i) => {
                if (item.key === obj.key && item.filterName === filterName) { 
                    tag = item;
                }
                return !!(item.key === obj.key && item.filterName === filterName); 
            });
            return tag;
        },
        getOperator (op) {
            switch (op) {
            case ':': return 'contain';
            case ':=': return 'eq';
            case ':>': return 'gte';
            case ':<': return 'lte';
            case ':!': return 'not_contain';
            case ':$': return 'regex';
            default: return 'contain';
            }
        },
        focusOnInput () {
            this.$refs.input.isFocused = true;
        }
    }
};
</script>

<style lang="scss" scoped>
$input-height: 23px;

.search-container {
  position: relative;
  .input-container {
      border: 1px solid $gray;
      border-radius: 5px 0 0 5px;
      background-color: #fff;
      padding-left: 10px;
    .input-box {
      display: inline-block;
      width: 95%;
      cursor: text;
      vertical-align: middle;
    }
    .input-delete-button {
      display: inline-block;
      width: 5%;
      padding-right: 8px;
      font-size: 1.2em;
      color: $darkgray;
      text-align: right;
      vertical-align: middle;
      cursor: pointer;
    }
  }
  .search-btn {
    border-radius: 0 5px 5px 0;
    color: $navy;
    width: 120px;
    i {
      font-weight: 600;
    }
  }
}
</style>
