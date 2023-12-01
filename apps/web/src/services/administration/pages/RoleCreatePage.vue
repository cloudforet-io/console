<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@spaceone/design-system';

import type { RoleCreateParameters } from '@/schema/identity/role/api-verbs/create';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import RoleUpdateForm from '@/services/administration/components/RoleUpdateForm.vue';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const router = useRouter();

const rolePageStore = useRolePageStore();

const state = reactive({
    loading: false,
    isAllValid: false,
    formData: {} as RoleCreateParameters,
});
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await rolePageStore.createRole(state.formData);
        showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_CREATE_ROLE'), '');
        router.go(-1);
    } finally {
        state.loading = false;
    }
};
const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
const handleUpdateForm = (data: RoleCreateParameters) => {
    state.formData = data;
};
</script>

<template>
    <section class="role-create-page">
        <p-heading
            show-back-button
            :title="$t('IAM.ROLE.FORM.CREATE_TITLE')"
            @click-back-button="router.go(-1)"
        />
        <role-update-form @update-validation="handleFormValidate"
                          @update-form-data="handleUpdateForm"
        />
        <div class="text-right mt-4">
            <p-button style-type="tertiary"
                      class="mr-4"
                      @click="router.go(-1)"
            >
                {{ $t('IAM.ROLE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="state.loading"
                      :disabled="!state.isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('IAM.ROLE.FORM.CREATE') }}
            </p-button>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.role-create-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
