<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PHeading, PButton } from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import RoleUpdateForm from '@/services/administration/iam/role/role-update/modules/RoleUpdateForm.vue';
import type { RoleData } from '@/services/administration/iam/role/type';

const { t } = useI18n();
const router = useRouter();

const state = reactive({
    loading: false,
    isAllValid: false,
    formData: {} as Partial<RoleData>,
});
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.client.identity.role.create(state.formData);
        showSuccessMessage(t('IAM.ROLE.FORM.ALT_S_CREATE_ROLE'), '');
        router.go(-1);
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, t('IAM.ROLE.FORM.ALT_E_CREATE_ROLE'));
    } finally {
        state.loading = false;
    }
};
const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
const handleUpdateForm = (data: Partial<RoleData>) => {
    state.formData = data;
};

</script>

<template>
    <section class="role-create-page">
        <p-heading
            show-back-button
            :title="t('IAM.ROLE.FORM.CREATE_TITLE')"
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
                {{ t('IAM.ROLE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="state.loading"
                      :disabled="!state.isAllValid"
                      @click="handleClickConfirm"
            >
                {{ t('IAM.ROLE.FORM.CREATE') }}
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
