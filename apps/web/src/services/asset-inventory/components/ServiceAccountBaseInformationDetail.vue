<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import { PDynamicLayout } from '@cloudforet/mirinae';

import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import type { ItemLayout } from '@/services/asset-inventory/helpers/dynamic-ui-schema-generator/type';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';

const props = defineProps<{
    loading?: boolean;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    timezone: computed<string>(() => store.state.user.timezone),
    detailSchema: {} as ItemLayout,
    fieldHandler: [],
    isTrustedAccount: computed(() => serviceAccountPageState.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    baseInformationData: computed(() => {
        const accountType = state.isTrustedAccount ? 'Trusted Account' : 'General Account';
        return ({
            ...serviceAccountPageState.originServiceAccountItem,
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

watch(() => serviceAccountPageState.selectedProvider, async (provider) => {
    if (provider) {
        await serviceAccountSchemaStore.setProviderSchema(provider);
        await serviceAccountSchemaStore.setGeneralAccountDetailSchema();
        await serviceAccountSchemaStore.setTrustedAccountDetailSchema();

        const detailSchema = state.isTrustedAccount ? serviceAccountSchemaStore.state.trustedAccountDetailSchema : serviceAccountSchemaStore.state.generalAccountDetailSchema;
        if (detailSchema) state.detailSchema = detailSchema;
    }
}, { immediate: true });
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
        >
            <template #data-created_at="item">
                {{ dayjs(item.data).tz(state.timezone).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
        </p-dynamic-layout>
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
