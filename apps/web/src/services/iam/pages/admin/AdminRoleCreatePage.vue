<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';


import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleCreateParameters } from '@/api-clients/identity/role/schema/api-verbs/create';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import RoleCreateEditHandbook from '@/services/iam/components/RoleCreateEditHandbook.vue';
import RoleUpdateForm from '@/services/iam/components/RoleUpdateForm.vue';

const router = useRouter();

const state = reactive({
    isAllValid: false,
    formData: {} as RoleCreateParameters,
});
const { roleAPI } = useRoleApi();
const queryClient = useQueryClient();
const { key: roleListQueryKey } = useServiceQueryKey('identity', 'role', 'list');
const { mutate: createRole, isPending: isCreateRolePending } = useMutation({
    mutationFn: roleAPI.create,
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_CREATE_ROLE'), '');
        router.go(-1);
        queryClient.invalidateQueries({ queryKey: roleListQueryKey });
    },
    onError: (e) => {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_CREATE_ROLE'));
    },
});
const handleClickConfirm = async () => {
    createRole(state.formData);
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
                      :loading="isCreateRolePending"
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
