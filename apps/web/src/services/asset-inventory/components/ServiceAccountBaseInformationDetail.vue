<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDynamicLayout } from '@spaceone/design-system';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { AccountType } from '@/schema/identity/service-account/type';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';

const props = defineProps<{
    provider?: string;
    serviceAccountData?: Record<string, any>;
    serviceAccountType: AccountType;
    loading?: boolean;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    detailSchema: {} as Partial<DynamicLayout>,
    fieldHandler: [],
    baseInformationData: computed(() => {
        const accountType = props.serviceAccountType === ACCOUNT_TYPE.TRUSTED ? 'Trusted Account' : 'General Account';
        return ({
            ...props.serviceAccountData,
            account_type: accountType,
        } ?? {});
    }),
});

/* Util */
const fieldHandler = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter({ ...field.extraData.reference, workspace_id: userWorkspaceStore.getters.currentWorkspaceId }, field.data);
    }
    return {};
};

watch(() => props.provider, async (provider) => {
    if (provider) {
        await serviceAccountSchemaStore.setProviderSchema(provider);
        await serviceAccountSchemaStore.setGeneralAccountDetailSchema();
        await serviceAccountSchemaStore.setTrustedAccountDetailSchema();

        const isTrustedAccount = props.serviceAccountType === ACCOUNT_TYPE.TRUSTED;
        const detailSchema = isTrustedAccount ? serviceAccountSchemaStore.state.trustedAccountDetailSchema : serviceAccountSchemaStore.state.generalAccountDetailSchema;
        if (detailSchema?.details[0]) state.detailSchema = detailSchema?.details[0];
    }
});
</script>

<template>
    <div class="service-account-base-information-detail">
        <p-dynamic-layout :type="state.detailSchema?.type"
                          :options="state.detailSchema?.options"
                          :data="state.baseInformationData"
                          :type-options="{
                              loading: !state.detailSchema?.type || props.loading
                          }"
                          :field-handler="fieldHandler"
        />
    </div>
</template>

<style lang="postcss" scoped>
.service-account-base-information-detail {
    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        display: none;
    }
}
</style>
