<template>
    <fragment>
        <role-update-page-base-information />
        <role-update-page-access-form />
    </fragment>
</template>

<script lang="ts">
import RoleUpdatePageBaseInformation from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageBaseInformation.vue';
import RoleUpdatePageAccessForm from '@/services/administration/iam/role/update-role/modules/RoleUpdatePageAccessForm.vue';

export default {
    name: 'RoleUpdateForm',
    components: {
        RoleUpdatePageAccessForm,
        RoleUpdatePageBaseInformation,
    },
};
</script>
