<template>
    <p-pane-layout class="alert-detail-note">
        Note
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'AlertDetailNote',
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
.alert-detail-note {
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
}
</style>
