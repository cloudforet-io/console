<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PPaneLayout, PHeading, PButton, PEmpty,
} from '@spaceone/design-system';

import type { ServiceAccountModel } from '@/schema/identity/service-account/model';
import { i18n } from '@/translations';

import ServiceAccountAddClusterModal from '@/services/asset-inventory/components/ServiceAccountAddClusterModal.vue';
import ServiceAccountConnectClusterDetail
    from '@/services/asset-inventory/components/ServiceAccountConnectClusterDetail.vue';

interface Props {
    serviceAccountData: ServiceAccountModel;
    loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    serviceAccountData: undefined,
    loading: true,
});

const state = reactive({
    appCreated: computed(() => props.serviceAccountData?.app_id),
    title: computed(() => (state.appCreated ? i18n.t('Connected Cluster') : i18n.t('Connect Cluster'))),
    connected: computed(() => true),
});

const modalState = reactive({
    addClusterModalVisible: false,
});

const handleOpenAddClusterModal = () => {
    modalState.addClusterModalVisible = true;
};

</script>

<template>
    <p-pane-layout class="service-account-connect-cluster">
        <p-heading heading-type="sub"
                   :title="state.title"
        >
            <template #extra>
                <div v-if="state.appCreated"
                     class="button-wrapper"
                >
                    <p-button :icon-left="state.connected ? 'ic_plugs' : 'ic_plug-filled'"
                              style-type="tertiary"
                    >
                        {{ state.connected ? $t('Disconnect') : $t('Connect') }}
                    </p-button>
                    <p-button icon-left="ic_renew"
                              style-type="tertiary"
                    >
                        {{ $t('Regenerate') }}
                    </p-button>
                    <p-button icon-left="ic_delete"
                              style-type="tertiary"
                    >
                        {{ $t('Delete') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <div class="content-wrapper">
            <service-account-connect-cluster-detail v-if="state.appCreated"
                                                    :cluster-data="props.serviceAccountData"
            />
            <div v-else
                 class="not-been-connected-yet"
            >
                <p-empty class="empty-content"
                         show-image
                         show-button
                >
                    <template #image>
                        <img class="empty-image"
                             alt="empty-default-image"
                             src="@/assets/images/img_ghost_no-connection.png"
                        >
                    </template>
                    <p class="empty-text">
                        {{ $t('A cluster has not been connected yet.') }}
                    </p>
                    <template #button>
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  @click="handleOpenAddClusterModal"
                        >
                            {{ $t('Connect Cluster') }}
                        </p-button>
                    </template>
                </p-empty>
            </div>
        </div>
        <service-account-add-cluster-modal :visible.sync="modalState.addClusterModalVisible" />
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.service-account-connect-cluster {
    .button-wrapper {
        @apply flex gap-4;
    }
    .content-wrapper {
        min-height: 10rem;
        padding-top: 0.5rem;
        padding-bottom: 2.5rem;
        .service-account-credentials-form {
            padding-left: 1rem;
            padding-right: 1rem;
        }

        .button-wrapper {
            padding-left: 1rem;
            margin-top: 2rem;
        }

        .not-been-connected-yet {
            @apply flex flex-col items-center w-full;

            .empty-content {
                padding: 1.5rem 0;

                .empty-image {
                    opacity: 50%;
                }

                .empty-text {
                    @apply text-gray-300 text-paragraph-md;
                }
            }
        }
    }
}
</style>
