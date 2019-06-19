<template>
  <div class="search-container">
    <b-input-group>
      <b-col cols="10" class="pl-0 pr-0 pb-1 input-box" @click="onInputClick">
        <div class="d-inline query-badge">
          <span v-for="(query, idx) in queryList" :key="idx" class="ml-2">
            <input v-if="query.updatable" v-model="tagValue" v-focus="isTagFocused"
                   v-autowidth="{minWidth: '50px'}" class="query-input" @focus="isTagFocused = true"
                   @blur="isTagFocused = false"
            >
            <b-badge v-else variant="success">
              <span class="query-content" @mousedown="onUpdateQuery($event, idx)">
                {{ query.key }}: {{ query.value }}
              </span>
              <i class="query-delete-btn fa fa-times-circle" @click="onDeleteQuery(idx)" />
            </b-badge>
          </span>
        </div>

        <input v-model="value" v-focus="isValueFocused" v-autowidth="{minWidth: '50px', comfortZone: '5px'}"
               class="pl-2 value-input" autocomplete="off" type="text" placeholder="Search"
               @focus="isValueFocused = true" @blur="isValueFocused = false" @input="onValueInput"
               @keyup.enter="onEnterKey" @keydown.delete="onDeleteKey" @keydown.up="onUpKey"
               @keydown.down="onDownKey"
        >
      </b-col>

      <b-input-group-append>
        <b-button block variant="primary" :limit="limit" :skip="skip" :sort="sort"
                  @click.prevent="searchFn(limit, skip, sort, value)"
        >
          Search
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <div v-show="isValueFocused && selected.key === null && !!keyList.length"
         v-focus="isQueryFocused" class="list-container" @focus="isQueryFocused = true"
         @blur="isQueryFocused = false"
    >
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="key.label"
                           @mousedown="onSelect($event, key.label, idx)"
        >
          {{ key.label }}
        </b-list-group-item>
      </b-list-group>
    </div>

    <div v-show="isValueFocused && selected.key !== null && !!valueList.length"
         class="list-container"
    >
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in valueList" :key="key"
                           @mousedown="onSelect($event, key, idx)"
        >
          {{ key }}
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus'
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
      queryList: [],
      keyList: [],
      valueList: []
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
      }
      this.keyList = temp
    },
    onInputClick () {
      if (!this.isTagFocused) this.isValueFocused = true
    },
    onSelect (e, key, idx) {
      if (this.selected.key === null) {
        e.preventDefault() // prevent emitting 'blur' event for controlling input focus
        this.selected.key = key
        this.value = `${key}:`
        this.valueList = this.keyList[idx].list ? this.keyList[idx].list : []
      } else if (this.selected.value === null) {
        this.selected.value = key
        this.addQueryList()
      }
    },
    onEnterKey () {
      if (this.value === null) return

      let split = this.value.split(':')
      if (split[1] === undefined) {
        this.selected.key = 'Search'
        this.selected.value = split[0]
      } else this.selected.value = split[1]

      this.addQueryList()
    },
    onDeleteKey () {
      console.log('backspace')
      let split = this.value.split(':')
      if (split[1] === undefined) {
        this.selected.key = null
        this.selected.value = null
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
    },
    onUpdateQuery (e, idx) {
      e.preventDefault() // prevent emitting 'blur' event for controlling input focus
      this.isValueFocused = false
      this.isTagFocused = true
      this.tagValue = `${this.queryList[idx].key}: ${this.queryList[idx].value}`
      this.$set(this.queryList[idx], 'updatable', true)
      console.log('update query...', this.queryList)
    },
    onDeleteQuery (idx) {
      this.queryList.splice(idx, 1)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
  .input-box {
    border: 1px solid lightgray;
    border-radius: 5px 0 0 5px;
    background-color: #fff;
    cursor: text;
    .query-badge {
      font-size: 1.35em;
      .query-input {
        font-size: 0.75em;
        border: 0;
      }
      .query-content {
        cursor: pointer;
      }
      .query-delete-btn {
        cursor: pointer;
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
    left: 0;
    z-index: 1;
    .list-group-item {
      cursor: pointer;
      &:hover {
        background-color: lightgray;
      }
    }
  }
}
</style>
