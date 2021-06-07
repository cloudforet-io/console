<template>
    <p-pane-layout class="alert-detail-info">
        Info
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'AlertDetailInfo',
    components: {
        PPaneLayout,
    },
    setup() {
        return {

        };
    },
};


</script>

<style lang="postcss" scoped>
.alert-detail-info {
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
</style>
