<template>
    <div class="service-account-detail-page">
        <p-page-title :title="item.name" child class="page-title"
                      @goBack="$router.go(-1)"
        >
            <template #title-left-extra>
                <p-lazy-img class="icon" :src="providerIcon"
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
                        <!--song-lang-->
                        Connect to Console
                    </p-anchor>
                </p-button>
            </template>
        </p-page-title>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    PAnchor, PButton, PIconButton, PPageTitle, PLazyImg,
} from '@spaceone/design-system';
import { render } from 'ejs';

import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';


export default {
    name: 'ServiceAccountDetailPage',
    components: {
        PIconButton,
        PPageTitle,
        PButton,
        PAnchor,
        PLazyImg,
    },
    props: {
        serviceAccountId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const storeState = reactive({
            providerLoading: true,
            providers: computed(() => store.state.reference.provider.items),
        });
        const state = reactive({
            loading: true,
            hasManagePermission: useManagePermissionState(),
            deleteModalVisible: false,
            provider: computed(() => {
                if (!storeState.providerLoading && !state.loading) {
                    return storeState.providers[state.item?.provider] || undefined;
                }
                return undefined;
            }),
            item: {} as any,
            providerIcon: computed(() => state.provider?.icon),
            consoleLink: computed(() => {
                if (state.provider?.linkTemplate) return render(state.provider.linkTemplate, state.item);
                return '';
            }),
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

        /* Event */
        const handleOpenDeleteModal = () => {
            state.deleteModalVisible = true;
        };

        /* Init */
        (async () => {
            storeState.providerLoading = true;
            await store.dispatch('reference/provider/load');
            storeState.providerLoading = false;
        })();

        /* Watcher */
        watch(() => props.serviceAccountId, (serviceAccountId) => {
            if (serviceAccountId) getServiceAccount(serviceAccountId);
        }, { immediate: true });

        return {
            ...toRefs(state),
            ...toRefs(storeState),
            handleOpenDeleteModal,
        };
    },
};
</script>

<style lang="postcss" scoped>
.service-account-detail-page {
    .title-right-wrapper {
        display: inline-flex;
    }
}
</style>
