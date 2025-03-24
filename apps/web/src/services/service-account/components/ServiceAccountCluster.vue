<script setup lang="ts">
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import {
    PPaneLayout, PHeading, PButton, PEmpty, PDataLoader, PButtonModal, PDoubleCheckModal, PI, PHeadingLayout,
} from '@cloudforet/mirinae';

import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { i18n as _i18n } from '@/translations';

import { red } from '@/styles/colors';

import ServiceAccountAddClusterModal from '@/services/service-account/components/ServiceAccountAddClusterModal.vue';
import ServiceAccountAddClusterScriptField
    from '@/services/service-account/components/ServiceAccountAddClusterScriptField.vue';
import ServiceAccountClusterDetail
    from '@/services/service-account/components/ServiceAccountClusterDetail.vue';
import { useServiceAccountAgentStore } from '@/services/service-account/stores/service-account-agent-store';

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
    isClusterConnected: computed(() => serviceAccountAgentStore.getters.isClusterConnected),
    agentData: computed<AgentModel|undefined>(() => serviceAccountAgentStore.state.agentInfo),
});

const state = reactive({
    title: computed(() => (storeState.isAgentCreated ? _i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.CLUSTER_DETAIL_HEADER') : _i18n.t('INVENTORY.SERVICE_ACCOUNT.AGENT.CONNECT_CLUSTER_HEADER'))),
    isClusterActive: computed(() => (storeState.agentData?.state === 'ENABLED')),
});

const modalState = reactive({
    addClusterModalType: 'ADD' as 'ADD' | 'REGENERATE',
    addClusterModalVisible: false,
    connectionModalVisible: false,
    reconnectModalVisible: false,
    deleteClusterModalVislble: false,
    deleteAgentScript: computed(() => 'helm uninstall spaceone-agent -n spaceone-agent \nhelm repo remove spaceone-agent'),
});

const handleOpenAddClusterModal = () => {
    modalState.addClusterModalType = 'ADD';
    modalState.addClusterModalVisible = true;
};
const handleOpenClusterConnectionModal = () => {
    modalState.connectionModalVisible = true;
};
const handleOpenReconnectModal = () => {
    modalState.reconnectModalVisible = true;
};
const handleOpenRegenerateClusterModal = async () => {
    modalState.reconnectModalVisible = false;
    modalState.addClusterModalType = 'REGENERATE';
    modalState.addClusterModalVisible = true;
    await serviceAccountAgentStore.regenerateAgent(props.serviceAccountId);
};
const handleOpenDeleteClusterModal = () => {
    modalState.deleteClusterModalVislble = true;
};
const handleConfirmClusterConnection = async () => {
    if (state.isClusterActive) {
        await serviceAccountAgentStore.disableAgent(props.serviceAccountId);
    } else {
        await serviceAccountAgentStore.enableAgent(props.serviceAccountId);
    }
    modalState.connectionModalVisible = false;
};
const handleConfirmDeleteCluster = async () => {
    await serviceAccountAgentStore.deleteAgent(props.serviceAccountId);
    modalState.deleteClusterModalVislble = false;
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
        <p-heading-layout>
            <template #heading>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="state.title"
                />
            </template>
            <template #extra>
                <div class="h-full pt-8 px-4 pb-4">
                    <div v-if="storeState.isAgentCreated"
                         class="button-wrapper"
                    >
                        <p-button v-if="storeState.isClusterConnected"
                                  style-type="tertiary"
                                  @click="handleOpenClusterConnectionModal"
                        >
                            {{ state.isClusterActive ? $t('INVENTORY.SERVICE_ACCOUNT.AGENT.DEACTIVATE') : $t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVATE') }}
                        </p-button>
                        <p-button icon-left="ic_renew"
                                  style-type="tertiary"
                                  @click="handleOpenReconnectModal"
                        >
                            {{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.RECONNECT') }}
                        </p-button>
                        <p-button icon-left="ic_delete"
                                  style-type="tertiary"
                                  @click="handleOpenDeleteClusterModal"
                        >
                            {{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.DELETE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-heading-layout>

        <p-data-loader :loading="storeState.loading"
                       class="content-wrapper"
        >
            <service-account-cluster-detail v-if="storeState.isAgentCreated" />
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
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.DISCONNECTED_CLUSTER_TEXT') }}
                    </p>
                    <template #button>
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  @click="handleOpenAddClusterModal"
                        >
                            {{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.CONNECT_CLUSTER') }}
                        </p-button>
                    </template>
                </p-empty>
            </div>
        </p-data-loader>
        <service-account-add-cluster-modal :visible.sync="modalState.addClusterModalVisible"
                                           :type="modalState.addClusterModalType"
                                           :service-account-id="props.serviceAccountId"
                                           :add-cluster-modal-type="modalState.addClusterModalType"
        />
        <p-button-modal class="cluster-connection-modal"
                        size="sm"
                        :visible.sync="modalState.connectionModalVisible"
                        :theme-color="state.isClusterActive ? 'alert' : 'primary'"
                        :header-title="state.isClusterActive ? $t('INVENTORY.SERVICE_ACCOUNT.AGENT.DEACTIVATE_MODAL_TEXT') : $t('INVENTORY.SERVICE_ACCOUNT.AGENT.ACTIVATE_MODAL_TEXT')"
                        @confirm="handleConfirmClusterConnection"
        />
        <p-button-modal class="cluster-reconnect-modal"
                        size="sm"
                        :visible.sync="modalState.reconnectModalVisible"
                        theme-color="primary"
                        :header-title="$t('INVENTORY.SERVICE_ACCOUNT.AGENT.RECONNECT_TITLE')"
                        @confirm="handleOpenRegenerateClusterModal"
        >
            <template #body>
                <p class="reconnect-description">
                    <i18n path="INVENTORY.SERVICE_ACCOUNT.AGENT.RECONNECT_DESCRIPTION">
                        <template #cluster>
                            <strong>{{ storeState.agentData?.options?.cluster_name }}</strong>
                        </template>
                    </i18n>
                </p>
                <div class="reconnect-caution">
                    <p-i class="icon"
                         name="ic_error-filled"
                         width="1.25rem"
                         height="1.25rem"
                         :color="red[400]"
                    />
                    <p>{{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.RECONNECT_CAUTION') }}</p>
                </div>
            </template>
            <template #confirm-button>
                {{ $t('INVENTORY.SERVICE_ACCOUNT.AGENT.RECONNECT') }}
            </template>
        </p-button-modal>
        <p-double-check-modal class="cluster-delete-modal"
                              modal-size="md"
                              :visible.sync="modalState.deleteClusterModalVislble"
                              :header-title="$t('INVENTORY.SERVICE_ACCOUNT.AGENT.DELETE_CLUSTER_MODAL_TEXT')"
                              :verification-text="storeState.agentData?.options?.cluster_name"
                              @confirm="handleConfirmDeleteCluster"
        >
            <template #middle-contents>
                <service-account-add-cluster-script-field class="delete-agent-script"
                                                          :script="modalState.deleteAgentScript"
                                                          :description="$t('INVENTORY.SERVICE_ACCOUNT.AGENT.DELETE_AGENT_SCRIPT_DESCRIPTION')"
                                                          script-height="5rem"
                />
            </template>
        </p-double-check-modal>
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

    .cluster-reconnect-modal {
        .reconnect-description {
            @apply text-paragraph-lg text-gray-900;
            margin-bottom: 0.875rem;
        }
        .reconnect-caution {
            @apply text-paragraph-md text-gray-900 flex gap-1 rounded bg-red-100;
            padding: 0.625rem 1rem;
            .icon {
                min-width: 1.25rem;
            }
        }
    }
    .delete-agent-script {
        margin-bottom: 1.5rem;
    }
}
</style>
