<template>
  <div class="input-box">
    <input v-model="value" v-focus="isFocused"
           v-autowidth="{maxWidth: '100%', minWidth: '50px', comfortZone: 1}"
           refs="input"
           class="pl-2" autocomplete="off" type="text" placeholder="Search"
           @focus="onFocus" @blur="onBlur" @input="onInput" @keydown.delete="onDelete"
           @keyup.enter="onEnter"
    >
    <div v-if="isFocused && keyListUp" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="key.label"
                           @mousedown.prevent="onSelect(key, idx)"
        >
          {{ key.label }}
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>

<script>
import { focus } from 'vue-focus'
export default {
  name: 'BaseInput',
  directives: { focus: focus },
  props: {
    listData: {
      type: Array,
      default: () => []
    },
    selectFn: {
      type: Function,
      default: () => {}
    },
    inputFn: {
      type: Function,
      default: () => {}
    },
    recommandable: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      value: null,
      isFocused: false,
      keyListUp: true,
      valueListUp: false,
      selected: { key: null, value: null },
      updateMode: false,
      keyList: this.listData
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    onInput () {
      console.log('input')
      if (this.updateMode) {
        /**
         * TODO: cursor position check?
         */
        // let split = this.value.split(':')
        // if (split[0]) this.setKey(split[0])
      } else {
        if (this.keyListUp) {
          if (this.value.indexOf(':') !== -1) {
            this.setKey()
            this.valueListUp = true
          } else this.refreshKeyList()
        } else if (this.valueListUp) {
          this.refreshValueList()
        }
      }
    },
    setKey (val) {
      if (val === undefined) val = this.value
      this.selected.key = val.split(':')[0].trim()
      this.value = `${this.selected.key}: `
      this.keyListUp = false
      console.log(`key: ${this.selected.key}, value: ${this.selected.value}`)
    },
    setValue (val) {
      if (val === undefined) val = this.value
      this.selected.value = val.trim()
      this.value = `${this.selected.key}: ${this.selected.value}`
    },
    refreshKeyList () {
      this.keyListUp = true
      let temp = []
      this.listData.map((item, idx) => {
        if (item.label.indexOf(this.value) !== -1) {
          temp.push(item)
        }
      })
      this.keyList = temp
    },
    refreshValueList () {
    },
    onSelect (item, idx) {
      console.log('select')
      if (this.updateMode) {

      } else {
        if (this.selected.key === null) {
          this.setKey(item.label, item)
          this.valueListUp = true
        }
      }
    },
    onDelete () {
      if (this.updateMode) {

      } else {
        if (this.selected.value === null) {
          if (this.selected.key === null) {

          }
        }
      }
    },
    onEnter () {
      console.log('enter', this.value)
      if (this.updateMode) {

      } else {
        if (this.selected.key === null) {
          this.selected.key = 'Search'
          this.setValue(this.value)
        }
      }
    },
    onFocus () {
      this.isFocused = true
    },
    onBlur () {
      this.isFocused = false
    }
  }
}
</script>

<style lang="scss" scoped>

.input-box {
  position: relative;
  input {
    border: 0;
    background-color: transparent;
    word-break: break-all;
  }
  .list-container {
    position: absolute;
    display: inline-block;
    z-index: 2;
    left: 0;
    top: 23px;
    .list-group-item {
      cursor: pointer;
      &:hover {
        background-color: lightgray;
      }
    }
  }
}
</style>
