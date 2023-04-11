<template>
    <div class="he-tree" :class="{'he-tree--rtl': rtl}" :data-tree-id="treeId">
        <children-list :nodes="rootNode.children"
                       :indent="indent"
                       :parent="rootNode"
                       :parent-path="[]"
                       :root-node="rootNode"
                       :rtl="rtl"
                       :selected-paths="selectedPaths"
        >
            <template #default="scope">
              <slot v-bind="scope" />
            </template>
        </children-list>
    </div>
</template>

<script lang="ts">
// @ts-nocheck
import * as ut from '../utils';
import { defineComponent } from 'vue';
import {
  arrayRemove,
  joinFunctionsByNext,
  randString,
  TreeData, updatablePropsEvenUnbound
} from "../helpers";

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
        selectedPaths: {
            type: Array,
            default: () => []
        }
    },
    mixins: [
      updatablePropsEvenUnbound({
        value: { $localName: 'treeData', required: true },
      }),
    ],
    data() {
        return {
            trees,
            treeClass: '',
            treeId: randString(),
            _hooks: {} as Record<string, {(...args: any[]): any}[]>
        };
    },
    watch: {
        treeData: {
            immediate: true,
            handler(treeData) {
                this._TreeDataHelper = new TreeData(this.treeData);
            },
        },
    },
    methods: {
      //
      // get hooks in this._hooks, without which in props
      _getNonPropHooksByName(name) {
        if (this._hooks) {
          return this._hooks[name]
        }
      },
      addHook(name, func) {
        if (!this._getNonPropHooksByName(name)) {
          if (!this._hooks) {
            this._hooks = {}
          }
          if (!this._hooks[name]) {
            this._hooks[name] = []
          }
        }
        this._hooks[name].push(func)
      },
      removeHook(name, func) {
        const hooks = this._getNonPropHooksByName(name)
        if (hooks) {
          arrayRemove(hooks, func)
        }
      },
      hasHook(name) {
        return this._getNonPropHooksByName(name) || this[name]
      },
      executeHook(name, hookArgs: any[]) {
        let hooks = this._getNonPropHooksByName(name)
        hooks = hooks ? hooks.slice() : []
        const func = this[name]
        if (func && typeof func === 'function') {
          hooks.push((next, ...args) => {
            return func(...args)
          })
        }
        return joinFunctionsByNext(hooks)(...hookArgs)
      },

      //
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
        this.treeId = randString();
        this.$set(this.trees, this.treeId, this);
        this.$once('hook:beforeDestroy', () => {
            this.$delete(this.trees, this.treeId);
        });
    },
});

</script>
