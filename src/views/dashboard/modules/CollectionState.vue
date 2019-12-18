<template>
    <p-board-layout title="Collection State" />
</template>

<script>
import PNumberBadge from '@/components/molecules/badges/number-badge/NumberBadge';
import PBoardLayout from '@/components/organisms/layouts/board-layout/BoardLayout';

export default {
    name: 'CollectionState',
    components: {
        PBoardLayout,
        PNumberBadge,
    },
    props: {
    },
    computed: {
    },
    created() {
        // this.listCollectionStates();
    },
    methods: {
    },
};
</script>

<style lang="scss" scoped>
</style>
