<template>
    <section class="role-edit-page">
        <p-page-title title="Edit Role" />
        <role-update-form />
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { PPageTitle } from '@spaceone/design-system';
import RoleUpdateForm from '@/services/administration/iam/role/update-role/modules/RoleUpdateForm.vue';

export default {
    name: 'RoleEditPage',
    components: {
        PPageTitle,
        RoleUpdateForm,
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
