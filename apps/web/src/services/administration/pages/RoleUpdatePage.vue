<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@spaceone/design-system';

import type { RoleUpdateParameters } from '@/schema/identity/role/api-verbs/update';
import type { RoleModel } from '@/schema/identity/role/model';

import RoleUpdateForm from '@/services/administration/components/RoleUpdateForm.vue';
import { FORM_TYPE } from '@/services/administration/constants/role-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const router = useRouter();
const roleId = router.currentRoute.params.id;

const rolePageStore = useRolePageStore();

const state = reactive({
    loading: false,
    isAllValid: false,
    initialRoleData: {} as RoleModel,
    formData: {} as RoleUpdateParameters,
});

const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
const handleUpdateForm = (data: RoleUpdateParameters) => {
    state.formData = data;
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await rolePageStore.updateRole({
            ...state.formData,
            role_id: roleId,
        });
        router.go(-1);
    } finally {
        state.loading = false;
    }
};
const getRoleData = async () => {
    try {
        state.initialRoleData = await rolePageStore.getRoleDetail({ role_id: roleId });
    } catch (e) {
        state.initialRoleData = {} as RoleModel;
    }
};
(async () => {
    await getRoleData();
})();
</script>

<template>
    <section class="role-edit-page">
        <p-heading show-back-button
                   :title="$t('IAM.ROLE.FORM.EDIT_TITLE')"
                   @click-back-button="router.go(-1)"
        />
        <role-update-form :initial-role-data="state.initialRoleData"
                          :form-type="FORM_TYPE.UPDATE"
                          @update-validation="handleFormValidate"
                          @update-form-data="handleUpdateForm"
        />
        <div class="text-right mt-4">
            <p-button style-type="secondary"
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
                {{ $t('IAM.ROLE.FORM.SAVE') }}
            </p-button>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.role-edit-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
