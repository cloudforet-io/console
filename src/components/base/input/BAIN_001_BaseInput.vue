<template>
  <span>
    <span class="input-container">

      <span ref="fakeInput" class="fake" />

      <span class="relative-container">
        <input ref="input" v-model="value" v-focus="isFocused"
               v-autowidth="{maxWidth: maxWidth, minWidth: minWidth, comfortZone: 1}"
               class="pl-2" autocomplete="off" type="text"
               placeholder="Search" @focus="onFocus" @blur="onBlur" @input="onInput"
               @keyup.enter="onEnter"
               @keyup.down="onKeyDown" @keyup.up="onKeyUp"
        >

        <div v-if="isFocused && isKeyListShown && keyList.length > 0" ref="listContainer" class="list-container"
             :style="{top: `${listPosY}px`, height: `${listHeight}px`}"
        >
          <b-list-group>
            <b-list-group-item v-for="(key, idx) in keyList" :key="`key:${idx}`"
                               ref="list" :class="{'hovered': idx === hoveredItemIdx}"
                               @mousedown.prevent="onSelectKey(key, idx)"
                               @mouseover="onMouseover(idx)" @mouseout="onMouseout"
            >
              <b-row class="no-gutters justify-content-between">
                <b-col class="col-8 key-label">{{ key.label }}</b-col>
                <b-col v-if="key.values || key.ajax" class="col-4 caret">
                  <i class="fa fa-caret-right" />
                </b-col>
                <b-col v-else-if="key.type" class="col-4 type-caption">{{ key.type }}</b-col>
              </b-row>
            </b-list-group-item>
          </b-list-group>
        </div>

        <div v-if="isFocused && isValueListShown && valueList.length > 0" 
             ref="listContainer" class="list-container"
             :style="{left: `${valueListPosX}px`, top: `${listPosY}px`, height: `${listHeight}px`}"
        >
          <b-list-group>
            <b-list-group-item v-for="(val, idx) in valueList" :key="`val:${idx}`"
                               ref="list" :class="{'hovered': idx === hoveredItemIdx}"
                               @mousedown.prevent="onSelectValue(val, idx)"
                               @mouseover="onMouseover(idx)" @mouseout="onMouseout"
            >
              {{ val }}
            </b-list-group-item>
          </b-list-group>
        </div>

      </span>

    </span>
  </span>
</template>

<script>
import { focus } from 'vue-focus';

const contentsModel = {
  label: '',
  key: '',
  value: '',
  operator: ':',
  type: 'String',
  subKey: ''
};

const appendableOperators = ['=', '>', '<', '!', '$'];

export default {
  name: 'BaseInput',
  event: ['add', 'update', 'delete'],
  directives: { focus: focus },
  props: {
    /**
     * @description listData is array of query data object.
     *              Query data object's format: { label, (values || ajax) }
     *              Query data object's property description:
     *                - label: {String}
     *                - values: {Array<String>}
     *                - ajax: {Object: { url: {String}, method: {String}, params: {Object} }}
     *              Examples:
     *                - { label: 'name', values: ['John', 'Sam', 'Json', ...] }
     *                - { label: 'name', ajax: { url: '/users', method: 'get', params: { limit: 10 } } }
     */
    listData: {
      type: Array,
      default: () => []
    },
    contents: {
      type: Object,
      default: () => (Object.assign({}, contentsModel))
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    autoselect: {
      type: Boolean,
      default: false
    },
    maxWidth: {
      type: String,
      default: '100%'
    },
    minWidth: {
      type: String,
      default: '100px'
    }
  },
  data () {
    return {
      value: '',
      isFocused: false,
      isKeyListShown: true,
      isValueListShown: false,
      selected: {},
      selectedArr: [],
      selectedKeyObj: null,
      keyList: this.listData,
      staticValueList: [],
      valueList: [],
      hoveredItemIdx: null,
      commitEventName: 'add',
      isEnterEmittedBlur: false,
      valueListPosX: 0,
      listPosY: 0,
      listHeight: 0
    };
  },
  created () {
    this.commitEventName = this.$listeners.update !== undefined ? 'update' : 'add';

    this.initSelectedData();

    this.value += this.selected.value;

    this.isFocused = this.autofocus;
  },
  mounted () {
    this.setKeyListPosition();
  },
  methods: {
    setKeyListPosition () {
      let inputRect = this.$refs.input.getBoundingClientRect();
      this.listPosY = inputRect.height;
      this.listHeight = self.innerHeight - inputRect.y - inputRect.height - 60;
    },
    initSelectedData () {
      this.selected.label = this.contents.label || '';
      this.selected.key = this.contents.key || '';
      this.selected.value = this.contents.value || '';
      this.selected.operator = this.contents.operator || ':';
      this.selected.type = this.contents.type || 'String';
      this.selected.subKey = this.contents.subKey || '';

      if (this.selected.key) {
        this.selectedKeyObj = this.findKeyObjFromKeyList(this.selected.label);
        if (this.selected.subKey) this.value = `${this.selected.label}.${this.selected.subKey} ${this.selected.operator} `;
        else this.value = `${this.selected.label} ${this.selected.operator} `;
      }
    },
    onInput (e) {
      if (this.selected.key) { // to detect the case of editting key section
        let operatorIdx = this.value.indexOf(':');

        if (operatorIdx < 0 && !this.selected.type === 'SubKey' &&
            !this.value.trim().startsWith(this.selected.label)) {
          this.resetKey();
          return;
        }

        if (e.target.selectionStart <= operatorIdx) { // editting key section
          let keyStr = this.value.substring(0, operatorIdx).trim();
          if (this.selected.type === 'SubKey') {
            /**
             * TODO: detect editting key or subkey
             */
          } else this.resetKey(keyStr);
        } else { // editting value section
          let valStr = this.value.substring(operatorIdx);
          this.setOperator(valStr);
          this.refreshValueList(valStr.substring(this.selected.operator.length));
        }
      } else this.resetKey(this.value.trim());
    },
    refreshKeyList (val) {
      val = val.trim().toLowerCase();
      let temp = [];
      this.listData.map((item, idx) => {
        if (item.label.toLowerCase().indexOf(val) !== -1) temp.push(item);
      });
      this.keyList = temp;
    },
    refreshValueList (val) {
      val = val.trim().toLowerCase();
      let temp = [];
      this.staticValueList.map((value, idx) => {
        if (value.toLowerCase().indexOf(val) !== -1) temp.push(value);
      });
      this.valueList = temp;
    },
    async onSelectKey (item, idx) {
      this.setKey(item);
      if (this.selected.type === 'SubKey') this.value = `${this.selected.label}.`;
      else this.value = `${this.selected.label} ${this.selected.operator}`;
      this.hideKeyList();
      await this.setValueListByKeyObj();
      this.showValueList();
    },
    async setValueListByKeyObj () {
      if (!this.selectedKeyObj) return;

      if (this.selectedKeyObj.values) this.staticValueList = this.selectedKeyObj.values;
      else if (this.selectedKeyObj.ajax) {
        let res;
        try {
          res = await this.$http[this.selectedKeyObj.ajax.method](this.selectedKeyObj.ajax.url,
            this.selectedKeyObj.ajax.params ? { params: this.selectedKeyObj.ajax.params } : {});

          this.staticValueList = res.data;
        } catch (e) {
          console.error(e);
        }
      } else {
        this.staticValueList = [];
      }
      this.valueList = this.staticValueList;
    },
    showValueList () {
      this.isValueListShown = true;

      // set list position X
      this.$refs.fakeInput.textContent = `${this.selected.label} ${this.selected.operator} `;
      this.valueListPosX = this.$refs.fakeInput.clientWidth;
    },
    hideValueList () {
      this.isValueListShown = false;
      this.hoveredItemIdx = null;
    },
    showKeyList () { this.isKeyListShown = true; },
    hideKeyList () {
      this.isKeyListShown = false;
      this.hoveredItemIdx = null;
    },
    onSelectValue (val, idx) {
      this.setOperator(this.value.substring(this.value.indexOf(':')));
      this.setValue(val);
      this.hideValueList();
      this.value = `${this.selected.label} ${this.selected.operator} ${this.selected.value}`;
    },
    resetKey (val) {
      this.hideValueList();
      this.refreshKeyList(val || this.value);
      this.showKeyList();
      this.selectedKeyObj = null;
      this.selected = Object.assign({}, contentsModel);
    },
    resetValue () {
      this.hideKeyList();
      this.setValueListByKeyObj();
      this.refreshValueList();
      this.showValueList();
      this.selected.value = '';
    },
    resetAll () {
      this.value = '';
      this.hideValueList();
      this.keyList = this.listData;
      this.showKeyList();
      this.selectedKeyObj = null;
      this.selectedArr = [];
      this.selected = Object.assign({}, contentsModel);
    },
    onEnter () {
      // when the list item is selected
      if (this.hoveredItemIdx !== null) {
        if (this.isKeyListShown && this.hoveredItemIdx < this.keyList.length) {
          this.onSelectKey(this.keyList[this.hoveredItemIdx], this.hoveredItemIdx);
          return;
        } else if (this.isValueListShown && this.hoveredItemIdx < this.valueList.length) {
          this.onSelectValue(this.valueList[this.hoveredItemIdx], this.hoveredItemIdx);
          return;
        }
      }

      this.commit();
      this.isEnterEmittedBlur = true;
    },
    commit () {
      let val = this.value.trim();
      if (this.commitEventName === 'update' && val === '') this.$emit('delete');
      if (val === '') return;
      this.setSelectedData(val);

      if (this.selectedArr.length === 0) this.selectedArr.push(this.selected);
      this.$emit(this.commitEventName, this.selectedArr);

      this.setKeyListPosition();
      this.resetAll();
    },
    setSelectedData (val) {
      if (this.selected.key) {
        let operatorIdx = val.indexOf(':');
        let keyStr = val.substring(0, operatorIdx).trim();
        let valStr = val.substring(operatorIdx);

        this.setOperator(valStr);
        if (this.selected.type === 'SubKey') this.setSubKey(keyStr);
        this.setValue(valStr.substring(this.selected.operator.length));
      } else {
        if (val.includes(' ') || val.includes('\n') || val.includes('\t')) {
          this.setContinuousValue(val);
        } else this.setValue(val);
      }
    },
    setKey (keyObj) {
      this.selectedKeyObj = keyObj;
      this.selected.key = keyObj.key;
      this.selected.label = keyObj.label;
      this.selected.type = keyObj.type || 'String';
    },
    setSubKey (val) {
      this.selected.subKey = val.substring(this.selected.label.length + 1);
    },
    setValue (val) {
      this.selected.value = this.filterValueWithType(val);
    },
    setOperator (val) {
      if (appendableOperators.includes(val[1])) this.selected.operator = ':' + val[1];
      else this.selected.operator = ':';
    },
    findKeyObjFromKeyList (val) {
      for (var i = 0; i < this.keyList.length; i++) {
        if (val === this.keyList[i].label) return this.keyList[i];
      }
      return null;
    },
    setContinuousValue (val) {
      val += ' ';
      let start = 0;
      for (var i = 0; i < val.length; i++) {
        if (val[i] === ' ' || val[i] === '\n' || val[i] === '\t') {
          if (start < i) {
            this.selected.value = val.substring(start, i);
            this.selected.operator = ':';
            this.selected.type = 'String';
            this.selectedArr.push(Object.assign({}, contentsModel, this.selected));
          }
          start = i + 1;
        }
      }
    },
    filterValueWithType (val) {
      if (this.selectedKeyObj) {
        switch (this.selectedKeyObj.type) {
        case 'Boolean':
          if (val === '0' || val === 'false') val = false;
          else if (val === '1' || val === 'true') val = true;
          else val = '';
          break;
        case 'Number':
          val = Number(val);
          val = isNaN(val) ? '' : val;
          break;
        default: val = val || '';
        }
      }

      return val;
    },
    onFocus () {
      this.isFocused = true;

      if (this.autoselect) this.captureText();
    },
    onBlur () {
      this.isFocused = false;
      this.hoveredItemIdx = null;

      if (this.$listeners.update !== undefined) {
        if (this.isEnterEmittedBlur) this.isEnterEmittedBlur = false;
        else this.commit();
      }
    },
    onKeyDown (e) {
      let arr = this.isKeyListShown ? this.keyList : this.valueList;
      if (this.hoveredItemIdx === null || this.hoveredItemIdx >= arr.length - 1) {
        this.hoveredItemIdx = 0;
        this.$refs.listContainer.scrollTop = 0;
        return;
      } else this.hoveredItemIdx++;

      let listContainerRect = this.$refs.listContainer.getBoundingClientRect();
      let listItemRect = this.$refs.list[this.hoveredItemIdx].getBoundingClientRect();
      if (listContainerRect.height < listItemRect.y - listContainerRect.y + listItemRect.height) {
        this.$refs.listContainer.scrollTop += listItemRect.height;
      }
    },
    onKeyUp () {
      if (this.hoveredItemIdx === null || this.hoveredItemIdx <= 0) {
        let arr = this.isKeyListShown ? this.keyList : this.valueList;
        this.hoveredItemIdx = arr.length - 1;
        this.$refs.listContainer.scrollTop = this.$refs.listContainer.scrollHeight;
        return;
      } else this.hoveredItemIdx--;

      let listContainerRect = this.$refs.listContainer.getBoundingClientRect();
      let listItemRect = this.$refs.list[this.hoveredItemIdx].getBoundingClientRect();
      if (listItemRect.y < listContainerRect.y) {
        this.$refs.listContainer.scrollTop -= listItemRect.height;
      }
    },
    onMouseover (idx) { this.hoveredItemIdx = idx; },
    onMouseout () { this.hoveredItemIdx = null; },
    captureText () {
      if (!this.value) return;

      // set text selection
      if (this.selected.key !== null && this.selected.value !== null) {
        let start = this.value.indexOf(':') + this.selected.operator.length;
        this.$refs.input.setSelectionRange(start, this.value.length);
        this.hideKeyList();
        this.setValueListByKeyObj();
        this.refreshValueList(this.value.substring(start));
        this.showValueList();
      } else {
        this.$refs.input.setSelectionRange(0, this.value.length);
        this.hideValueList();
        this.showKeyList();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.input-container {
  position: relative;
  .fake {
    position: absolute;
    left: 0;
    visibility: hidden;
  }
  .relative-container {
    position: relative;
    input {
      border: 0;
      // border: 1px solid red;
      background-color: transparent;
      word-break: break-all;
    }
    .list-container {
      position: absolute;
      display: inline-block;
      width: 250px;
      min-height: 100px;
      max-height: 600px;
      overflow-y: scroll;
      z-index: 3;
      left: 0;
      .list-group {
        box-shadow: 0 0 4px 0 rgba($black, 0.4);
        border-radius: 5px;
        padding: 10px;
        background-color: darken($navy, 2%);
      }
      .list-group-item {
        cursor: pointer;
        padding: 5px 8px;
        color: $lightgray;
        font-size: .9rem;
        background-color: transparent;
        border-radius: 5px;
        &.hovered {
          background-color: lighten($navy, 9%);
        }
        .key-label {
          text-overflow: ellipsis;
          overflow:hidden;
          white-space:nowrap;
        }
        .caret {
          text-align: right;
          color: $darkgray;
        }
        .type-caption {
          text-align: right;
          font-weight: 300;
          color: $darkgray;
        }
      }
    }
  }
}
</style>
