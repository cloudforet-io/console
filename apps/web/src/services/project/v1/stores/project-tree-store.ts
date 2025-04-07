import { nextTick, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import type { TreeDisplayMap } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';


export const useProjectTreeStore = defineStore('project-tree', () => {
    const state = reactive({
        treeDisplayMap: {} as TreeDisplayMap,
    });

    const mutations = {
        setTreeDisplayMap(treeDisplayMap: TreeDisplayMap) {
            state.treeDisplayMap = treeDisplayMap;
        },
    };

    const actions = {
        async refreshProjectTree() {
            const copiedMap = cloneDeep(state.treeDisplayMap);
            state.treeDisplayMap = {};
            await nextTick();
            state.treeDisplayMap = copiedMap;
        },
        disposeProjectTree() {
            state.treeDisplayMap = {};
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
