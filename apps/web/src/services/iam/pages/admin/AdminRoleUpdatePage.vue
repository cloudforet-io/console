<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';


import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import type { RoleUpdateParameters } from '@/api-clients/identity/role/schema/api-verbs/update';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import HandbookButton from '@/common/modules/portals/HandbookButton.vue';

import RoleCreateEditHandbook from '@/services/iam/components/RoleCreateEditHandbook.vue';
import RoleUpdateForm from '@/services/iam/components/RoleUpdateForm.vue';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';


const router = useRouter();
const roleId = router.currentRoute.params.id;

const { roleAPI } = useRoleApi();
const queryClient = useQueryClient();

const { key: roleListQueryKey } = useServiceQueryKey('identity', 'role', 'list');
const { withSuffix: roleGetQueryKey } = useServiceQueryKey('identity', 'role', 'get');

interface RoleUpdateState {
    loading: boolean;
    isAllValid: boolean;
    initialRoleData: RoleModel | undefined;
    formData: RoleUpdateParameters | undefined;
}

const state = reactive<RoleUpdateState>({
    loading: false,
    isAllValid: false,
    initialRoleData: undefined,
    formData: undefined,
});

const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
const handleUpdateForm = (data: RoleUpdateParameters) => {
    state.formData = data;
};
const { mutateAsync: updateRole, isPending: isUpdateRolePending } = useMutation({
    mutationFn: roleAPI.update,
    onSuccess: () => {
        showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_UPDATE_ROLE'), '');
        router.go(-1);
        queryClient.invalidateQueries({ queryKey: roleListQueryKey.value });
        queryClient.invalidateQueries({ queryKey: roleGetQueryKey(roleId) });
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('IAM.ROLE.FORM.ALT_E_UPDATE_ROLE'));
    },
});
const handleClickConfirm = async () => {
    await updateRole({
        ...state.formData,
        role_id: roleId,
    });
};
</script>

<template>
    <section class="role-edit-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading show-back-button
                           :title="$t('IAM.ROLE.FORM.EDIT_TITLE')"
                           @click-back-button="router.go(-1)"
                />
            </template>
            <template #extra>
                <handbook-button type="iam/role/create-edit"
                                 class="role-edit-handbook-button"
                >
                    <keep-alive>
                        <role-create-edit-handbook />
                    </keep-alive>
                </handbook-button>
            </template>
        </p-heading-layout>
        <role-update-form
            :role-id="roleId"
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
                      :loading="isUpdateRolePending"
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
    .role-edit-handbook-button {
        height: 2rem;
    }
}
</style>
