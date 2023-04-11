import type { TreeNode } from '@/data-display/tree/type';

export const getDefaultNode = (data): TreeNode => ({
    data,
    children: [],
    loading: false,
    $folded: true,
    $nodeBackClass: '',
});
