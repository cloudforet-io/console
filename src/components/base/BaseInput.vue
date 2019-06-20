<template>
  <div class="input-box">
    <input ref="input" v-model="value"
           v-focus="isFocused"
           v-autowidth="{maxWidth: '100%', minWidth: '50px', comfortZone: 1}"
           v-select="textCaptureOption"
           class="pl-2" autocomplete="off" type="text"
           placeholder="Search" @focus="onFocus" @blur="onBlur" @input="onInput"
           @keyup.delete="onDelete" @keyup.enter="onEnter" @select="onTextCaptured"
           @mouseup="onTextMouseUp"
    >

    <div v-if="isFocused && keyListUp" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(key, idx) in keyList" :key="`key:${idx}`"
                           @mousedown.prevent="onSelectKey(key, idx)"
        >
          {{ key.label }}
        </b-list-group-item>
      </b-list-group>
    </div>

    <div v-if="isFocused && valueListUp" class="list-container">
      <b-list-group>
        <b-list-group-item v-for="(val, idx) in valueList" :key="`val:${idx}`"
                           @mousedown.prevent="onSelectValue(val, idx)"
        >
          {{ val }}
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
      keyList: this.listData,
      staticValueList: [],
      valueList: [],
      textCaptureOption: { switch: false, text: '' }
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    /**
     * @description It decides whether keyList or valueList must be refreshed
     *              when input is detected.
     */
    onInput (e) {
      if (e.inputType === 'deleteContentBackward') return
      console.log('input', this.value)
      if (this.keyListUp) this.refreshKeyList(this.value)
      else if (this.valueListUp) {
        this.refreshValueList(this.refinedValue())
      }
    },
    setKey (key) {
      this.selected.key = key.label.split(':')[0].trim()
      this.value = `${this.selected.key} : `
      console.log(`key: ${this.selected.key}`)
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
      console.log('set valueList: ', data)
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
      console.log('value list refreshed: ', this.valueList)
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
      if (this.selected.key === null) {
        let val = this.value ? this.value.trim() : ''
        if (val === '') this.value = null
        else {
          val = val.startsWith('Search :') ? this.refinedValue() : val
          this.selected.value = val
          this.value = `Search : ${this.selected.value}`
        }
      } else { // when 'key' has been set
        let val = this.refinedValue()
        if (val === '') {
          this.selected.value = null
          this.value = `${this.selected.key} :`
        } else {
          this.selected.value = val
          this.value = `${this.selected.key} : ${this.selected.value}`
        }
      }
      this.isFocused = false
    },
    onFocus () {
      this.isFocused = true
      if (!this.value) return

      // set text selection
      if (this.selected.key === null) {
        if (this.value.startsWith('Search :')) this.value = this.refinedValue()
        this.textCaptureOption = { switch: true, text: this.selected.value }
      } else if (this.selected.value === null) {
        this.textCaptureOption = { switch: true, text: this.selected.key }
      } else this.textCaptureOption = { switch: true, text: this.selected.value }
    },
    onBlur () {
      this.isFocused = false
      this.onEnter()
    },
    onTextCaptured () {
      this.textCaptureOption = { switch: false, text: undefined }
    },
    onTextMouseUp (e) {
      // This is called after onFocus()
      console.log('ontext mouseup', e.target.selectionStart)
      if (!this.value) return

      if (this.selected.key === null) {

      } else if (this.selected.value === null) {

      } else ;
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
