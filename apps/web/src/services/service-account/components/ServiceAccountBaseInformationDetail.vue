<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import { PDynamicLayout, PStatus } from '@cloudforet/mirinae';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';

import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { useServiceAccountDetail } from '@/services/service-account/composables/use-service-account-detail';
import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { getAccountFields, stateFormatter } from '@/services/service-account/helpers/dynamic-ui-schema-generator';
import { getDefaultDetailSchema } from '@/services/service-account/helpers/dynamic-ui-schema-generator/dynamic-layout-schema-template';
import type { ItemLayout } from '@/services/service-account/helpers/dynamic-ui-schema-generator/type';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';



const props = defineProps<{
    loading?: boolean;
    serviceAccountId?: string;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const serviceAccountPageState = serviceAccountPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const userStore = useUserStore();
const appContextStore = useAppContextStore();

const { referenceFieldFormatter } = useReferenceFieldFormatter();

const {
    serviceAccountData,
    isTrustedAccount,
} = useServiceAccountDetail({
    serviceAccountId: computed(() => props.serviceAccountId),
});

const {
    generalAccountSchema,
    trustedAccountSchema,
} = useServiceAccountProviderSchema();

const state = reactive({
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    // detailSchema: {} as ItemLayout,
    detailSchema: computed<ItemLayout|undefined>(() => {
        if (isTrustedAccount.value) {
            const fields: DynamicField[] = getAccountFields(trustedAccountSchema.value);
            return getDefaultDetailSchema(fields, { isTrustedAccount: true, isAdminMode: appContextStore.getters.isAdminMode });
        }
        const fields: DynamicField[] = getAccountFields(generalAccountSchema.value);
        return getDefaultDetailSchema(fields, { isTrustedAccount: false });
    }),
    fieldHandler: [],
    baseInformationData: computed(() => {
        const accountType = isTrustedAccount.value ? 'Trusted Account' : 'General Account';
        return {
            ...serviceAccountData.value,
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

watch(() => serviceAccountPageState.selectedProvider, (provider) => {
    if (provider) {
        serviceAccountSchemaStore.setCurrentProvider(provider);
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
