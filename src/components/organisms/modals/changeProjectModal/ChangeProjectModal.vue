<template>
    <p-tree-modal />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PTreeModal from '@/components/organisms/modals/tree-modal/TreeModal.vue';

export default defineComponent({
    name: 'SChangeProjectModal',
    components: { PTreeModal },
    setup(props, context) {
        return {

        };
    },
});
</script>

<style scoped>

</style>
