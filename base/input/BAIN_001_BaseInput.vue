<template>
  <span>
    <span class="input-container">

      <span ref="fakeInput" class="fake" />

      <span class="relative-container">
        <input ref="input" 
               v-model="inputText" 
               v-focus="isFocused"
               v-autowidth="{maxWidth: maxWidth, minWidth: minWidth, comfortZone: 1}"
               class="pl-2" 
               autocomplete="off" 
               type="text"
               :placeholder="tr('SEARCH')"
               @focus="onFocus" 
               @blur="onBlur" 
               @input="onInput"
               @keyup.enter="onEnter"
               @keyup.down="onKeyDown"
               @keyup.up="onKeyUp" 
               @keyup.esc="onEsc"
               @keydown.left="onLeft"
               @keydown.right="onRight"
               @keydown.delete="onDelete"
               @mousedown="onMousedownInput"
        >

        <div v-if="isFocused && isKeyListShown && keyList.length > 0" 
             ref="listContainer" 
             class="list-container key"
             :style="{
               left: `${keyListPosX}px`, 
               top: `${listPosY}px`,
               height: `${listHeight}px`
             }"
        >
          <b-list-group>
            <b-list-group-item v-for="(key, idx) in keyList" 
                               :key="`key:${idx}`"
                               ref="list" 
                               :class="{'hovered': idx === hoveredItemIdx}"
                               @mousedown.prevent="onSelectKey(key, idx)"
                               @mouseover="onMouseover(idx)" 
                               @mouseout="onMouseout"
            >
              <b-row class="no-gutters justify-content-between">
                <b-col class="col-8 key-label">{{ key.label }}</b-col>
                <b-col v-if="key.values || key.ajax" class="col-4 caret">
                  <i class="fal fa-caret-right" />
                </b-col>
                <b-col v-else-if="key.type" class="col-4 type-caption">{{ key.type }}</b-col>
              </b-row>
            </b-list-group-item>
          </b-list-group>
        </div>

        <div v-if="isFocused && isValueListShown && valueList.length > 0" 
             ref="listContainer" 
             class="list-container"
             :style="{
               left: `${valueListPosX}px`, 
               top: `${listPosY}px`,
               height: `${listHeight}px`
             }"
        >
          <b-list-group>
            <b-list-group-item v-for="(val, idx) in valueList"  
                               ref="list" 
                               :key="`val:${idx}`"
                               :class="{'hovered': idx === hoveredItemIdx}"
                               @mousedown.prevent="onSelectValue(val, idx)"
                               @mouseover="onMouseover(idx)" 
                               @mouseout="onMouseout"
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
import { mapGetters } from 'vuex';

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
    event: ['add', 'update', 'delete', 'deleteLeft'],
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
        addOnly: {
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
            inputText: '',
            isFocused: false,
            isKeyListShown: true,
            isValueListShown: false,
            selected: {},
            selectedList: [],
            selectedKeyObj: null,
            keyList: this.listData,
            staticValueList: [],
            valueList: [],
            hoveredItemIdx: null,
            commitEventName: 'add',
            isEnterEmittedBlur: false,
            keyListPosX: 0,
            valueListPosX: 0,
            listPosY: 0,
            listHeight: 0,
            selectionStart: 0,
            selectionEnd: 0,
            isBlurWithoutCommit: false
        };
    },
    computed: {
        ...mapGetters('layout', [
            'headerHeight'
        ])
    },
    created () {
        this.commitEventName = this.$listeners.update !== undefined ? 'update' : 'add';

        this.initSelectedData();

        this.inputText += this.selected.value;

        this.isFocused = this.autofocus;
    },
    mounted () {
        this.setListPosition();
    },
    methods: {
        setListPosition () {
            let inputRect = this.$refs.input.getBoundingClientRect();
            let paddingBottom = 60;
            this.listHeight = self.innerHeight - inputRect.bottom - paddingBottom;
            this.listPosY = inputRect.height;
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
                if (this.selected.subKey) {
                    this.inputText = `${this.selected.label}.${this.selected.subKey} ${this.selected.operator} `;
                } else {
                    this.inputText = `${this.selected.label} ${this.selected.operator} `;
                }
            }
        },
        onInput (e) {
            this.selectionStart = e.target.selectionStart;
            this.selectionEnd = e.target.selectionEnd;

            if (this.selected.key) { // to detect the case of editting key section
                let operatorIdx = this.getOperatorIdx();

                if (operatorIdx < 0 && 
                (!this.selected.type === 'SubKey' ||
                !this.inputText.trim().startsWith(this.selected.label))) {
                    this.resetKey();
                    return;
                }

                if (e.target.selectionStart <= operatorIdx) { // editting key section
                    let keyStr = this.inputText.substring(0, operatorIdx).trim();
                    if (this.selected.type === 'SubKey') {
                    /**
                     * TODO: detect editting key or subkey
                     */
                    } else {
                        this.resetKey(keyStr);
                    }
                } else { // editting value section
                    let valStr = this.inputText.substring(operatorIdx);
                    this.setOperator(valStr);
                    this.refreshValueList(valStr.substring(this.selected.operator.length));
                    this.showValueList();
                }
            } else {
                this.resetKey(this.inputText.trim());
            }
        },
        getOperatorIdx () {
            return this.inputText.indexOf(':');
        },
        refreshKeyList (val) {
            val = val.trim().toLowerCase();
            let temp = [];
            this.listData.map((item) => {
                if (item.label.toLowerCase().indexOf(val) !== -1) {
                    temp.push(item);
                }
            });
            this.keyList = temp;
        },
        refreshValueList (val) {
            val = val.trim().toLowerCase();
            let temp = [];
            this.staticValueList.map((value) => {
                if (value.toLowerCase().indexOf(val) !== -1) {
                    temp.push(value);
                }
            });
            this.valueList = temp;
        },
        async onSelectKey (item) {
            this.setKey(item);
            if (this.selected.type === 'SubKey') {
                this.inputText = `${this.selected.label}.`;
            } else {
                this.inputText = `${this.selected.label} ${this.selected.operator}`;
            }
            this.hideKeyList();
            await this.setValueListByKeyObj();
            this.showValueList();
        },
        async setValueListByKeyObj () {
            if (!this.selectedKeyObj) {
                return;
            }

            if (this.selectedKeyObj.values) {
                this.staticValueList = this.selectedKeyObj.values;
            } else if (this.selectedKeyObj.ajax) {
                let res = null;
                try {
                    res = await this.$axios[this.selectedKeyObj.ajax.method](this.selectedKeyObj.ajax.url,
                        this.selectedKeyObj.ajax.params || {});

                    this.staticValueList = this.selectedKeyObj.ajax.getList(res);
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
            this.valueListPosX = this.keyListPosX + this.$refs.fakeInput.clientWidth;
        },
        hideValueList () {
            this.isValueListShown = false;
            this.hoveredItemIdx = null;
        },
        showKeyList () {
            this.isKeyListShown = true; 
        },
        hideKeyList () {
            this.isKeyListShown = false;
            this.hoveredItemIdx = null;
        },
        onSelectValue (val) {
            this.setOperator(this.inputText.substring(this.inputText.indexOf(':')));
            this.setValue(val);
            this.hideValueList();
            this.inputText = `${this.selected.label} ${this.selected.operator} ${this.selected.value}`;
            this.commit();
            this.isEnterEmittedBlur = true;
        },
        resetKey (val) {
            this.hideValueList();
            this.refreshKeyList(val || this.inputText);
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
            this.inputText = '';
            this.hideValueList();
            this.keyList = this.listData;
            this.showKeyList();
            this.selectedKeyObj = null;
            this.selectedList = [];
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
            let val = this.inputText.trim();
            if (this.commitEventName === 'update' && val === '') {
                this.$emit('delete');
            }
            if (val === '') {
                return;
            }
            this.setSelectedData(val);
            if (this.selectedList.length === 0) {
                this.selectedList.push(this.selected);
            }
            this.$emit(this.commitEventName, this.selectedList);

            this.resetAll();
            this.setListPosition();
        },
        setSelectedData (val) {
            if (this.selected.key) {
                let operatorIdx = val.indexOf(':');
                let keyStr = val.substring(0, operatorIdx).trim();
                let valStr = val.substring(operatorIdx);

                this.setOperator(valStr);
                if (this.selected.type === 'SubKey') {
                    this.setSubKey(keyStr);
                }
                this.setValue(valStr.substring(this.selected.operator.length));
            } else {
                if (val.includes(' ') || val.includes('\n') || val.includes('\t')) {
                    this.setContinuousValue(val);
                } else {
                    this.setValue(val);
                }
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
            this.selected.value = this.filterValueWithType(val.trim());
        },
        setOperator (val) {
            if (appendableOperators.includes(val[1])) {
                this.selected.operator = ':' + val[1];
            } else {
                this.selected.operator = ':';
            }
        },
        findKeyObjFromKeyList (val) {
            for (var i = 0; i < this.keyList.length; i++) {
                if (val === this.keyList[i].label) {
                    return this.keyList[i];
                }
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
                        this.selectedList.push(Object.assign({}, contentsModel, this.selected));
                    }
                    start = i + 1;
                }
            }
        },
        filterValueWithType (val) {
            if (this.selectedKeyObj) {
                switch (this.selectedKeyObj.type) {
                case 'Boolean':
                    if (val === '0' || val === 'false') {
                        val = false;
                    } else if (val === '1' || val === 'true') {
                        val = true;
                    } else {
                        val = '';
                    }
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

            if (this.autoselect) {
                this.captureText();
            }
        },
        onBlur () {
            this.isFocused = false;
            this.hoveredItemIdx = null;

            if (this.isBlurWithoutCommit) {
                this.isBlurWithoutCommit = false;
                return;
            }

            if (this.$listeners.update !== undefined) {
                if (this.isEnterEmittedBlur) {
                    this.isEnterEmittedBlur = false;
                } else {
                    this.commit();
                }
            }
        },
        onKeyDown () {
            let arr = this.isKeyListShown ? this.keyList : this.valueList;
            if (this.hoveredItemIdx === null || this.hoveredItemIdx >= arr.length - 1) {
                this.hoveredItemIdx = 0;
                if (this.$refs.listContainer) {
                    this.$refs.listContainer.scrollTop = 0;
                }
                return;
            } else {
                this.hoveredItemIdx++;
            }

            if (this.isEmpty(this.$refs.listContainer) ||
                this.isEmpty(this.$refs.list[this.hoveredItemIdx])) {
                return;
            }

            let listContainerRect = this.$refs.listContainer.getBoundingClientRect();
            let listItemRect = this.$refs.list[this.hoveredItemIdx].getBoundingClientRect();
            let diff = listItemRect.bottom - listContainerRect.bottom;
            let pad = 10;
            if (diff > 0) {
                this.$refs.listContainer.scrollTop += diff + pad;
            }
        },
        onKeyUp () {
            if (this.hoveredItemIdx === null || this.hoveredItemIdx <= 0) {
                let arr = this.isKeyListShown ? this.keyList : this.valueList;
                this.hoveredItemIdx = arr.length - 1;
                if (this.$refs.listContainer) {
                    this.$refs.listContainer.scrollTop = this.$refs.listContainer.scrollHeight;
                }
                return;
            } else {
                this.hoveredItemIdx--;
            }

            if (this.isEmpty(this.$refs.listContainer) ||
                this.isEmpty(this.$refs.list[this.hoveredItemIdx])) {
                return;
            }

            let listContainerRect = this.$refs.listContainer.getBoundingClientRect();
            let listItemRect = this.$refs.list[this.hoveredItemIdx].getBoundingClientRect();
            let diff = listItemRect.top - listContainerRect.top;
            let pad = 10;
            if (diff < 0) {
                this.$refs.listContainer.scrollTop += diff - pad;
            }
        },
        onMouseover (idx) {
            this.hoveredItemIdx = idx; 
        },
        onMouseout () {
            this.hoveredItemIdx = null; 
        },
        captureText () {
            if (!this.inputText) {
                return;
            }

      // set text selection
            if (this.selected.key !== null && this.selected.value !== null) {
                let start = this.inputText.indexOf(':') + this.selected.operator.length;
                this.$refs.input.setSelectionRange(start, this.inputText.length);
                this.hideKeyList();
                this.setValueListByKeyObj();
                this.refreshValueList(this.inputText.substring(start));
                this.showValueList();
            } else {
                this.$refs.input.setSelectionRange(0, this.inputText.length);
                this.hideValueList();
                this.showKeyList();
            }
        },
        onMousedownInput (e) {
            this.selectionStart = e.target.selectionStart;
            this.selectionEnd = e.target.selectionEnd;

            if (this.selected.key && this.getOperatorIdx() < e.target.selectionStart) {
                this.showValueList();
            }
        },
        onLeft () {
            if (this.selectionStart > 0) {
                console.log('ignore left');
                return;
            }
            this.isBlurWithoutCommit = true;
            this.isFocused = false;
            this.$emit('moveLeft');
        },
        onRight () {
            if (this.addOnly || this.selectionStart < this.inputText.length) {
                return;
            }
            this.isBlurWithoutCommit = true;
            this.isFocused = false;
            this.$emit('moveRight');
        },
        onEsc () {
            this.hideKeyList();
            this.hideValueList();
        },
        onDelete (e) {
            if (e.target.value === '') {
                this.$emit('deleteLeft');
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
      background-color: transparent;
      word-break: break-all;
    }
    .list-container {
      position: absolute;
      display: inline-block;
      min-height: 100px;
      overflow-y: scroll;
      z-index: 3;
      left: 0;
      width: auto;
      min-width: 250px;
      border-radius: 5px;
      .list-group {
        box-shadow: 0 0 4px 0 rgba($black, 0.4);
        border-radius: 5px;
        padding: 10px;
        background-color: darken($navy, 2%);
        width: auto;
      }
      .list-group-item {
        cursor: pointer;
        padding: 5px 8px;
        color: $lightgray;
        font-size: .9rem;
        background-color: transparent;
        border-radius: 5px;
        width: auto;
        white-space: nowrap;
        &.hovered {
          background-color: lighten($navy, 9%);
        }
        .key-label {
        //   text-overflow: ellipsis;
        //   overflow:hidden;
          white-space:nowrap;
          padding-right: 20px;
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
