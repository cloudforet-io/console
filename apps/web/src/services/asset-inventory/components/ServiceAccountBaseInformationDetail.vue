<script setup lang="ts">
import { reactive, watch } from 'vue';

import { PDynamicLayout } from '@spaceone/design-system';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { AccountType } from '@/schema/identity/service-account/type';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';

const props = defineProps<{
    provider?: string;
    serviceAccountData?: Record<string, any>;
    serviceAccountType: AccountType;
    loading?: boolean;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();

const state = reactive({
    detailSchema: {} as Partial<DynamicLayout>,
    fieldHandler: [],
});

/* Util */
const fieldHandler = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter(field.extraData.reference, field.data);
    }
    return {};
};

watch(() => props.provider, (provider) => {
    if (provider) serviceAccountSchemaStore.setProviderSchema(provider);
    const isTrustedAccount = props.serviceAccountType === ACCOUNT_TYPE.TRUSTED;
    const detailSchema = isTrustedAccount ? serviceAccountSchemaStore.getters.trustedAccountDetailSchema : serviceAccountSchemaStore.getters.generalAccountDetailSchema;
    state.detailSchema = detailSchema?.details[0];
});
</script>

<template>
    <div class="service-account-base-information-detail">
        <p-dynamic-layout :type="state.detailSchema?.type"
                          :options="state.detailSchema?.options"
                          :data="props.serviceAccountData"
                          :type-options="{
                              loading: !state.detailSchema?.type || loading
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
