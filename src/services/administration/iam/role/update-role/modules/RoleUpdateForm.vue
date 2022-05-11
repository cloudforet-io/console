<template>
    <fragment>
        <role-update-page-base-information />
    </fragment>
</template>

<script lang="ts">
import RoleUpdatePageBaseInformation from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageBaseInformation.vue';

export default {
    name: 'RoleUpdateForm',
    components: {
        RoleUpdatePageBaseInformation,
    },
};
</script>
