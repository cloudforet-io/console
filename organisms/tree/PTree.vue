<template>
    <p-tree-node />
</template>

<script lang="ts">
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { treeProps } from '@/components/organisms/tree/PTree.toolset';

export default {
    name: 'PTree',
    components: { PTreeNode },
    props: treeProps,
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>

</style>
