<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { render } from 'ejs';
import { clone } from 'lodash';

import {
    PLink, PButton, PIconButton, PHeading, PLazyImg, PHeadingLayout,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { ACCOUNT_TYPE } from '@/api-clients/identity/service-account/schema/constant';
import type { ServiceAccountModel } from '@/api-clients/identity/service-account/schema/model';
import type { TrustedAccountModel } from '@/api-clients/identity/trusted-account/schema/model';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import ServiceAccountAttachedGeneralAccounts
    from '@/services/service-account/components/ServiceAccountAttachedGeneralAccounts.vue';
import ServiceAccountAutoSync from '@/services/service-account/components/ServiceAccountAutoSync.vue';
import ServiceAccountBaseInformation
    from '@/services/service-account/components/ServiceAccountBaseInformation.vue';
import ServiceAccountCluster from '@/services/service-account/components/ServiceAccountCluster.vue';
import ServiceAccountCredentials
    from '@/services/service-account/components/ServiceAccountCredentials.vue';
import ServiceAccountDeleteModal
    from '@/services/service-account/components/ServiceAccountDeleteModal.vue';
import ServiceAccountEditModal from '@/services/service-account/components/ServiceAccountEditModal.vue';
import { useServiceAccountDetail } from '@/services/service-account/composables/use-service-account-detail';
import { useServiceAccountProviderSchema } from '@/services/service-account/composables/use-service-account-provider-schema';
import { ADMIN_SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/admin/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { useServiceAccountPageStore } from '@/services/service-account/stores/service-account-page-store';
import { useServiceAccountSchemaStore } from '@/services/service-account/stores/service-account-schema-store';


const router = useRouter();

const props = defineProps<{
    serviceAccountId: string;
}>();

const serviceAccountSchemaStore = useServiceAccountSchemaStore();
const serviceAccountPageStore = useServiceAccountPageStore();
const appContextStore = useAppContextStore();
const authorizationStore = useAuthorizationStore();

const route = useRoute();

const referenceMap = useAllReferenceDataModel();

const {
    serviceAccountData,
    isLoading,
    refetch,
    isTrustedAccount,
} = useServiceAccountDetail({
    serviceAccountId: computed(() => props.serviceAccountId),
});

const {
    generalAccountSchema,
    trustedAccountSchema,
} = useServiceAccountProviderSchema();

const storeState = reactive({
    providerExternalLink: computed(() => (state.serviceAccountType === ACCOUNT_TYPE.TRUSTED
        ? trustedAccountSchema.value?.options?.external_link
        : generalAccountSchema.value?.options?.external_link)),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceMember: computed(() => authorizationStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_MEMBER),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => authorizationStore.getters.pageAccessPermissionMap[state.selectedMenuId]?.write),
    serviceAccountType: computed(() => serviceAccountPageStore.state.serviceAccountType),
    attachedGeneralAccounts: [] as ServiceAccountModel[],
    providerId: computed(() => serviceAccountData.value?.provider),
    provider: computed(() => {
        if (!isLoading.value) {
            return referenceMap.provider[state.providerId] || undefined;
        }
        return undefined;
    }),
    providerKey: computed(() => state.provider?.key),
    providerIcon: computed(() => state.provider?.icon),
    isKubernetesAgentMode: computed(() => state.providerKey === 'kubernetes'),
    consoleLink: computed(() => {
        try {
            if (storeState.providerExternalLink) return render(storeState.providerExternalLink, serviceAccountData.value);
        } catch (e) {
            console.warn('Failed to render external link. Please check the accountID value.');
            return '';
        }
        return '';
    }),
    deleteModalVisible: false,
    editModalVisible: false,
    isManagedTrustedAccount: computed(() => (serviceAccountData.value as TrustedAccountModel)?.workspace_id === '*'),
    isEditable: computed<boolean>(() => state.hasReadWriteAccess && (!state.isManagedTrustedAccount || storeState.isAdminMode)),
});

/* Event */
const handleOpenDeleteModal = () => {
    state.deleteModalVisible = true;
};

const handleClickEditButton = () => {
    state.editModalVisible = true;
};
const handleRefresh = () => {
    if (!props.serviceAccountId) return;
    refetch();
};
const handleClickBackbutton = () => {
    router.push({
        name: storeState.isAdminMode ? ADMIN_SERVICE_ACCOUNT_ROUTE._NAME : SERVICE_ACCOUNT_ROUTE._NAME, query: { provider: state.providerKey },
    }).catch(() => {});
};

watch(() => state.providerId, async (providerId) => {
    serviceAccountPageStore.setProvider(providerId ?? '');
    serviceAccountSchemaStore.setCurrentProvider(providerId ?? '');
});
/* Watcher */
watch(() => props.serviceAccountId, async (serviceAccountId) => {
    if (serviceAccountId) {
        const serviceAccountType = (serviceAccountId?.startsWith('ta') ? ACCOUNT_TYPE.TRUSTED : ACCOUNT_TYPE.GENERAL);
        serviceAccountPageStore.setServiceAccountType(serviceAccountType);
    }
}, { immediate: true });

watch([
    () => props.serviceAccountId,
    () => serviceAccountData.value,
], ([, serviceAccount]) => {
    if (!props.serviceAccountId || !serviceAccount) return;
    serviceAccountPageStore.setOriginServiceAccountItem(serviceAccount);
}, { immediate: true });

</script>

<template>
    <div class="service-account-detail-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="serviceAccountData?.name ?? ''"
                           show-back-button
                           class="page-title"
                           @click-back-button="handleClickBackbutton"
                >
                    <template #title-left-extra>
                        <p-lazy-img :src="state.providerIcon"
                                    :loading="isLoading"
                                    error-icon="ic_cloud-filled"
                        />
                    </template>
                    <template v-if="state.isEditable"
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
                </p-heading>
            </template>
            <template v-if="state.isEditable && state.consoleLink"
                      #extra
            >
                <p-button style-type="tertiary"
                          class="link-button"
                >
                    <p-link :href="state.consoleLink"
                            action-icon="external-link"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CONNECT_TO_CONSOLE') }}
                    </p-link>
                </p-button>
            </template>
        </p-heading-layout>
        <div class="content-wrapper">
            <service-account-base-information :service-account-loading="isLoading"
                                              :service-account-id="props.serviceAccountId"
                                              :editable="state.isEditable"
                                              @refresh="handleRefresh"
            />
            <service-account-attached-general-accounts v-if="isTrustedAccount && props.serviceAccountId"
                                                       :service-account-id="props.serviceAccountId"
                                                       :attached-general-accounts.sync="state.attachedGeneralAccounts"
                                                       :has-read-write-access="state.hasReadWriteAccess"
            />
            <service-account-cluster v-if="state.isKubernetesAgentMode"
                                     :service-account-id="props.serviceAccountId"
            />
            <service-account-credentials v-else
                                         :service-account-id="props.serviceAccountId"
                                         :editable="state.isEditable"
                                         @refresh="handleRefresh"
            />
            <service-account-auto-sync v-if="isTrustedAccount && serviceAccountPageStore.getters.isMainProvider"
                                       :service-account-id="props.serviceAccountId"
                                       :editable="state.isEditable"
                                       @refresh="handleRefresh"
            />
            <!--            TODO: To be implemented after further discussion-->
            <!--            <service-account-usage-overview v-if="!state.isTrustedAccount"-->
            <!--                                            :service-account-loading="state.loading"-->
            <!--                                            :service-account-id="props.serviceAccountId"-->
            <!--            />-->
        </div>
        <service-account-delete-modal :visible.sync="state.deleteModalVisible"
                                      :service-account-id="props.serviceAccountId"
                                      :attached-general-accounts="state.attachedGeneralAccounts"
                                      :is-agent-mode="state.isKubernetesAgentMode"
        />
        <service-account-edit-modal v-if="serviceAccountData?.name ?? ''"
                                    :key="serviceAccountData?.name ?? ''"
                                    :service-account-id="props.serviceAccountId"
                                    :visible.sync="state.editModalVisible"
                                    :is-trusted-account="isTrustedAccount"
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
        .service-account-usage-overview {
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
