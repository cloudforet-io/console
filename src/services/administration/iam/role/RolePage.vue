<template>
    <section class="role-page">
        <p-page-title title="Role" />
        <p-horizontal-layout>
            <template #container="{ height }" />
        </p-horizontal-layout>
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle,
} from '@spaceone/design-system';

export default {
    name: 'RolePage',
    components: {
        PHorizontalLayout,
        PPageTitle,
    },
    setup() {
        const state = reactive({
            // selected
        });

        return {
            ...toRefs(state),
        };
    },

};
</script>

<style lang="postcss" scoped>
.role-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
