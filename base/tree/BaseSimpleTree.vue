<template>
  <div class="row no-gutters">
    <sl-vue-tree ref="slVueTree"
                 v-model="treeData"
                 class="main-tree-col"
                 :allow-multiselect="false"
                 @nodeclick="nodeClicked"
                 @toggle="nodeToggled"
    >
      <template #title="{ node }">
        <span v-if="node.data.init" class="fas fa-exclamation-triangle" />
        <span v-else class="item-icon">
          <i v-if="node.isLeaf" class="fas fa-cube" />
          <i v-else-if="node.isExpanded" class="fal fa-folder-open" />
          <i v-else class="fal fa-folder-minus" />
        </span>
        <span class="item-title">
          {{ node.title }}
        </span>
      </template>
      <template #toggle="{ node }">
        <i v-if="node.isExpanded" class="fal fa-angle-down" />
        <i v-else class="fal fa-angle-right" />
      </template>
    </sl-vue-tree>
  </div>
</template>
<script>
import SlVueTree from 'sl-vue-tree';
export default {
    name: 'BaseSimpleTree',
    events: ['selected'],
    components: {
        SlVueTree
    },
    props: {
        listUrl: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            nodeKey: 0,
            treeData: [],
            hasSelected: false,
            clickedNode: null
        };
    },
    created() {
        this.listRootItems();
    },
    methods: {
        nodeClicked (node) {
            if (!node.isLeaf) {
                return;
            }

            if (this.clickedNode) {
                this.removeClickedClass(this.clickedNode);
            }
            this.clickedNode = node;
            this.addClickedClass(node);
            
            if (!node.data.hasOwnProperty('init')) {
                this.nodeKey = (this.nodeKey !== node.data.id) ? node.data.id : this.nodeKey;
                this.hasSelected = true;
                this.$emit('selected', { node: node, treeV: this.$refs.slVueTree });
            } else {
                this.hasSelected = false;
            }
        },
        nodeToggled (node) {
            if (!node.isExpanded ) {
                this.setClickedNodeItem(node);
                if (!node.data.is_cached) {
                    this.listNextLayerItems(node);
                }
            }
        },
        async listRootItems () {
            try {
                let res = await this.$axios.post(this.listUrl, {
                    item_type: 'ROOT',
                    sort: { key: 'name' }
                });
                this.treeData = this.treeDataHandler(res.data, { is_root: true });
            } catch (e) {
                console.error(e);
            }
        },
        async listNextLayerItems (node) {
            try {
                let res = await this.$axios.post(this.listUrl, {
                    item_type: node.data.item_type,
                    item_id: node.data.id,
                    domain_id: sessionStorage.domainId
                });
                node.data.is_cached = true;
                let childrenNode = this.getSelectedNodeArr(res.data.items);
                this.$refs.slVueTree.updateNode(node.path, { data: node.data });
                if (childrenNode) {
                    childrenNode.map((curItem) => {
                        this.$refs.slVueTree.insert({ node: node, placement: 'inside' }, curItem);
                    });
                }
            } catch (error) {
                console.error(error);
            }
        },
        setClickedNodeItem (node) {
            let hasNoClickedItem = false;
            if (this.clickedNode) {
                hasNoClickedItem = node.path.some((path, i) => {
                    return path !== this.clickedNode.path[i];
                });
            } else {
                hasNoClickedItem = true;
            }

            if (!hasNoClickedItem) {
                let addClassInterval = setInterval(() => {
                    if (this.addClickedClass(this.clickedNode)) {
                        clearInterval(addClassInterval);
                    }
                }, 10);
            }
        },
        getNodeEl (node) {
            return this.$refs.slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
        },
        addClickedClass (node) {
            let elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        },
        removeClickedClass (node) {
            let elem = this.getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.main-tree-col {
    background-color: $lightgray;
    padding: 15px 8px;
    height: 400px;
    width: 100%;
    overflow: scroll;
    .leaf-space {
        display: inline-block;
        width: 20px;
    }
    .item-icon {
        display: inline-block;
        text-align: center;
        width: 20px;
    }
    .ellipsis {
        padding: 0px 3px 0px 10px;
        cursor: pointer;
    }
}

.empty {
    text-align: left;
    margin-top: 20px;
    .msg {
        color: $darkgray;
        font-size: 1.3rem;
        font-weight: 600;
    }
}
</style>
