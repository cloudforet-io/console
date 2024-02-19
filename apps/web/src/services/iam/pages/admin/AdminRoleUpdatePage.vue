<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { RoleGetParameters } from '@/schema/identity/role/api-verbs/get';
import type { RoleUpdateParameters } from '@/schema/identity/role/api-verbs/update';
import type { RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import RoleUpdateForm from '@/services/iam/components/RoleUpdateForm.vue';
import { FORM_TYPE } from '@/services/iam/constants/role-constant';

const router = useRouter();
const roleId = router.currentRoute.params.id;

const state = reactive({
    loading: false,
    isAllValid: false,
    initialRoleData: {} as RoleModel,
    formData: {} as RoleUpdateParameters,
});

const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
const handleUpdateForm = (data: RoleUpdateParameters) => {
    // TODO: will be updated in the next step.
    state.formData = {
        ...data,
        permissions: [],
    };
};
const handleClickConfirm = async () => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.identity.role.update<RoleUpdateParameters, RoleModel>({
            ...state.formData,
            role_id: roleId,
        });
        showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_UPDATE_ROLE'), '');
        router.go(-1);
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_UPDATE_ROLE'));
    } finally {
        state.loading = false;
    }
};
const getRoleData = async () => {
    try {
        state.initialRoleData = await SpaceConnector.clientV2.identity.role.get<RoleGetParameters, RoleModel>({
            role_id: roleId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
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
