<template>
  <span class="input-container">
    <input v-if="isUpdateMode" ref="input" v-model="value"
           v-focus="isFocused" v-autowidth="{maxWidth: '100%', minWidth: '50px', comfortZone: 1}"
           v-select="textCaptureOption"
           class="pl-2" autocomplete="off" type="text"
           placeholder="Search" @focus="onFocus" @blur="onBlur" @input="onInput"
           @select="onTextCaptured" @keyup.delete="onDelete" @keyup.enter="onEnter"
           @mouseup="onTextMouseUp" @keyup.down="onKeyDown" @keyup.up="onKeyUp"
    >

    <b-badge v-else variant="success" class="tag-badge m-1">
      <span @click="onUpdateMode">
        {{ selected.key ? `${selected.key} : ` : 'Search : ' }}{{ selected.value }}
      </span>
      <i class="fa fa-times-circle" @click="$emit('delete')" />
    </b-badge>

    <div v-if="isFocused && keyListUp" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="`key:${idx}`"
                           :class="{'hovered': idx === hoveredItemIdx}"
                           @mousedown.prevent="onSelectKey(key, idx)"
                           @mouseover="onMouseover(idx)" @mouseout="onMouseout"
        >
          {{ key.label }}
        </b-list-group-item>
      </b-list-group>
    </div>

    <div v-if="isFocused && valueListUp" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(val, idx) in valueList" :key="`val:${idx}`"
                           :class="{'hovered': idx === hoveredItemIdx}"
                           @mousedown.prevent="onSelectValue(val, idx)"
                           @mouseover="onMouseover(idx)" @mouseout="onMouseout"
        >
          {{ val }}
        </b-list-group-item>
      </b-list-group>
    </div>
  </span>
</template>

<script>
import { focus } from 'vue-focus'
export default {
  name: 'BaseInputTag',
  directives: { focus: focus },
  props: {
    listData: {
      type: Array,
      default: () => []
    },
    contents: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      value: null,
      isFocused: false,
      keyListUp: true,
      valueListUp: false,
      selected: { key: this.contents.key, value: this.contents.value },
      isUpdateMode: false,
      keyList: this.listData,
      staticValueList: [],
      valueList: [],
      textCaptureOption: { switch: true },
      isTextCaptured: false,
      hoveredItemIdx: null
    }
  },
  computed: {
  },
  created () {
    this.value = this.contents.key === null ? '' : `${this.contents.key} : `
    this.value += this.contents.value === null ? '' : this.contents.value
    this.onTextMouseUp()
    console.log(`[BaseInputTag] CREATED: ${this.$vnode.key} ${this.value}`)
  },
  destroyed () {
    console.log(`[BaseInputTag] DESTROYED: ${this.$vnode.key} ${this.value}`)
  },
  methods: {
    /**
     * @description It decides whether keyList or valueList must be refreshed
     *              when input is detected.
     */
    onInput (e) {
      if (e.inputType === 'deleteContentBackward') return

      if (this.keyListUp) this.refreshKeyList(this.value)
      else if (this.valueListUp) {
        this.refreshValueList(this.refinedValue())
      }
    },
    setKey (key) {
      this.selected.key = key.label.split(':')[0].trim()
      this.value = `${this.selected.key} : `
    },
    /**
     * @param data {Object} Your query data's format: { label, (values || ajax) }
     *                      Property description:
     *                      - label: {String}
     *                      - values: {Array<String>}
     *                      - ajax: {Object: { url: {String}, method: {String}, params: {Object} }}
     *                      Examples:
     *                      - { label: 'name', values: ['John', 'Sam', 'Json', ...] }
     *                      - { label: 'name', ajax: { url: '/users', method: 'get', params: { limit: 10 } } }
     */
    async setValueList (data) {
      if (data.values) this.staticValueList = data.values
      else if (data.ajax) {
        let res
        try {
          res = await this.$http[data.ajax.method](data.ajax.url,
            data.ajax.params ? { params: data.ajax.params } : {})

          this.staticValueList = res.data
        } catch (e) {
          console.error(e)
        }
      } else {
        this.staticValueList = []
      }
      this.valueList = this.staticValueList
    },
    refinedValue () {
      return this.value.substring(this.value.indexOf(':') + 1).trim()
    },
    refreshKeyList (val) {
      let temp = []
      this.listData.map((item, idx) => {
        if (item.label.indexOf(val) !== -1) {
          temp.push(item)
        }
      })
      this.keyList = temp
    },
    refreshValueList (val) {
      let temp = []
      this.staticValueList.map((value, idx) => {
        if (value.indexOf(val) !== -1) {
          temp.push(value)
        }
      })
      this.valueList = temp
    },
    async onSelectKey (item, idx) {
      this.setKey(item)
      this.keyListUp = false
      await this.setValueList(item)
      this.valueListUp = true
    },
    onSelectValue (val, idx) {
      this.selected.value = val
      this.valueListUp = false
      this.value = `${this.selected.key} : ${this.selected.value}`
    },
    onDelete () {
      let val = this.value.trim()
      this.hoveredItemIdx = null
      if (this.selected.key === null || !val.includes(':')) {
        // regard as updating 'key'
        this.valueListUp = false
        this.refreshKeyList(val)
        this.keyListUp = true
        this.selected.key = null
      } else {
        // regard as updating 'value'
        this.keyListUp = false
        this.refreshValueList(this.refinedValue())
        this.valueListUp = true
        this.selected.value = null
      }
    },
    onEnter () {
      if (this.hoveredItemIdx !== null) {
        if (this.keyListUp && this.hoveredItemIdx < this.keyList.length) {
          this.onSelectKey(this.keyList[this.hoveredItemIdx], this.hoveredItemIdx)
          this.hoveredItemIdx = null
          return
        } else if (this.valueListUp && this.hoveredItemIdx < this.valueList.length) {
          this.onSelectValue(this.valueList[this.hoveredItemIdx], this.hoveredItemIdx)
          this.hoveredItemIdx = null
          return
        }
      }

      if (this.selected.key === null) {
        let val = this.value ? this.value.trim() : ''
        if (val === '') this.value = null
        else {
          val = val.startsWith('Search : ') ? this.refinedValue() : val
          this.selected.value = val
          this.value = `Search : ${this.selected.value}`
        }
      } else { // when 'key' has been set
        let val = this.value ? this.refinedValue() : ''
        if (val === '') {
          this.selected.value = null
          this.value = `${this.selected.key} : `
        } else {
          this.selected.value = val
          this.value = `${this.selected.key} : ${this.selected.value}`
        }
      }
      this.isFocused = false
    },
    onFocus () {
      this.isFocused = true
    },
    onBlur () {
      this.isFocused = false
      this.isTextCaptured = false
      this.hoveredItemIdx = null
      this.isUpdateMode = false
      this.onEnter()
    },
    onTextCaptured () {
      this.textCaptureOption = { switch: false }
    },
    onTextMouseUp (e) {
      // This is called after onFocus()
      if (!this.value) return

      if (this.isTextCaptured) return

      // set text selection
      if (this.selected.key === null) {
        if (this.value.startsWith('Search :')) this.value = this.refinedValue()
        this.textCaptureOption = { switch: true, text: this.selected.value }
      } else if (this.selected.value !== null) {
        this.textCaptureOption = { switch: true, text: this.selected.value }
      } else this.textCaptureOption = { switch: true, index: this.value.length }
      this.isTextCaptured = true
    },
    onKeyDown () {
      let arr = this.keyListUp ? this.keyList : this.valueList
      if (this.hoveredItemIdx === null || this.hoveredItemIdx >= arr.length - 1) {
        this.hoveredItemIdx = 0
      } else this.hoveredItemIdx++
    },
    onKeyUp () {
      if (this.hoveredItemIdx === null || this.hoveredItemIdx <= 0) {
        let arr = this.keyListUp ? this.keyList : this.valueList
        this.hoveredItemIdx = arr.length - 1
      } else this.hoveredItemIdx--
    },
    onMouseover (idx) {
      this.hoveredItemIdx = idx
    },
    onMouseout () {
      this.hoveredItemIdx = null
    },
    onUpdateMode () {
      this.isUpdateMode = true
      this.isFocused = true
      this.onTextMouseUp()
    }
  }
}
</script>

<style lang="scss" scoped>
$input-height: 23px;
.input-container {
  position: relative;
  .tag-badge {
    display: inline-block;
    max-width: 99%;
    height: $input-height;
    line-height: 16px;
    span {
      display: inline-block;
      max-width: 96%;
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
      &.hovered {
        background-color: lightgray;
      }
    }
  }
}
</style>
