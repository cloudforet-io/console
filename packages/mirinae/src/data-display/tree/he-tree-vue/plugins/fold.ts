import { defineComponent } from 'vue';
import Vue from 'vue';

import {
    Node, Path, UnfoldOptions,
} from '@/data-display/tree/he-tree-vue/types';

import { walkTreeData } from '../utils';

export function foldAll(treeData) {
    walkTreeData(treeData, (childNode) => {
        Vue.set(childNode, '$folded', true);
    });
}
export function unfoldAll(treeData) {
    walkTreeData(treeData, (childNode) => {
        Vue.set(childNode, '$folded', false);
    });
}

export default defineComponent({
    props: {
        foldingTransitionName: { type: String },
        foldingTransition: {},
        foldAllAfterMounted: { type: Boolean },
    },
    mounted() {
        if (this.foldAllAfterMounted) {
            // @ts-ignore
            this.foldAll();
        }
    },
    methods: {
        fold(node) {
            if (!node.$folded) {
                this.$set(node, '$folded', true);
                this.$emit('nodeFoldedChanged', node);
            }
        },
        unfold(node, path, opt: UnfoldOptions = {}) {
            // eslint-disable-next-line no-param-reassign
            opt = {
                foldOthers: false,
                ...opt,
            };
            if (opt.foldOthers) {
                this.foldAll();
            }
            if (node.$folded) {
                this.$set(node, '$folded', false);
                this.$emit('nodeFoldedChanged', node);
                this.$emit('node-folded-changed', node);
            }
        },
        toggleFold(node: Node, path: Path, opt: UnfoldOptions) {
            if (node.$folded) {
                this.unfold(node, path, opt);
            } else {
                // @ts-ignore
                this.fold(node, path, opt);
            }
        },
        foldAll() {
            // @ts-ignore
            this.walkTreeData((childNode) => {
                this.fold(childNode);
            });
        },
        unfoldAll() {
            // @ts-ignore
            this.walkTreeData((childNode) => {
                this.unfold(childNode, { unfoldParent: false });
            });
        },
    },
});
