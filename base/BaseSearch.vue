<template>
  <div class="search-container">
    <b-input-group>
      <b-form-input ref="input" v-focus="onFocus" v-blur="onBlur"
                    :value="value" autocomplete="off" type="text"
                    placeholder="Search" @input="onInput"
      />
      <b-input-group-append>
        <b-button variant="primary" :limit="limit" :skip="skip" :sort="sort"
                  @click.prevent="searchFn(limit, skip, sort, value)"
        >
          Search
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <div class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="idx">
          <div @click="onSelect(key, idx)">
            {{ key.label }}
          </div>
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
      isActive: false,
      selected: []
    }
  },
  computed: {
    keyList () { return this.fields }
  },
  methods: {
    onInput (val) {
      console.log('onInput', this.keyList.map(key => key.label))
      // this.$refs.input.value = val
    },
    onFocus () {
      this.isActive = true
    },
    onBlur () {
      this.isActive = false
    },
    onSelect (key, idx) {
      console.log('onselect')
      this.value = `${key.label}: `
      this.isActive = false
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  position: relative;
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
