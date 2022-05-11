<template>
    <section class="role-create-page">
        <p-page-title title="Create Role" />
        <role-update-form />
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { PPageTitle } from '@spaceone/design-system';
import RoleUpdateForm from '@/services/administration/iam/role/update-role/modules/RoleUpdateForm.vue';

export default {
    name: 'RoleCreatePage',
    components: {
        RoleUpdateForm,
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
