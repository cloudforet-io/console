import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';

import type {
    TreeNodeDisplayType, TreeNodeEmit,
} from '@/data-display/tree/new-tree/type';

export const useTreeNodeToggle = ({
    expanded, hasChildren, loading, displayType,
}:{
  expanded: Ref<boolean>;
  hasChildren: Ref<boolean>;
  loading: Ref<boolean>;
  displayType: Ref<TreeNodeDisplayType>;
}, emit: TreeNodeEmit) => {
    const enableToggle = computed(() => displayType.value === 'tree');
    const isExpanded = ref(expanded.value);
    watch(expanded, (value) => {
        isExpanded.value = value;
    });
    watch(isExpanded, (value) => {
        emit('update:expanded', value);
    });

    // whether to show toggle button. only show when it is leaf node.
    const showToggle = computed(() => {
        if (!enableToggle.value) return false;
        if (loading.value) return true;
        return hasChildren.value;
    });
    const isLoading = ref(loading.value);
    watch(loading, (value) => {
        isLoading.value = value;
    });
    return {
        enableToggle, showToggle, isExpanded,
    };
};
