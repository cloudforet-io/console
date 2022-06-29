<template>
    <div class="he-tree" :class="{'he-tree--rtl': rtl}" :data-tree-id="treeId">
        <children-list :nodes="rootNode.children"
                       :indent="indent"
                       :parent="rootNode"
                       :parent-path="[]"
                       :root-node="rootNode"
                       :rtl="rtl"
        >
            <template #default="scope">
              <slot v-bind="scope" />
            </template>
        </children-list>
    </div>
</template>

<script lang="ts">
import * as hp from 'helper-js';
import * as vf from 'vue-functions';

import * as ut from '../utils';
import { defineComponent } from '@vue/composition-api';

const trees = {};
const ChildrenList = () => ({
  component: import('./ChildrenList.vue') as any,
})

export default defineComponent({
    name: 'Tree',
    components: {
        ChildrenList
    },
    props: {
        value: {
          type: Array,
          default: () => []
        },
        indent: {
          type: Number,
          default: 20
        },
        rtl: {
          type: Boolean,
          default: false
        },
        rootNode: {
          type: Object,
          default: () => ({})
        },
    },
    mixins: [
      vf.updatablePropsEvenUnbound({
        value: { $localName: 'treeData', required: true },
      }),
      vf.hookHelper,
    ],
    data() {
        return {
            trees,
            treeClass: '',
            treeId: hp.randString(),
        };
    },
    // computed: {},
    watch: {
        treeData: {
            immediate: true,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            handler(treeData) {
                this._TreeDataHelper = new hp.TreeData(this.treeData);
            },
        },
    },
    methods: {
        iteratePath(path, opt) {
            // @ts-ignore
            return this._TreeDataHelper.iteratePath(path, opt);
        },
        getTreeVmByTreeEl(treeEl) {
            return this.trees[treeEl.getAttribute('data-tree-id')];
        },
        getAllNodesByPath(path) {
            // @ts-ignore
            return this._TreeDataHelper.getAllNodes(path);
        },
        getNodeByPath(path) {
            // @ts-ignore
            return this._TreeDataHelper.getNode(path);
        },
        getPathByBranchEl(branchEl) {
            return branchEl.getAttribute('data-tree-node-path').split(',').map(v => parseInt(v));
        },
        getBranchElByPath(path) {
            return this.$el.querySelector(`[data-tree-node-path='${path.join(',')}']`);
        },
        getNodeByBranchEl(branchEl) {
            return this.getNodeByPath(this.getPathByBranchEl(branchEl));
        },
        getNodeParentByPath(path) {
            // @ts-ignore
            return this._TreeDataHelper.getNodeParent(path);
        },
        removeNodeByPath(path) {
            // @ts-ignore
            return this._TreeDataHelper.removeNode(path);
        },
        walkTreeData(handler, opt) {
            return ut.walkTreeData(this.treeData, handler, opt);
        },
        cloneTreeData(opt) {
            return ut.cloneTreeData(this.treeData, opt);
        },
        // return cloned new tree data without property witch starts with `$`
        getPureTreeData() {
            return ut.getPureTreeData(this.treeData);
        },
    },
    created() {
        //
        const updateRootNode = () => { this.$set(this.rootNode, 'children', this.treeData); };
        this.$watch('rootNode', updateRootNode, { immediate: true });
        this.$watch('treeData', updateRootNode, { immediate: true });
    },
    mounted() {
        //
        this.treeId = hp.randString();
        this.$set(this.trees, this.treeId, this);
        this.$once('hook:beforeDestroy', () => {
            this.$delete(this.trees, this.treeId);
        });
    },
});

</script>
