<template>
    <div class="service-account-detail-page">
        <p-page-title :title="item.name" child class="page-title"
                      @goBack="$router.go(-1)"
        >
            <template #title-left-extra>
                <p-lazy-img :src="providerIcon"
                            :loading="providerLoading"
                            error-icon="ic_provider_other"
                />
            </template>
            <template #title-right-extra>
                <div class="title-right-wrapper">
                    <p-icon-button name="ic_trashcan"
                                   class="w-full delete-button"
                                   :disabled="!hasManagePermission"
                                   @click="handleOpenDeleteModal"
                    />
                </div>
            </template>
            <template #extra>
                <p-button style-type="gray-border" :disabled="!consoleLink.length">
                    <p-anchor :href="consoleLink" :disabled="!consoleLink.length">
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.DETAIL.CONNECT_TO_CONSOLE') }}
                    </p-anchor>
                </p-button>
            </template>
        </p-page-title>
        <div class="content-wrapper">
            <!--            FIXME:: below <service-account-account-type /> should changed to badge-->
            <service-account-account-type />
            <service-account-project-detail :project-id="projectId" :service-account-item="item" />
            <service-account-attached-general-accounts v-if="item.service_account_type === ACCOUNT_TYPE.TRUSTED"
                                                       :service-account-id="serviceAccountId"
                                                       :attached-general-accounts.sync="attachedGeneralAccounts"
            />
            <service-account-base-information :provider="providerKey"
                                              :service-account-id="serviceAccountId"
            />
            <service-account-credentials :provider="providerKey"
                                         :service-account-id="serviceAccountId"
                                         :service-account-type="serviceAccountType"
            />
        </div>
        <p-double-check-modal :visible.sync="deleteModalVisible"
                              :header-title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE')"
                              :sub-title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_DESC', { account: item.name })"
                              :verification-text="item.name ? item.name : ''"
                              theme-color="alert"
                              size="sm"
                              @confirm="handleConfirmDelete"
        />
        <p-button-modal :visible.sync="cannotDeleteModalVisible"
                        :header-title="$t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.TITLE')"
                        theme-color="alert"
                        :hide-header-close-button="true"
        >
            <template #body>
                {{ $t('INVENTORY.SERVICE_ACCOUNT.DELETE_CHECK_MODAL.NOTE') }}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts">
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PAnchor, PButton, PIconButton, PPageTitle, PLazyImg, PDoubleCheckModal, PButtonModal,
} from '@spaceone/design-system';
import { render } from 'ejs';
import {
    computed, defineComponent, getCurrentInstance, reactive, toRefs, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { SpaceRouter } from '@/router';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { ACCOUNT_TYPE } from '@/services/asset-inventory/service-account/config';
import ServiceAccountAccountType
    from '@/services/asset-inventory/service-account/modules/ServiceAccountAccountType.vue';
import ServiceAccountAttachedGeneralAccounts
    from '@/services/asset-inventory/service-account/modules/ServiceAccountAttachedGeneralAccounts.vue';
import ServiceAccountBaseInformation
    from '@/services/asset-inventory/service-account/modules/ServiceAccountBaseInformation.vue';
import ServiceAccountCredentials
    from '@/services/asset-inventory/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountProjectDetail from '@/services/asset-inventory/service-account/service-account-detail/modules/ServiceAccountProjectDetail.vue';
import type { ProviderModel, ServiceAccountModel } from '@/services/asset-inventory/service-account/type';


export default defineComponent({
    name: 'ServiceAccountDetailPage',
    components: {
        ServiceAccountCredentials,
        ServiceAccountAttachedGeneralAccounts,
        ServiceAccountBaseInformation,
        ServiceAccountProjectDetail,
        ServiceAccountAccountType,
        PIconButton,
        PPageTitle,
        PButton,
        PAnchor,
        PLazyImg,
        PDoubleCheckModal,
        PButtonModal,
    },
    props: {
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const storeState = reactive({
            providerLoading: true,
            providers: computed(() => store.state.reference.provider.items),
        });
        const state = reactive({
            loading: true,
            hasManagePermission: useManagePermissionState(),
            item: {} as ServiceAccountModel,
            attachedGeneralAccounts: [] as ServiceAccountModel[],
            providerData: {} as ProviderModel,
            provider: computed(() => {
                if (!storeState.providerLoading && !state.loading) {
                    return storeState.providers[state.item?.provider] || undefined;
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
            cannotDeleteModalVisible: false,
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
        const deleteServiceAccount = async () => {
            try {
                await SpaceConnector.client.identity.serviceAccount.delete({
                    service_account_id: props.serviceAccountId,
                });
                showSuccessMessage(i18n.t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_DELETE_ACCOUNT'), '', vm.$root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'));
            } finally {
                state.deleteModalVisible = false;
            }
        };

        /* Event */
        const handleOpenDeleteModal = () => {
            if (state.serviceAccountType === ACCOUNT_TYPE.TRUSTED && state.attachedGeneralAccounts.length) {
                state.cannotDeleteModalVisible = true;
            } else {
                state.deleteModalVisible = true;
            }
        };
        const handleConfirmDelete = async () => {
            await deleteServiceAccount();
            await SpaceRouter.router.push({ name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME });
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
                await getProviderData(state.item?.provider);
            }
        }, { immediate: true });

        return {
            ...toRefs(state),
            ...toRefs(storeState),
            ACCOUNT_TYPE,
            handleOpenDeleteModal,
            handleConfirmDelete,
        };
    },
});
</script>

<style lang="postcss" scoped>
.service-account-detail-page {
    .title-right-wrapper {
        display: inline-flex;
    }
    .content-wrapper {
        @apply grid-cols-12;
        display: grid;
        gap: 1rem;
        .service-account-account-type {
            @apply col-span-6;
        }
        .service-account-project-detail {
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
}
</style>
