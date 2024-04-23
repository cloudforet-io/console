import { nextTick, reactive } from 'vue';

import { cloneDeep } from 'lodash';
import { defineStore } from 'pinia';

import type { TreeDisplayMap } from '@/services/project/tree/type';

export const useProjectTreeStore = defineStore('project-tree', () => {
    const state = reactive({
        treeDisplayMap: {} as TreeDisplayMap,
    });

    const actions = {
        async refreshProjectTree() {
            const copiedMap = cloneDeep(state.treeDisplayMap);
            state.treeDisplayMap = {};
            await nextTick();
            state.treeDisplayMap = copiedMap;
        },
    };

    return {
        state,
        ...actions,
    };
});
