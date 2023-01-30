<template>
    <p-data-loader class="service-account-credentials-detail"
                   :data="Object.keys(convertedCredentialData)"
                   :loading="loading"
    >
        <p-dynamic-layout v-if="detailSchema"
                          v-bind="detailSchema"
                          :data="convertedCredentialData"
                          :field-handler="fieldHandler"
        />
        <template #no-data>
            <div class="no-data-wrapper">
                <p class="text">
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.NO_CREDENTIALS') }}
                </p>
                <p-button v-if="hasManagePermission"
                          style-type="substitutive"
                          icon-left="ic_plus_bold"
                          @click="handleClickAddButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.ADD_CREDENTIALS') }}
                </p-button>
            </div>
        </template>
    </p-data-loader>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from 'vue';

import {
    PDataLoader, PDynamicLayout, PButton,
} from '@spaceone/design-system';
import type { DynamicField } from '@spaceone/design-system/types/data-display/dynamic/dynamic-field/type/field-schema';
import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { ServiceAccountReferenceMap } from '@/store/modules/reference/service-account/type';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import type { CredentialModel } from '@/services/asset-inventory/service-account/type';

interface Props {
    loading: boolean;
    credentialData: CredentialModel;
    attachedTrustedAccountId?: string;
}

export default defineComponent<Props>({
    name: 'ServiceAccountCredentialsDetail',
    components: {
        PDataLoader,
        PDynamicLayout,
        PButton,
    },
    props: {
        loading: {
            type: Boolean,
            default: true,
        },
        credentialData: {
            type: Object as PropType<CredentialModel>,
            default: () => ({}),
        },
        attachedTrustedAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const storeState = reactive({
            serviceAccounts: computed<ServiceAccountReferenceMap>(() => store.getters['reference/serviceAccountItems']),
        });
        const state = reactive({
            hasManagePermission: useManagePermissionState(),
            attachedTrustedAccount: computed(() => {
                if (props.attachedTrustedAccountId) return storeState.serviceAccounts[props.attachedTrustedAccountId];
                return undefined;
            }),
            credentialJsonSchema: {} as JsonSchema,
            convertedCredentialData: computed(() => {
                const convertedData = { ...props.credentialData };
                Object.keys(state.credentialJsonSchema?.properties ?? {}).forEach((k) => {
                    convertedData[k] = '••••••••••••••••••••';
                });
                if (props.attachedTrustedAccountId) {
                    convertedData.trusted_service_account_id = state.attachedTrustedAccount?.label ?? props.attachedTrustedAccountId;
                }
                return convertedData;
            }),
            detailSchema: computed(() => {
                const fields: DynamicField[] = [{
                    key: 'schema', name: 'Secret Type', type: 'text', options: { disable_copy: true },
                }];
                if (props.attachedTrustedAccountId) {
                    const link = SpaceRouter.router.resolve(referenceRouter(props.attachedTrustedAccountId, { resource_type: 'identity.ServiceAccount' })).href;
                    fields.push({
                        key: 'trusted_service_account_id',
                        name: 'Trusted Account',
                        type: 'text',
                        options: { link, disable_copy: true },
                    });
                }
                Object.entries(state.credentialJsonSchema?.properties ?? {}).forEach(([k, v]) => {
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
                        fields,
                        translation_id: 'IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS',
                    },
                };
            }),
        });

        /* Util */
        const fieldHandler = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* Api */
        const getCredentialSchema = async (selectedSecretType) => {
            try {
                const res = await SpaceConnector.client.repository.schema.get({
                    name: selectedSecretType,
                    only: ['schema'],
                });
                state.credentialJsonSchema = res.schema;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.credentialJsonSchema = {};
            }
        };

        /* Event */
        const handleClickAddButton = () => {
            emit('edit');
        };

        /* Init */
        (async () => {
            await store.dispatch('reference/serviceAccount/load');
        })();

        /* Watcher */
        watch(() => props.credentialData, (credentialData) => {
            if (credentialData?.schema) {
                getCredentialSchema(credentialData.schema);
            } else {
                state.credentialJsonSchema = {};
            }
        });

        return {
            ...toRefs(state),
            fieldHandler,
            handleClickAddButton,
        };
    },
});
</script>
<style lang="postcss" scoped>
.service-account-credentials-detail {
    height: 100%;

    /* custom design-system component - p-panel-top */
    :deep(.p-panel-top) {
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
