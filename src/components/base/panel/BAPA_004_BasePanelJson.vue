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
            :select-on-click-node="selectOnClickNode"
            v-model="value"
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
            default: true,
        },
        selectOnClickNode:{
            type: Boolean,
            default: true,
        },
        showDoubleQuotes:{
            type: Boolean,
            default: true,
        },
        showLength: {
            type: Boolean,
            default: true,
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
        noticePanelData: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            renderOK: true,
            val: '',
            data: {
                status: 200,
                error: '',
                data: [{
                    news_id: 51184,
                    title: 'iPhone X Review: Innovative future with real black technology',
                    source: 'Netease phone'
                }, {
                    news_id: 51183,
                    title: 'Traffic paradise: How to design streets for people and unmanned vehicles in the future?',
                    source: 'Netease smart'
                }, {
                    news_id: 51182,
                    title: 'Teslamask\'s American Business Relations: The government does not pay billions to build factories',
                    source: 'AI Finance',
                    members: ['Daniel', 'Mike', 'John']
                }]
            },
            value: 'res.error',
            selectableType: 'single',
            path: 'res',
            itemData: {},
            itemPath: ''
        };
    },
    computed: {
        json() {
            try {
                this.cache = JSON.parse(this.val);
                return this.cache;
            } catch (err) {
                return this.cache || this.data;
            }
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
    created() {
        this.val = JSON.stringify(this.data);
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