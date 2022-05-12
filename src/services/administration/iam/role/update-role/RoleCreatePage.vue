<template>
    <section class="role-create-page">
        <p-page-title title="Create Role" />
        <role-update-form @update-validation="handleFormValidate" />
        <div class="text-right mt-4">
            <p-button style-type="gray-border" :outline="true" class="mr-4"
                      @click="$router.go(-1)"
            >
                {{ $t('IAM.ROLE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary-dark" :loading="loading" :disabled="!isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('IAM.ROLE.FORM.CREATE') }}
            </p-button>
        </div>
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { PPageTitle, PButton } from '@spaceone/design-system';
import RoleUpdateForm from '@/services/administration/iam/role/update-role/modules/RoleUpdateForm.vue';

export default {
    name: 'RoleCreatePage',
    components: {
        RoleUpdateForm,
        PPageTitle,
        PButton,
    },
    setup() {
        const state = reactive({
            loading: false,
            isAllValid: false,
        });
        const handleClickConfirm = () => { console.log('confirm'); };
        const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
        return {
            ...toRefs(state),
            handleClickConfirm,
            handleFormValidate,
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
