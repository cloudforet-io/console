<template>
    <section class="role-edit-page">
        <p-page-title title="Edit Role" />
        <role-update-form @update-validation="handleFormValidate" />
        <div class="text-right mt-4">
            <p-button style-type="primary-dark" :outline="true" class="mr-4"
                      @click="$router.go(-1)"
            >
                <!-- song-lang-->
                {{ $t('Cancel') }}
            </p-button>
            <p-button style-type="primary-dark" :loading="loading" :disabled="!isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('Save') }}
            </p-button>
        </div>
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

import { PPageTitle, PButton } from '@spaceone/design-system';
import RoleUpdateForm from '@/services/administration/iam/role/update-role/modules/RoleUpdateForm.vue';

export default {
    name: 'RoleEditPage',
    components: {
        PPageTitle,
        PButton,
        RoleUpdateForm,
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
.edit-role-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
