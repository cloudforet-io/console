<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PLink, PButton, PIconButton, PHeading, PLazyImg,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import { render } from 'ejs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceAccountGetParameters } from '@/schema/identity/service-account/api-verbs/get';
import { ACCOUNT_TYPE } from '@/schema/identity/service-account/constant';
import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import type { TrustedAccountGetParameters } from '@/schema/identity/trusted-account/api-verbs/get';
import type { TrustedAccountModel } from '@/schema/identity/trusted-account/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import ServiceAccountAttachedGeneralAccounts
    from '@/services/asset-inventory/components/ServiceAccountAttachedGeneralAccounts.vue';
import ServiceAccountAutoSync from '@/services/asset-inventory/components/ServiceAccountAutoSync.vue';
import ServiceAccountBaseInformation
    from '@/services/asset-inventory/components/ServiceAccountBaseInformation.vue';
import ServiceAccountConnectCluster from '@/services/asset-inventory/components/ServiceAccountConnectCluster.vue';
import ServiceAccountCredentials
    from '@/services/asset-inventory/components/ServiceAccountCredentials.vue';
import ServiceAccountDeleteModal
    from '@/services/asset-inventory/components/ServiceAccountDeleteModal.vue';
import ServiceAccountEditModal from '@/services/asset-inventory/components/ServiceAccountEditModal.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/asset-inventory/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/asset-inventory/stores/service-account-schema-store';

const router = useRouter();

const props = defineProps<{
    serviceAccountId?: string;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    providers: computed<ProviderReferenceMap>(() => allReferenceStore.getters.provider),
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    providerExternalLink: computed(() => (state.serviceAccountType === ACCOUNT_TYPE.TRUSTED
        ? serviceAccountSchemaStore.getters.trustedAccountSchema?.options?.external_link
        : serviceAccountSchemaStore.getters.generalAccountSchema?.options?.external_link)),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    loading: true,
    item: computed(() => serviceAccountPageStore.state.serviceAccountItem),
    serviceAccountType: computed(() => serviceAccountPageStore.state.serviceAccountType),
    isTrustedAccount: computed(() => state.serviceAccountType === ACCOUNT_TYPE.TRUSTED),
    attachedGeneralAccounts: [] as ServiceAccountModel[],
    attachedTrustedAccountId: computed(() => state.item?.trusted_account_id),
    providerId: computed(() => state.item?.provider),
    provider: computed(() => {
        if (!state.loading) {
            return storeState.providers[state.providerId] || undefined;
        }
        return undefined;
    }),
    providerKey: computed(() => state.provider?.key),
    providerIcon: computed(() => state.provider?.icon),
    isKubernetesAgentMode: computed(() => state.providerKey === 'kubernetes'),
    consoleLink: computed(() => {
        try {
            if (storeState.providerExternalLink) return render(storeState.providerExternalLink, state.item);
        } catch (e) {
            console.warn('Failed to render external link. Please check the accountID value.');
            return '';
        }
        return '';
    }),
    projectId: computed(() => state.item.project_info?.project_id),
    deleteModalVisible: false,
    editModalVisible: false,
    isManagedTrustedAccount: computed(() => state.item.workspace_id === '*'),
});

/* Api */
const getAccount = async (serviceAccountId: string) => {
    state.loading = true;
    try {
        let item;
        if (state.isTrustedAccount) {
            item = await SpaceConnector.clientV2.identity.trustedAccount.get<TrustedAccountGetParameters, TrustedAccountModel>({
                trusted_account_id: serviceAccountId,
            });
        } else {
            item = await SpaceConnector.clientV2.identity.serviceAccount.get<ServiceAccountGetParameters, ServiceAccountModel>({
                service_account_id: serviceAccountId,
            });
        }
        serviceAccountPageStore.$patch((_state) => {
            _state.state.serviceAccountItem = item;
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        serviceAccountPageStore.$patch((_state) => {
            _state.state.serviceAccountItem = {};
        });
    } finally {
        state.loading = false;
    }
};

/* Event */
const handleOpenDeleteModal = () => {
    state.deleteModalVisible = true;
};

const handleClickEditButton = () => {
    state.editModalVisible = true;
};
const handleRefresh = () => {
    if (props.serviceAccountId) getAccount(props.serviceAccountId);
};
const handleClickBackbutton = () => {
    router.push(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
    }));
};
watch(() => state.providerId, async (provider) => {
    serviceAccountPageStore.setProvider(provider ?? '');
    await serviceAccountSchemaStore.setProviderSchema(provider ?? '');
});
/* Watcher */
watch([() => props.serviceAccountId, () => state.editModalVisible], async ([serviceAccountId, updateVisible]) => {
    if (serviceAccountId && !updateVisible) {
        const serviceAccountType = (serviceAccountId?.startsWith('ta') ? ACCOUNT_TYPE.TRUSTED : ACCOUNT_TYPE.GENERAL);
        serviceAccountPageStore.$patch((_state) => {
            _state.state.serviceAccountType = serviceAccountType;
        });
        await getAccount(serviceAccountId);
    }
}, { immediate: true });

</script>

<template>
    <div class="service-account-detail-page">
        <p-heading :title="state.item.name"
                   show-back-button
                   class="page-title"
                   @click-back-button="handleClickBackbutton"
        >
            <template #title-left-extra>
                <p-lazy-img :src="state.providerIcon"
                            :loading="state.loading"
                            error-icon="ic_cloud-filled"
                />
            </template>
            <template v-if="!state.isManagedTrustedAccount || storeState.isAdminMode"
                      #title-right-extra
            >
                <div class="title-right-wrapper">
                    <p-icon-button name="ic_edit-text"
                                   class="w-full delete-button"
                                   @click="handleClickEditButton"
                    />
                    <p-icon-button name="ic_delete"
                                   class="w-full delete-button"
                                   @click="handleOpenDeleteModal"
                    />
                </div>
            </template>
            <template v-if="!state.isManagedTrustedAccount"
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
                                              :editable="!state.isManagedTrustedAccount"
                                              @refresh="handleRefresh"
            />
            <service-account-attached-general-accounts v-if="state.isTrustedAccount && props.serviceAccountId"
                                                       :service-account-id="props.serviceAccountId"
                                                       :attached-general-accounts.sync="state.attachedGeneralAccounts"
            />
            <service-account-connect-cluster v-if="state.isKubernetesAgentMode" />
            <service-account-credentials v-else
                                         :provider="state.providerKey"
                                         :service-account-loading="state.loading"
                                         :service-account-id="props.serviceAccountId"
                                         :service-account-type="state.serviceAccountType"
                                         :service-account-data="state.item"
                                         :project-id="state.projectId"
                                         :attached-trusted-account-id="state.attachedTrustedAccountId"
                                         :editable="!state.isManagedTrustedAccount"
                                         @refresh="handleRefresh"
            />
            <service-account-auto-sync v-if="state.isTrustedAccount"
                                       @refresh="handleRefresh"
            />
        </div>
        <service-account-delete-modal :visible.sync="state.deleteModalVisible"
                                      :service-account-type="state.serviceAccountType"
                                      :service-account-data="state.item"
                                      :attached-general-accounts="state.attachedGeneralAccounts"
        />
        <service-account-edit-modal v-if="state.item?.name"
                                    :visible.sync="state.editModalVisible"
                                    :is-trusted-account="state.isTrustedAccount"
                                    :service-account="state.item"
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
        .service-account-connect-cluster {
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
