<template>
    <div />
</template>

<script lang="ts">
import {reactive, toRefs} from '@vue/composition-api';

export default {
    name: 'ProjectFavorites',
    setup(props) {
        const state = reactive({

        });
        return {
            ...toRefs(state)
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
