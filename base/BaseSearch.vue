<template>
  <div>
    <div class="search-container">
      <b-input-group>
        <b-col ref="inputBox" cols="10" class="p-1 input-box" @click="onInputBoxClick">
          <span v-for="(query, idx) in queryList" :key="idx" class="ml-1 mb-1 float-left">
            <input v-if="query.updatable" ref="updateInput" v-model="tagValue" v-focus="isTagFocused"
                   v-autowidth="{maxWidth: `${$refs.inputBox.clientWidth - 40}px`, minWidth: '50px', comfortZone: 1}"
                   class="pl-2 tag-input" @focus="isTagFocused = true" @blur="isTagFocused = false"
                   @keyup.enter="updateQuery(idx)"
            >
            <b-badge v-else variant="success" class="tag-badge">
              <span :style="{ maxWidth: `${$refs.inputBox.clientWidth - 40}px` }"
                    @click="onClickQuery(idx)"
              >
                {{ query.key }}: {{ query.value }}
              </span>
              <i class="fa fa-times-circle" @click="onDeleteQuery(idx)" />
            </b-badge>
          </span>

        <!-- <input ref="newInput" v-model="value" v-focus="isValueFocused"
               v-autowidth="{maxWidth: '100%', minWidth: '50px', comfortZone: 1}"
               class="float-left pl-2 value-input" autocomplete="off" type="text" placeholder="Search"
               @focus="isValueFocused = true" @blur="isValueFocused = false" @input="onValueInput"
               @keydown.esc="onEscKey" @keyup.enter="addQuery" @keydown.delete="onDeleteKey"
               @keydown.up="onUpKey" @keydown.down="onDownKey"
        > -->
        </b-col>

        <b-input-group-append class="col-2 pl-0">
          <b-button block variant="primary" :limit="limit" :skip="skip" :sort="sort"
                    @click.prevent="searchFn(limit, skip, sort, value)"
          >
            <i class="fa fa-search" />
          </b-button>
        </b-input-group-append>
      </b-input-group>
      <div v-if="showKeyList" class="list-container">
        <b-list-group>
          <b-list-group-item v-for="(key, idx) in keyList" :key="key.label"
                             @mousedown.prevent="onSelect(key.label, idx)"
          >
            {{ key.label }}
          </b-list-group-item>
        </b-list-group>
      </div>

      <div v-if="showValueList" class="list-container">
        <b-list-group>
          <b-list-group-item v-for="(key, idx) in valueList" :key="key"
                             @mousedown.prevent="onSelect(key, idx)"
          >
            {{ key }}
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>

    <div class="temp-container">
      <BaseInput :list-data="queryData" />
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus'
import BaseInput from '@/components/base/BaseInput'
export default {
  name: 'BaseSearch',
  // components: {
  //   Hilight: {
  //     functional: true,

  //     render (h, { children }) {
  //       return h('span', {
  //         staticClass: 'hilight',
  //         style: {
  //           color: 'red',
  //           fontSize: '14px'
  //         }
  //       }, children)
  //     }
  //   }
  // },
  directives: { focus: focus },
  components: { BaseInput },
  props: {
    searchFn: {
      type: Function,
      required: true
    },
    queryData: {
      type: Array,
      default: () => []
    },
    limit: {
      type: Number,
      default: 10
    },
    skip: {
      type: Number,
      default: 0
    },
    sort: {
      type: String,
      default: 'created_date'
    }
  },
  data () {
    return {
      value: null,
      isValueFocused: false,
      tagValue: null,
      isTagFocused: false,
      isQueryFocused: false,
      selected: { key: null, value: null },
      updating: { key: null, value: null },
      queryList: [],
      keyList: [],
      valueList: []
    }
  },
  computed: {
    keyListLeft () {
      console.log(this.$refs.newInput.offsetLeft)
      return this.$refs.newInput.clientWidth
    },
    showKeyList () {
      return this.isValueFocused && this.selected.key === null && !!this.keyList.length
    },
    showValueList () {
      return this.isValueFocused && this.selected.key !== null && !!this.valueList.length
    }
  },
  created () {
    this.keyList = this.queryData
  },
  methods: {
    onValueInput () {
      let temp = []
      if (this.selected.key === null) {
        this.queryData.map((key, idx) => {
          if (key.label.indexOf(this.value) !== -1) {
            temp.push(key)
          }
        })
      } else {
        if (this.keyList.values) this.valueList = this.keyList.values
      }
      this.keyList = temp
    },
    onTagValueInput () {
      let temp = []
      if (this.updating.key === null) {
        this.queryData.map((key, idx) => {
          if (key.label.indexOf(this.value) !== -1) {
            temp.push(key)
          }
        })
      } else {
        if (this.keyList.values) this.valueList = this.keyList.values
      }
      this.keyList = temp
    },
    onInputBoxClick (e) {
      if (!this.isValueFocused && !this.isTagFocused) this.isValueFocused = true
    },
    onSelect (key, idx) {
      let item = this.isValueFocused ? this.selected : this.updating
      if (item.key === null) {
        item.key = key
        this.value = `${key}:`
        this.valueList = this.keyList[idx].values ? this.keyList[idx].values : []
      } else if (item.value === null) {
        item.value = key
        this.addQueryList()
      }
    },
    addQuery () {
      if (this.value === null) return
      let split = this.value.split(':')
      if (split[1] === undefined) {
        this.selected.key = 'Search'
        this.selected.value = split[0]
      } else this.selected.value = split[1]

      this.addQueryList()
    },
    onEscKey () {

    },
    onDeleteKey () {
      console.log('backspace')
      let split = this.value.split(':')
      if (split[1] === undefined) {
        this.selected = { key: null, value: null }
      }
    },
    onUpKey () {
      console.log('up')
      this.isValueFocused = false
      this.isQueryFocused = true
    },
    onDownKey () {
      console.log('down')
    },
    addQueryList () {
      this.queryList.push(this.selected)
      this.value = null
      this.selected = { key: null, value: null }
      this.isValueFocused = true
      this.keyList = this.queryData
    },
    onClickQuery (idx) {
      this.isTagFocused = true
      this.tagValue = `${this.queryList[idx].key}: ${this.queryList[idx].value}`
      this.updating.key = this.queryList[idx].key
      this.updating.value = this.queryList[idx].value
      this.$set(this.queryList[idx], 'updatable', true)
    },
    onDeleteQuery (idx) {
      this.queryList.splice(idx, 1)
    },
    updateQuery (idx) {
      if (this.tagValue === null) this.onDeleteQuery(idx)
      else {
        let split = this.tagValue.split(':')
        if (split[1] === undefined) {
          this.updating.key = 'Search'
          this.updating.value = split[0]
        } else this.updating.value = split[1]

        this.$set(this.queryList, idx, this.updating)
      }

      this.updating = { key: null, value: null }
      this.isValueFocused = true
    }
  }
}
</script>

<style lang="scss" scoped>
$input-height: 23px;

.search-container {
  position: relative;
  .input-box {
    border: 1px solid lightgray;
    border-radius: 5px 0 0 5px;
    background-color: #fff;
    cursor: text;
    .tag-input {
      display: inline-block;
      height: $input-height;
      border: 0;
      color: #777;
    }
    .tag-badge {
      display: inline-block;
      max-width: 100%;
      height: $input-height;
      line-height: 16px;
      span {
        display: inline-block;
        font-size: 1.25em;
        cursor: pointer;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        vertical-align: text-bottom;
      }
      i {
        font-size: 1.3em;
        cursor: pointer;
        margin-left: 5px;
      }
    }
    .value-input {
      border: 0;
      background-color: transparent;
      word-break: break-all;
    }
  }
  .list-container {
    position: absolute;
    z-index: 2;
    .list-group-item {
      cursor: pointer;
      &:hover {
        background-color: lightgray;
      }
    }
  }
}
</style>
