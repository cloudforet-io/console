<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleCreateParameters } from '@/schema/identity/role/api-verbs/create';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import RoleUpdateForm from '@/services/administration/components/RoleUpdateForm.vue';

const router = useRouter();

const state = reactive({
    loading: false,
    isAllValid: false,
    formData: {} as RoleCreateParameters,
});
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.role.create<RoleCreateParameters, RoleModel>(state.formData);
        showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_CREATE_ROLE'), '');
        router.go(-1);
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_CREATE_ROLE'));
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
