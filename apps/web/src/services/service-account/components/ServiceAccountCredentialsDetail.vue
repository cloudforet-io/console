<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PDataLoader, PDynamicLayout, PButton,
} from '@cloudforet/mirinae';
import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';
import type { DynamicField } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-field/type/field-schema';


import type { SecretModel } from '@/api-clients/secret/secret/schema/model';
import type { TrustedSecretModel } from '@/api-clients/secret/trusted-secret/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { SpaceRouter } from '@/router';

import { useReferenceRouter } from '@/router/composables/use-reference-router';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useReferenceFieldFormatter } from '@/lib/reference/use-reference-field-formatter';

import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';


interface Props {
    loading: boolean;
    credentialData: Partial<SecretModel|TrustedSecretModel>;
    attachedTrustedAccountId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    credentialData: () => ({}),
    attachedTrustedAccountId: undefined,
});

const emit = defineEmits<{(e: 'edit'): void;
}>();
const userWorkspaceStore = useUserWorkspaceStore();

const { getReferenceLocation } = useReferenceRouter();
const { referenceFieldFormatter } = useReferenceFieldFormatter();
const referenceMap = useAllReferenceDataModel();

const { currentProviderSchemaList } = useServiceAccountProviderSchema();
const credentialJsonSchema = computed<JsonSchema|undefined>(() => currentProviderSchemaList.value.find((schema) => (schema.schema_id === props.credentialData.schema_id))?.schema);

const state = reactive({
    attachedTrustedAccount: computed(() => {
        if (props.attachedTrustedAccountId) return referenceMap.trustedAccount[props.attachedTrustedAccountId];
        return undefined;
    }),
    convertedCredentialData: computed(() => {
        const convertedData = { ...props.credentialData };
        Object.keys(credentialJsonSchema.value?.properties ?? {}).forEach((k) => {
            convertedData[k] = '••••••••••••••••••••';
        });
        if (props.attachedTrustedAccountId && 'trusted_secret_id' in convertedData) {
            convertedData.trusted_secret_id = state.attachedTrustedAccount?.label ?? props.attachedTrustedAccountId;
        }
        return convertedData;
    }),
    detailSchema: computed(() => {
        const fields: DynamicField[] = [{
            key: 'schema_id', name: 'Secret Schema', type: 'text', options: { disable_copy: true },
        }];
        if (props.attachedTrustedAccountId) {
            const link = SpaceRouter.router.resolve(getReferenceLocation(props.attachedTrustedAccountId, { resource_type: 'identity.ServiceAccount' })).href;
            fields.push({
                key: 'trusted_secret_id',
                name: 'Trusted Account',
                type: 'text',
                options: { link, disable_copy: true },
            });
        }
        Object.entries(credentialJsonSchema.value?.properties ?? {}).forEach(([k, v]) => {
            fields.push({
                key: k,
                name: v?.title ?? k,
                type: 'text',
                options: { disable_copy: true },
            });
        });
        return {
            name: 'Credentials',
            type: 'item',
            options: {
                styleType: 'white',
                fields,
                translation_id: 'IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS',
            },
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


/* Event */
const handleClickAddButton = () => {
    emit('edit');
};
</script>

<template>
    <p-data-loader class="service-account-credentials-detail"
                   :data="Object.keys(state.convertedCredentialData)"
                   :loading="props.loading"
    >
        <p-dynamic-layout v-if="state.detailSchema"
                          :type="state.detailSchema.type"
                          :options="state.detailSchema.options"
                          :data="state.convertedCredentialData"
                          :field-handler="fieldHandler"
        />
        <template #no-data>
            <div class="no-data-wrapper">
                <p class="text">
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.NO_CREDENTIALS') }}
                </p>
                <p-button style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="handleClickAddButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ADD_CREDENTIALS') }}
                </p-button>
            </div>
        </template>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.service-account-credentials-detail {
    min-height: 11.25rem;
    height: 100%;

    /* custom design-system component - p-heading */
    :deep(.p-heading) {
        display: none;
    }

    /* custom design-system component - p-definition-table */
    :deep(.p-definition-table) {
        min-height: auto;
    }

    .no-data-wrapper {
        .text {
            margin-bottom: 1rem;
        }
    }
}
</style>
