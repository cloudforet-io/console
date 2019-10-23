<template>
  <div class="example-box">
    <vue-json-pretty
      v-if="renderOK"
      :data="json"
      :path="path"
      :deep="deep"
      :show-double-quotes="showDoubleQuotes"
      :highlight-mouseover-node="highlightMouseoverNode"
      :highlight-selected-node="highlightSelectedNode"
      :show-length="showLength"
      :show-line="showLine"
      v-model="value"
            :select-on-click-node="selectOnClickNode"
      :path-selectable="((path, data) => typeof data !== 'number')"
      :selectable-type="selectableType"
      :show-select-controller="showSelectController"
      @click="handleClick(...arguments, 'complexTree')"
      @change="handleChange"
    />
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';

export default {
    name: 'BasePanelJson',
    components: {
        VueJsonPretty
    },
    props: {
        highlightSelectedNode:{
            type: Boolean,
            default: true
        },
        selectOnClickNode:{
            type: Boolean,
            default: true
        },
        showDoubleQuotes:{
            type: Boolean,
            default: true
        },
        showLength: {
            type: Boolean,
            default: true
        },
        showLine: {
            type: Boolean,
            default: false
        },
        highlightMouseoverNode:{
            type: Boolean,
            default: false
        },
        showSelectController:{
            type: Boolean,
            default: false
        },
        deep: {
            type: Number,
            default: 3
        },
        jsonData: {
            type: Object,
            default: () => {}
        },
        noticePanelData: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            renderOK: true,
            value: 'res.error',
            selectableType: 'single',
            path: 'res',
            itemData: {},
            itemPath: ''
        };
    },
    computed: {
        json () {
            return this.jsonData;
            // try {
            //     this.cache = JSON.parse(this.jsonData);
            //     return this.cache;
            // } catch (err) {
            //     return this.cache || this.jsonData;
            // }
        }
    },
    watch: {
        selectableType(newVal) {
            this.renderOK = false;
            if (newVal === 'single') {
                this.value = 'res.error';
            } else if (newVal === 'multiple') {
                this.value = ['res.error', 'res.data[0].title'];
            }
            this.$nextTick(() => {
                this.renderOK = true;
            });
        }
    },
    methods: {
        handleClick(path, data, treeName = '') {
            console.log('click: ', path, data, treeName);
            this.itemPath = path;
            this.itemData = !data ? data + '' : data;
        },
        handleChange(newVal, oldVal) {
            console.log('newVal: ', newVal, ' oldVal: ', oldVal);
        }
    }
};
</script>

<style lang="scss">

</style>