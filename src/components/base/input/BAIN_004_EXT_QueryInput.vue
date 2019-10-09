<template>
  <span>
    <span class="input-container">

      <span ref="fakeInput" class="fake" />

      <span class="relative-container">
        <BaseInput ref="input" 
                   v-model="inputText"
                   :autowidth="{maxWidth: maxWidth, minWidth: minWidth, comfortZone: 1}"
                   autocomplete="off" 
                   type="text"
                   :placeholder="tr('SEARCH')"
                   v-bind="$props"
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
        />

        <BaseQueryList ref="listContainer"
                       class="list-container"
                       :show="isFocused && isKeyListShown && keyList.length > 0"
                       :queries="keyList" 
                       :style="{
                         left: `${keyListPosX}px`, 
                         top: `${listPosY}px`,
                         height: `${listHeight}px`
                       }"
                       @select="onSelectKey"
        />

        <BaseQueryList ref="listContainer" 
                       class="list-container"
                       :show="isFocused && isValueListShown && valueList.length > 0"
                       :queries="valueList" 
                       :style="{
                         left: `${valueListPosX}px`, 
                         top: `${listPosY}px`,
                         height: `${listHeight}px`
                       }"
                       text-only 
                       @select="onSelectValue"
        />
      </span>

    </span>
  </span>
</template>

<script>
import BaseQueryList from '@/components/base/list/BALT_001_BaseQueryList';
import BaseInput from '@/components/base/input/BAIN_001_BaseInput';

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
    name: 'QueryInput',
    components: {
        BaseInput,
        BaseQueryList
    },
    events: ['add', 'update', 'delete', 'deleteLeft'],
    props: {
        contextData: {
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
        noReset: {
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
            isKeyListShown: true,
            isValueListShown: false,
            selected: {},
            selectedList: [],
            selectedKeyObj: null,
            keyList: this.contextData,
            staticValueList: [],
            valueList: [],
            commitEventName: 'add',
            isEnterEmittedBlur: false,
            keyListPosX: 0,
            valueListPosX: 0,
            listPosY: 0,
            listHeight: 0,
            selectionStart: 0,
            selectionEnd: 0,
            isBlurWithoutCommit: false,
            isFocused: false
        };
    },
    created () {
        this.commitEventName = this.$listeners.update !== undefined ? 'update' : 'add';

        this.initSelectedData();

        this.inputText += this.selected.value;
    },
    mounted () {
        this.setListPosition();
    },
    methods: {
        setListPosition () {
            let inputRect = this.$refs.input.$el.getBoundingClientRect();
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
            // this.selectionStart = e.target.selectionStart;
            // this.selectionEnd = e.target.selectionEnd;

            // if (this.selected.key) { // to detect the case of editting key section
            //     let operatorIdx = this.getOperatorIdx();

            //     if (operatorIdx < 0 && 
            //     (!this.selected.type === 'SubKey' ||
            //     !this.inputText.trim().startsWith(this.selected.label))) {
            //         this.resetKey();
            //         return;
            //     }

            //     if (e.target.selectionStart <= operatorIdx) { // editting key section
            //         let keyStr = this.inputText.substring(0, operatorIdx).trim();
            //         if (this.selected.type === 'SubKey') {
            //         /**
            //          * TODO: detect editting key or subkey
            //          */
            //         } else {
            //             this.resetKey(keyStr);
            //         }
            //     } else { // editting value section
            //         let valStr = this.inputText.substring(operatorIdx);
            //         this.setOperator(valStr);
            //         this.refreshValueList(valStr.substring(this.selected.operator.length));
            //         this.showValueList();
            //     }
            // } else {
            //     this.resetKey(this.inputText.trim());
            // }
        },
        getOperatorIdx () {
            return this.inputText.indexOf(':');
        },
        refreshKeyList (val) {
            val = val.trim().toLowerCase();
            let temp = [];
            this.contextData.map((item) => {
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

                    this.staticValueList = this.selectedKeyObj.ajax.filter(res);
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
        },
        showKeyList () {
            this.isKeyListShown = true; 
        },
        hideKeyList () {
            this.isKeyListShown = false;
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
            if (!this.noReset) {
                this.inputText = '';
            }
            this.hideValueList();
            this.keyList = this.contextData;
            this.showKeyList();
            this.selectedKeyObj = null;
            this.selectedList = [];
            this.selected = Object.assign({}, contentsModel);
        },
        onEnter () {
            if (this.$refs.listContainer && 
                typeof this.$refs.listContainer.hoveredItemIdx === 'number') {
                this.$refs.listContainer.emitSelectEvent();
            } else {
                this.commit();
                this.isEnterEmittedBlur = true;
            }

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
            this.$refs.listContainer.goDown();
        },
        onKeyUp () {
            this.$refs.listContainer.goUp();
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
        forceBlur () {
            this.$refs.input.forceBlur();
        },
        forceFocus () {
            this.$refs.input.forceFocus();
        },
        onLeft () {
            if (this.selectionStart > 0) {
                return;
            }
            this.isBlurWithoutCommit = true;
            this.forceBlur();
            this.$emit('moveLeft');
        },
        onRight () {
            if (this.addOnly || this.selectionStart < this.inputText.length) {
                return;
            }
            this.isBlurWithoutCommit = true;
            this.forceBlur();
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
      z-index: 3;
    }
  }
}
</style>
