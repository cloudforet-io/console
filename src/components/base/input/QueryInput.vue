<template>
    <span>
        <span class="input-container">

            <span ref="fakeInput" class="fake" />

            <span class="relative-container">
                <BaseInput ref="input"
                           v-model="inputText"
                           :autowidth="{maxWidth: maxWidth, minWidth: minWidth, comfortZone: 1}"
                           autocomplete="off"
                           :autoselect="autoselectOption"
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
                           @keydown.delete="onDelete"
                           @mousedown="onMousedownInput"
                />

                <BaseQueryList ref="listContainer"
                               class="list-container"
                               :show="isListShown && isKeyListShown && keyList.length > 0"
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
                               :show="isListShown && isValueListShown && valueList.length > 0"
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
import BaseQueryList from '@/components/base/list/BaseQueryList';
import BaseInput from '@/components/base/input/BaseInput';

const contentsModel = {
    label: '',
    key: '',
    value: '',
    operator: ':',
    type: 'String',
    subKey: '',
};

const appendableOperators = ['=', '>', '<', '!', '$'];

const LIST_PAD = 60;

export default {
    name: 'QueryInput',
    components: {
        BaseInput,
        BaseQueryList,
    },
    events: ['commit', 'empty', 'deleteLeft'],
    props: {
        contextData: {
            type: Array,
            default: () => [],
        },
        contents: {
            type: Object,
            default: () => (Object.assign({}, contentsModel)),
        },
        autoselect: {
            type: Boolean,
            default: false,
        },
        noReset: {
            type: Boolean,
            default: false,
        },
        maxWidth: {
            type: String,
            default: '100%',
        },
        minWidth: {
            type: String,
            default: '100px',
        },
    },
    data() {
        return {
            inputText: '',
            operatorIdx: -1,
            isListShown: false,
            isKeyListShown: true,
            isValueListShown: false,
            selected: {},
            selectedList: [],
            selectedKeyObj: null,
            keyList: this.contextData,
            staticValueList: [],
            valueList: [],
            isEnterEmittedBlur: false,
            keyListPosX: 0,
            valueListPosX: 0,
            listPosY: 0,
            listHeight: 0,
            isBlurWithoutCommit: false,
            autoselectOption: { start: 0, end: 0 },
        };
    },
    created() {
        this.initSelectedData();
        this.inputText += this.selected.value;
    },
    mounted() {
        this.setListPosition();
        if (this.$attrs.autofocus) {
            this.forceFocus();
        }
    },
    methods: {
        setListPosition() {
            const inputRect = this.$refs.input.$el.getBoundingClientRect();
            const paddingBottom = LIST_PAD;
            this.listHeight = self.innerHeight - inputRect.bottom - paddingBottom;
            this.listPosY = inputRect.height;
        },
        initSelectedData() {
            this.setSelectedDataWithContents();
            this.setInputTextWithSelectedKey();
        },
        setSelectedDataWithContents() {
            this.selected.label = this.contents.label || '';
            this.selected.key = this.contents.key || '';
            this.selected.value = this.contents.value || '';
            this.selected.operator = this.contents.operator || ':';
            this.selected.type = this.contents.type || 'String';
            this.selected.subKey = this.contents.subKey || '';
        },
        setInputTextWithSelectedKey() {
            if (this.selected.key) {
                this.selectedKeyObj = this.findKeyObjFromKeyList(this.selected.label);
                if (this.selected.subKey) {
                    this.inputText = `${this.selected.label}.${this.selected.subKey} ${this.selected.operator} `;
                } else {
                    this.inputText = `${this.selected.label} ${this.selected.operator} `;
                }
            }
        },
        onInput(e) {
            if (this.selected.key) {
                this.operatorIdx = this.getOperatorIdx();
                if (this.isKeyResetCase()) {
                    this.resetKey();
                } else {
                    this.editSelectedData(e);
                }
            } else {
                this.resetKey(this.inputText.trim());
            }
        },
        editSelectedData(event) {
            if (event.target.selectionStart <= this.operatorIdx) {
                this.editKeySection();
            } else {
                this.editValueSection();
            }
        },
        editKeySection() {
            const keyStr = this.inputText.substring(0, this.operatorIdx).trim();
            if (this.selected.type === 'SubKey') {
                this.editSubKey();
            } else {
                this.resetKey(keyStr);
            }
        },
        editValueSection() {
            const valStr = this.inputText.substring(this.operatorIdx);
            this.setOperator(valStr);
            this.refreshValueList(valStr.substring(this.selected.operator.length));
            this.showValueList();
        },
        isKeyResetCase() {
            return this.operatorIdx < 0
                   && (!this.selected.type === 'SubKey'
                    || !this.inputText.trim().startsWith(this.selected.label));
        },
        editSubKey() {
            /**
             * TODO: detect editting key or subkey
             */
        },
        getOperatorIdx() {
            return this.inputText.indexOf(':');
        },
        refreshKeyList(val) {
            val = val.trim().toLowerCase();
            const temp = [];
            this.contextData.map((item) => {
                if (item.label.toLowerCase().indexOf(val) !== -1) {
                    temp.push(item);
                }
            });
            this.keyList = temp;
        },
        refreshValueList(val) {
            val = val.trim().toLowerCase();
            const temp = [];
            this.staticValueList.map((value) => {
                if (value.toLowerCase().indexOf(val) !== -1) {
                    temp.push(value);
                }
            });
            this.valueList = temp;
        },
        async onSelectKey(item) {
            this.setKey(item);
            this.setInputTextKey();
            this.hideKeyList();
            await this.setValueListByKeyObj();
            this.showValueList();
        },
        setInputTextKey() {
            if (this.selected.type === 'SubKey') {
                this.inputText = `${this.selected.label}.`;
            } else {
                this.inputText = `${this.selected.label} ${this.selected.operator}`;
            }
        },
        async setValueListByKeyObj() {
            if (!this.selectedKeyObj) {
                return;
            }
            this.staticValueList = [];
            if (this.selectedKeyObj.values) {
                this.staticValueList = this.selectedKeyObj.values;
            } else if (this.selectedKeyObj.ajax) {
                await this.setStaticValueListByAjax();
            }
            this.valueList = this.staticValueList;
        },
        async setStaticValueListByAjax() {
            try {
                const res = await this.$http[this.selectedKeyObj.ajax.method](
                    this.selectedKeyObj.ajax.url,
                    this.selectedKeyObj.ajax.params || {},
                );
                this.staticValueList = this.selectedKeyObj.ajax.filter(res);
            } catch (e) {
                console.error(e);
            }
        },
        showValueList() {
            this.isValueListShown = true;

            // set list position X
            this.$refs.fakeInput.textContent = `${this.selected.label} ${this.selected.operator} `;
            this.valueListPosX = this.keyListPosX + this.$refs.fakeInput.clientWidth;
        },
        hideValueList() {
            this.isValueListShown = false;
        },
        showKeyList() {
            this.isKeyListShown = true;
        },
        hideKeyList() {
            this.isKeyListShown = false;
        },
        onSelectValue(val) {
            this.setOperator(this.inputText.substring(this.inputText.indexOf(':')));
            this.setValue(val);
            this.hideValueList();
            this.inputText = `${this.selected.label} ${this.selected.operator} ${this.selected.value}`;
            this.commit();
            this.isEnterEmittedBlur = true;
        },
        resetKey(val) {
            this.hideValueList();
            this.refreshKeyList(val || this.inputText);
            this.showKeyList();
            this.selectedKeyObj = null;
            this.selected = Object.assign({}, contentsModel);
        },
        resetValue() {
            this.hideKeyList();
            this.setValueListByKeyObj();
            this.refreshValueList();
            this.showValueList();
            this.selected.value = '';
        },
        resetAll() {
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
        onEnter() {
            if (this.$refs.listContainer
                && typeof this.$refs.listContainer.hoveredItemIdx === 'number') {
                this.$refs.listContainer.emitSelectEvent();
            } else {
                this.commit();
                this.isEnterEmittedBlur = true;
            }
        },
        commit() {
            const val = this.inputText.trim();
            if (val === '') {
                this.$emit('empty');
                return;
            }
            this.setSelectedData(val);
            if (this.selectedList.length === 0) {
                this.selectedList.push(this.selected);
            }
            this.$emit('commit', this.selectedList);

            this.resetAll();
            this.setListPosition();
        },
        setSelectedData(val) {
            if (this.selected.key) {
                const operatorIdx = val.indexOf(':');
                const keyStr = val.substring(0, operatorIdx).trim();
                const valStr = val.substring(operatorIdx);

                this.setOperator(valStr);
                if (this.selected.type === 'SubKey') {
                    this.setSubKey(keyStr);
                }
                this.setValue(valStr.substring(this.selected.operator.length));
            } else if (val.includes(' ') || val.includes('\n') || val.includes('\t')) {
                this.setContinuousValue(val);
            } else {
                this.setValue(val);
            }
        },
        setKey(keyObj) {
            this.selectedKeyObj = keyObj;
            this.selected.key = keyObj.key;
            this.selected.label = keyObj.label;
            this.selected.type = keyObj.type || 'String';
        },
        setSubKey(val) {
            this.selected.subKey = val.substring(this.selected.label.length + 1);
        },
        setValue(val) {
            this.selected.value = this.filterValueWithType(val.trim());
        },
        setOperator(val) {
            if (appendableOperators.includes(val[1])) {
                this.selected.operator = `:${val[1]}`;
            } else {
                this.selected.operator = ':';
            }
        },
        findKeyObjFromKeyList(val) {
            for (let i = 0; i < this.keyList.length; i++) {
                if (val === this.keyList[i].label) {
                    return this.keyList[i];
                }
            }
            return null;
        },
        setContinuousValue(val) {
            val += ' ';
            let start = 0;
            for (let i = 0; i < val.length; i++) {
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
        filterValueWithType(val) {
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
        onFocus() {
            this.isListShown = true;
            if (this.autoselect) {
                this.captureText();
            }
        },
        onBlur() {
            this.isListShown = false;

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
        onKeyDown() {
            this.$refs.listContainer.goDown();
        },
        onKeyUp() {
            this.$refs.listContainer.goUp();
        },
        captureText() {
            if (!this.inputText) {
                return;
            }

            // set text selection
            if (this.selected.key !== null && this.selected.value !== null) {
                const start = this.inputText.indexOf(':') + this.selected.operator.length;
                this.autoselectOption = { start, end: this.inputText.length };
                this.hideKeyList();
                this.setValueListByKeyObj();
                this.refreshValueList(this.inputText.substring(start));
                this.showValueList();
            } else {
                this.autoselectOption = { start: 0, end: this.inputText.length };
                this.hideValueList();
                this.showKeyList();
            }
        },
        onMousedownInput(e) {
            if (this.selected.key && this.getOperatorIdx() < e.target.selectionStart) {
                this.showValueList();
            }
        },
        forceBlur() {
            this.$refs.input.forceBlur();
        },
        forceFocus() {
            this.$refs.input.forceFocus();
        },
        onEsc() {
            this.hideKeyList();
            this.hideValueList();
        },
        onDelete(e) {
            if (e.target.value === '') {
                this.$emit('deleteLeft');
            }
        },
    },
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
