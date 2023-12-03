<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PLink, PButton, PIconButton, PHeading, PLazyImg,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { render } from 'ejs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProviderGetParameters } from '@/schema/identity/provider/api-verbs/get';
import type { ProviderModel } from '@/schema/identity/provider/model';
import type { ServiceAccountGetParameters } from '@/schema/identity/service-account/api-verbs/get';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
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

const props = defineProps<{
    serviceAccountId: string;
}>();

const storeState = reactive({
    providerLoading: true,
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    loading: true,
    hasManagePermission: useManagePermissionState(),
    item: {} as ServiceAccountModel,
    serviceAccountType: computed(() => (state.item.trusted_account_id ? ACCOUNT_TYPE.TRUSTED : ACCOUNT_TYPE.GENERAL)),
    attachedGeneralAccounts: [] as ServiceAccountModel[],
    attachedTrustedAccountId: computed(() => state.item.trusted_account_id),
    providerData: {} as ProviderModel,
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
        if (state.provider?.linkTemplate) return render(state.provider.linkTemplate, state.item);
        return '';
    }),
    projectId: computed(() => state.item.project_info?.project_id),
    deleteModalVisible: false,
    isManagedTrustedAccount: computed(() => state.item.tags?.is_managed === 'true'),
    domainId: computed(() => store.state.domain.domainId), // TODO: remove domain_id after backend is ready
});

/* Api */
const getServiceAccount = async (serviceAccountId: string) => {
    try {
        state.loading = true;
        state.item = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
            domain_id: state.domainId, // TODO: remove domain_id after backend is ready
            service_account_id: serviceAccountId,
            // workspace_id: ws-xxxxx   # TODO: add workspace_id after store is ready
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.item = {};
    } finally {
        state.loading = false;
    }
};
const getProviderData = async (provider:string) => {
    try {
        state.providerData = await SpaceConnector.clientV2.identity.provider.get<ProviderGetParameters, ProviderModel>({
            domain_id: state.domainId, // TODO: remove domain_id after backend is ready
            provider,
            workspace_id: undefined,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.providerData = {};
    }
};

/* Event */
const handleOpenDeleteModal = () => {
    state.deleteModalVisible = true;
};
const handleRefresh = () => {
    getServiceAccount(props.serviceAccountId);
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
        await getServiceAccount(serviceAccountId);
        await getProviderData(state.providerId);
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
                                              :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                              @refresh="handleRefresh"
            />
            <service-account-attached-general-accounts v-if="state.serviceAccountType === ACCOUNT_TYPE.TRUSTED"
                                                       :service-account-id="props.serviceAccountId"
                                                       :attached-general-accounts.sync="state.attachedGeneralAccounts"
            />
            <service-account-credentials :provider="state.providerKey"
                                         :service-account-id="props.serviceAccountId"
                                         :service-account-type="state.serviceAccountType"
                                         :service-account-name="state.item.name"
                                         :project-id="state.projectId"
                                         :attached-trusted-account-id="state.attachedTrustedAccountId"
                                         :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                         :has-manage-permission="state.hasManagePermission"
                                         @refresh="handleRefresh"
            />
        </div>
        <service-account-delete-modal :visible.sync="state.deleteModalVisible"
                                      :service-account-id="serviceAccountId"
                                      :service-account-name="state.item.name"
                                      :attached-general-accounts="state.attachedGeneralAccounts"
                                      :provider-id="state.providerId"
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
