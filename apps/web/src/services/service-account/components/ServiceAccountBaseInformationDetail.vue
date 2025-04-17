<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import { PDynamicLayout, PStatus } from '@cloudforet/mirinae';

import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import type { ItemLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';

const props = defineProps<{
    loading?: boolean;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();

const { referenceFieldFormatter } = useReferenceFieldFormatter();

const state = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    detailSchema: {} as ItemLayout,
    fieldHandler: [],
    isTrustedAccount: computed(() => serviceAccountPageState.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    baseInformationData: computed(() => {
        const accountType = state.isTrustedAccount ? 'Trusted Account' : 'General Account';
        return {
            ...serviceAccountPageState.originServiceAccountItem,
            account_type: accountType,
        };
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
            <template #data-state="{value}">
                <p-status v-bind="stateFormatter(value)"
                          class="capitalize"
                />
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
