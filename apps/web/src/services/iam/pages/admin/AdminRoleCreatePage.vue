<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';


import type { RoleCreateParameters } from '@/api-clients/identity/role/schema/api-verbs/create';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import RoleCreateEditHandbook from '@/services/iam/components/RoleCreateEditHandbook.vue';
import RoleUpdateForm from '@/services/iam/components/RoleUpdateForm.vue';

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
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           :title="$t('IAM.ROLE.FORM.CREATE_TITLE')"
                           @click-back-button="router.go(-1)"
                />
            </template>
            <template #extra>
                <handbook-button type="iam/role/create-edit"
                                 class="create-role-handbook-button"
                >
                    <keep-alive>
                        <role-create-edit-handbook />
                    </keep-alive>
                </handbook-button>
            </template>
        </p-heading-layout>

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
    .create-role-handbook-button {
        height: 2rem;
    }
}
</style>
