<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import {
    PPaneLayout, PHeading, PButton, PEmpty, PDataLoader,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import ServiceAccountAddClusterModal from '@/services/asset-inventory/components/ServiceAccountAddClusterModal.vue';
import ServiceAccountConnectClusterDetail
    from '@/services/asset-inventory/components/ServiceAccountConnectClusterDetail.vue';
import { useServiceAccountAgentStore } from '@/services/asset-inventory/stores/service-account-agent-store';

interface Props {
    serviceAccountId: string;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
});
const serviceAccountAgentStore = useServiceAccountAgentStore();

const storeState = reactive({
    loading: computed(() => serviceAccountAgentStore.state.loading),
    isAgentCreated: computed(() => serviceAccountAgentStore.getters.isAgentCreated),
});

const state = reactive({
    title: computed(() => (storeState.isAgentCreated ? i18n.t('Connected Cluster') : i18n.t('Connect Cluster'))),
    connected: computed(() => true),
});

const modalState = reactive({
    addClusterModalVisible: false,
});

const handleOpenAddClusterModal = () => {
    modalState.addClusterModalVisible = true;
};

onMounted(async () => {
    await serviceAccountAgentStore.getAgent(props.serviceAccountId);
});

onUnmounted(() => {
    serviceAccountAgentStore.setAgentInfo(undefined);
});


</script>

<template>
    <p-pane-layout class="service-account-connect-cluster">
        <p-heading heading-type="sub"
                   :title="state.title"
        >
            <template #extra>
                <div v-if="storeState.isAgentCreated"
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
        <p-data-loader :loading="storeState.loading"
                       class="content-wrapper"
        >
            <service-account-connect-cluster-detail v-if="storeState.isAgentCreated" />
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
        </p-data-loader>
        <service-account-add-cluster-modal :visible.sync="modalState.addClusterModalVisible"
                                           :service-account-id="props.serviceAccountId"
        />
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
