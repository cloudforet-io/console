<template>
    <section class="edit-role-page">
        <p-page-title title="Edit Role" />
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { PPageTitle } from '@spaceone/design-system';

export default {
    name: 'EditRolePage',
    components: {
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
.edit-role-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
