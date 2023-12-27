<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PLink, PButton, PIconButton, PHeading, PLazyImg,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { render } from 'ejs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceAccountGetParameters } from '@/schema/identity/service-account/api-verbs/get';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { AccountType } from '@/schema/identity/service-account/type';
import type { TrustedAccountGetParameters } from '@/schema/identity/trusted-account/api-verbs/get';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import ServiceAccountAttachedGeneralAccounts
    from '@/services/asset-inventory/components/ServiceAccountAttachedGeneralAccounts.vue';
import ServiceAccountBaseInformation
    from '@/services/asset-inventory/components/ServiceAccountBaseInformation.vue';
import ServiceAccountCredentials
    from '@/services/asset-inventory/components/ServiceAccountCredentials.vue';
import ServiceAccountDeleteModal
    from '@/services/asset-inventory/components/ServiceAccountDeleteModal.vue';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';

const props = defineProps<{
    serviceAccountId?: string;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();

const storeState = reactive({
    providerLoading: true,
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    providerExternalLink: computed(() => (state.serviceAccountType === ACCOUNT_TYPE.TRUSTED
        ? serviceAccountSchemaStore.getters.trustedAccountSchema?.options?.external_link
        : serviceAccountSchemaStore.getters.generalAccountSchema?.options?.external_link)),
});
const state = reactive({
    loading: true,
    hasManagePermission: useManagePermissionState(),
    item: {} as ServiceAccountModel,
    serviceAccountType: ACCOUNT_TYPE.GENERAL as AccountType,
    attachedGeneralAccounts: [] as ServiceAccountModel[],
    attachedTrustedAccountId: computed(() => state.item?.trusted_account_id),
    providerId: computed(() => state.item?.provider),
    provider: computed(() => {
        if (!storeState.providerLoading && !state.loading) {
            return storeState.providers[state.providerId] || undefined;
        }
        return undefined;
    }),
    providerKey: computed(() => state.provider?.key),
    providerIcon: computed(() => state.provider?.icon),
    consoleLink: computed(() => {
        if (storeState.providerExternalLink) return render(storeState.providerExternalLink, state.item);
        return '';
    }),
    projectId: computed(() => state.item.project_info?.project_id),
    deleteModalVisible: false,
    isManagedTrustedAccount: computed(() => state.item.workspace_id === '*'),
});

/* Api */
const getAccount = async (serviceAccountId: string) => {
    state.loading = true;
    try {
        if (state.serviceAccountType === ACCOUNT_TYPE.TRUSTED) {
            state.item = await SpaceConnector.clientV2.identity.trustedAccount.get<TrustedAccountGetParameters, TrustedAccountModel>({
                trusted_account_id: serviceAccountId,
            });
        } else {
            state.item = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
                service_account_id: serviceAccountId,
            });
        }
    } catch (e) {
        ErrorHandler.handleError(e);
        state.item = {};
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleOpenDeleteModal = () => {
    state.deleteModalVisible = true;
};
const handleRefresh = () => {
    if (props.serviceAccountId) getAccount(props.serviceAccountId);
};

/* Init */
(async () => {
    storeState.providerLoading = true;
    await store.dispatch('reference/provider/load');
    storeState.providerLoading = false;
})();

/* Watcher */
watch(() => props.serviceAccountId, async (serviceAccountId) => {
    if (serviceAccountId) {
        state.serviceAccountType = (serviceAccountId?.startsWith('ta') ? ACCOUNT_TYPE.TRUSTED : ACCOUNT_TYPE.GENERAL);
        await getAccount(serviceAccountId);
    }
}, { immediate: true });

</script>

<template>
    <div class="service-account-detail-page">
        <p-heading :title="state.item.name"
                   show-back-button
                   class="page-title"
                   @click-back-button="$router.go(-1)"
        >
            <template #title-left-extra>
                <p-lazy-img :src="state.providerIcon"
                            :loading="storeState.providerLoading || state.loading"
                            error-icon="ic_cloud-filled"
                />
            </template>
            <template v-if="state.hasManagePermission && !state.isManagedTrustedAccount"
                      #title-right-extra
            >
                <div class="title-right-wrapper">
                    <p-icon-button name="ic_delete"
                                   class="w-full delete-button"
                                   @click="handleOpenDeleteModal"
                    />
                </div>
            </template>
            <template v-if="state.hasManagePermission && !state.isManagedTrustedAccount"
                      #extra
            >
                <p-button style-type="tertiary"
                          class="link-button"
                >
                    <p-link :href="state.consoleLink"
                            :action-icon="ACTION_ICON.EXTERNAL_LINK"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CONNECT_TO_CONSOLE') }}
                    </p-link>
                </p-button>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <service-account-base-information :provider="state.providerKey"
                                              :service-account-loading="state.loading"
                                              :service-account-id="props.serviceAccountId"
                                              :service-account-type="state.serviceAccountType"
                                              :service-account-data="state.item"
                                              :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                              @refresh="handleRefresh"
            />
            <service-account-attached-general-accounts v-if="state.serviceAccountType === ACCOUNT_TYPE.TRUSTED && props.serviceAccountId"
                                                       :service-account-id="props.serviceAccountId"
                                                       :attached-general-accounts.sync="state.attachedGeneralAccounts"
            />
            <service-account-credentials :provider="state.providerKey"
                                         :service-account-id="props.serviceAccountId"
                                         :service-account-type="state.serviceAccountType"
                                         :service-account-data="state.item"
                                         :project-id="state.projectId"
                                         :attached-trusted-account-id="state.attachedTrustedAccountId"
                                         :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                         :has-manage-permission="state.hasManagePermission"
                                         @refresh="handleRefresh"
            />
        </div>
        <service-account-delete-modal :visible.sync="state.deleteModalVisible"
                                      :service-account-type="state.serviceAccountType"
                                      :service-account-data="state.item"
                                      :attached-general-accounts="state.attachedGeneralAccounts"
        />
    </div>
</template>

<style lang="postcss" scoped>
.service-account-detail-page {
    .page-title {
        .title-right-wrapper {
            display: inline-flex;
        }
        .link-button {
            /* custom design-system component - p-link */
            :deep(.p-link) {
                .text:hover {
                    text-decoration: none;
                }
            }
        }
    }
    .content-wrapper {
        @apply grid-cols-12;
        display: grid;
        gap: 1rem;
        .service-account-account-type {
            @apply col-span-6;
            .badge-wrapper {
                padding: 0 1rem 2.5rem 1rem;
            }
        }
        .service-account-project {
            @apply col-span-6;
        }
        .service-account-attached-general-accounts {
            @apply col-span-12;
        }
        .service-account-base-information {
            @apply col-span-12;
        }
        .service-account-credentials {
            @apply col-span-12;
        }
    }

    @screen mobile {
        .content-wrapper {
            .service-account-account-type {
                @apply col-span-12;
            }
            .service-account-project {
                @apply col-span-12;
            }
        }
    }
}
</style>
