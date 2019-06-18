<template>
  <div class="search-container">
    <b-input-group>
      <div class="d-flex col-10 pr-0 input-box">
        <div class="tag-badge">
          <b-badge v-for="(tag, idx) in tagList" :key="idx" variant="success">
            {{ tag }} <i class="tag-delete-btn fa fa-times-circle" />
          </b-badge>
        </div>
        <input v-model="value" v-focus="onFocus" v-blur="onBlur"
               class="pl-2" autocomplete="off" type="text"
               placeholder="Search" @input="onInput" @keyup.enter="addValue"
        >
      </div>
      <b-input-group-append>
        <b-button variant="primary" :limit="limit" :skip="skip" :sort="sort"
                  @click.prevent="searchFn(limit, skip, sort, value)"
        >
          Search
        </b-button>
      </b-input-group-append>
    </b-input-group>

    <div v-show="isFocused && (selected.key === null || valueList.length)" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="key.label"
                           @mousedown="onSelect($event, key, idx)"
        >
          {{ key.label }}
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseSearch',
  props: {
    searchFn: {
      type: Function,
      required: true
    },
    fields: {
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
      isFocused: false,
      selected: { key: null, value: null },
      query: [],
      tags: []
    }
  },
  computed: {
    keyList () { return this.fields },
    valueList () { return [] },
    tagList () { return this.tags }
  },
  methods: {
    onInput (val) {
      // console.log('onInput', this.keyList.map(key => key.label))
    },
    onFocus () {
      this.isFocused = true
    },
    onBlur () {
      this.isFocused = false
    },
    onSelect (e, key, idx) {
      if (this.selected.key === null) {
        e.preventDefault()
        this.selected.key = key.label
        this.value = `${key.label}:`
      } else if (this.selected.value === null) {
        this.selected.value = key.label
        this.addQuery()
      }
    },
    addValue () {
      this.selected.value = this.value.split(':')[1]
      this.addQuery()
    },
    addQuery () {
      this.tags.push(this.value)
      this.query.push(this.selected)
      this.value = null
      this.selected = { key: null, value: null }
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
    .tag-badge {
      font-size: 1.35em;
      .tag-delete-btn {
        cursor: pointer;
      }
    }
    input {
      border: 0;
      background-color: transparent;
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
