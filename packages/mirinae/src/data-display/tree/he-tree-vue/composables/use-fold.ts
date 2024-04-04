import { onMounted } from 'vue';

import type { Node } from '@/data-display/tree/he-tree-vue/libs/draggable/types';

interface UnfoldOptions {
    foldOthers?: boolean;
}

export const useFold = (props, emit, { walkTreeData }) => {
    onMounted(() => {
        if (props.foldAllAfterMounted) {
            foldAll();
        }
    });

    const fold = (node) => {
        if (!node.$folded) {
            node.$folded = true;
            emit('nodeFoldedChanged', node);
            emit('node-folded-changed', node);
        }
    };
    const unfold = (node, path, opt: UnfoldOptions = {}) => {
        // eslint-disable-next-line no-param-reassign
        opt = {
            foldOthers: false,
            ...opt,
        };
        if (opt.foldOthers) {
            foldAll();
        }
        if (node.$folded) {
            node.$folded = false;
            emit('nodeFoldedChanged', node);
            emit('node-folded-changed', node);
        }
    };
    const toggleFold = (node: Node, path: number[], opt: UnfoldOptions) => {
        if (node.$folded) {
            unfold(node, path, opt);
        } else {
            fold(node);
        }
    };
    const foldAll = () => {
        walkTreeData((childNode) => {
            fold(childNode);
        });
    };
    const unfoldAll = () => {
        walkTreeData((childNode) => {
            unfold(childNode, { unfoldParent: false });
        });
    };

    const methods = {
        fold,
        unfold,
        toggleFold,
        foldAll,
        unfoldAll,
    };

    return {
        methods,
    };
};
