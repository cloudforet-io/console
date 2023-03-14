<template>
    <section class="role-edit-page">
        <p-heading show-back-button
                   :title="$t('IAM.ROLE.FORM.EDIT_TITLE')"
                   @click-back-button="$router.go(-1)"
        />
        <role-update-form :initial-role-data="initialRoleData"
                          :form-type="FORM_TYPE.UPDATE"
                          @update-validation="handleFormValidate"
                          @update-form-data="handleUpdateForm"
        />
        <div class="text-right mt-4">
            <p-button style-type="secondary"
                      class="mr-4"
                      @click="$router.go(-1)"
            >
                {{ $t('IAM.ROLE.FORM.CANCEL') }}
            </p-button>
            <p-button style-type="primary"
                      :loading="loading"
                      :disabled="!isAllValid"
                      @click="handleClickConfirm"
            >
                {{ $t('IAM.ROLE.FORM.SAVE') }}
            </p-button>
        </div>
    </section>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { FORM_TYPE } from '@/services/administration/iam/role/config';
import RoleUpdateForm from '@/services/administration/iam/role/role-update/modules/RoleUpdateForm.vue';
import type { RoleData } from '@/services/administration/iam/role/type';


export default {
    name: 'RoleUpdatePage',
    components: {
        PHeading,
        PButton,
        RoleUpdateForm,
    },
    setup() {
        const roleId = SpaceRouter.router.currentRoute.params.id;
        const state = reactive({
            loading: false,
            isAllValid: false,
            initialRoleData: {} as RoleData,
            formData: {} as Partial<RoleData>,
        });
        const handleFormValidate = (isAllValid) => { state.isAllValid = isAllValid; };
        const handleUpdateForm = (data: Partial<RoleData>) => {
            state.formData = data;
        };
        const handleClickConfirm = async () => {
            state.loading = true;
            try {
                await SpaceConnector.client.identity.role.update({
                    role_id: roleId,
                    ...state.formData,
                });
                showSuccessMessage(i18n.t('IAM.ROLE.FORM.ALT_S_UPDATE_ROLE'), '');
                SpaceRouter.router.go(-1);
            } catch (e: any) {
                ErrorHandler.handleRequestError(e, i18n.t('IAM.ROLE.FORM.ALT_E_UPDATE_ROLE'));
            } finally {
                state.loading = false;
            }
        };
        const getRoleData = async () => {
            try {
                state.initialRoleData = await SpaceConnector.client.identity.role.get({ role_id: roleId });
            } catch (e) {
                ErrorHandler.handleError(e);
                state.initialRoleData = {} as RoleData;
            }
        };
        (async () => {
            await getRoleData();
        })();

        return {
            ...toRefs(state),
            handleClickConfirm,
            handleFormValidate,
            handleUpdateForm,
            FORM_TYPE,
        };
    },

};
</script>

<style lang="postcss" scoped>
.role-edit-page {
    @apply mx-0;
    max-width: 100%;
}
</style>
