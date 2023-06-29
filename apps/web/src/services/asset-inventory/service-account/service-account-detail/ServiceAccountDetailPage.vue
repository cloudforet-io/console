<script lang="ts" setup>
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PAnchor, PButton, PIconButton, PHeading, PLazyImg, PPaneLayout,
} from '@spaceone/design-system';
import { render } from 'ejs';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountAttachedGeneralAccounts
    from '@/services/asset-inventory/service-account/modules/ServiceAccountAttachedGeneralAccounts.vue';
import ServiceAccountBadge from '@/services/asset-inventory/service-account/modules/ServiceAccountBadge.vue';
import ServiceAccountBaseInformation
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformation.vue';
import ServiceAccountCredentials
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountProject from '@/services/asset-inventory/service-account/modules/ServiceAccountProject.vue';
import ServiceAccountDeleteModal
    from '@/services/asset-inventory/service-account/service-account-detail/modules/ServiceAccountDeleteModal.vue';
import type { ProviderModel, ServiceAccountModel } from '@/services/asset-inventory/service-account/type';

interface Props {
    serviceAccountId: string;
}

const props = defineProps<Props>();
const router = useRouter();
const store = useStore();
const { t } = useI18n();

const storeState = reactive({
    providerLoading: true,
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});
const state = reactive({
    loading: true,
    hasManagePermission: useManagePermissionState(),
    item: {} as ServiceAccountModel,
    attachedGeneralAccounts: [] as ServiceAccountModel[],
    attachedTrustedAccountId: computed(() => state.item.trusted_service_account_id),
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
    serviceAccountType: computed(() => state.item.service_account_type),
    deleteModalVisible: false,
    isManagedTrustedAccount: computed(() => state.item.tags?.is_managed === 'true'),
});

/* Api */
const getServiceAccount = async (serviceAccountId: string) => {
    try {
        state.loading = true;
        state.item = await SpaceConnector.client.identity.serviceAccount.get({
            service_account_id: serviceAccountId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.item = {};
    } finally {
        state.loading = false;
    }
};
const getProviderData = async (provider) => {
    try {
        state.providerData = await SpaceConnector.client.identity.provider.get({
            provider,
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
const handleChangeProject = () => {
    getServiceAccount(props.serviceAccountId);
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
                   @click-back-button="router.go(-1)"
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
                    <p-anchor :href="state.consoleLink">
                        {{ t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CONNECT_TO_CONSOLE') }}
                    </p-anchor>
                </p-button>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <p-pane-layout class="service-account-account-type">
                <p-heading heading-type="sub"
                           :title="t('PAGE_SCHEMA.SERVICE_ACCOUNT_TYPE')"
                />
                <div class="badge-wrapper">
                    <service-account-badge :account-type="state.item.service_account_type"
                                           :is-managed="state.isManagedTrustedAccount"
                    />
                </div>
            </p-pane-layout>
            <service-account-project :project-id="state.projectId"
                                     :service-account-loading="state.loading"
                                     :service-account-id="serviceAccountId"
                                     :service-account-type="state.serviceAccountType"
                                     :editable="state.hasManagePermission && state.serviceAccountType === ACCOUNT_TYPE.GENERAL"
                                     @change-project="handleChangeProject"
            />
            <service-account-attached-general-accounts v-if="item.service_account_type === ACCOUNT_TYPE.TRUSTED"
                                                       v-model:attached-general-accounts="state.attachedGeneralAccounts"
                                                       :service-account-id="serviceAccountId"
            />
            <service-account-base-information :provider="state.providerKey"
                                              :service-account-loading="state.loading"
                                              :service-account-id="serviceAccountId"
                                              :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                              @refresh="handleRefresh"
            />
            <service-account-credentials :provider="state.providerKey"
                                         :service-account-id="serviceAccountId"
                                         :service-account-type="state.serviceAccountType"
                                         :service-account-name="state.item.name"
                                         :project-id="state.projectId"
                                         :attached-trusted-account-id="state.attachedTrustedAccountId"
                                         :editable="state.hasManagePermission && !state.isManagedTrustedAccount"
                                         :has-manage-permission="state.hasManagePermission"
                                         @refresh="handleRefresh"
            />
        </div>
        <service-account-delete-modal v-model:visible="state.deleteModalVisible"
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
            /* custom design-system component - p-anchor */
            :deep(.p-anchor) {
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
