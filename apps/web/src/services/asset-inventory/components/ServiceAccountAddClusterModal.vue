<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PIconModal, PButton, PProgressBar, PFieldGroup, PTextInput, PI, PDataLoader, PSpinner, PLink, PDivider, PRadioGroup, PRadio, PCollapsibleToggle,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import type { AgentModel } from '@/schema/identity/agent/model';
import { i18n } from '@/translations';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { violet } from '@/styles/colors';

import ServiceAccountAddClusterScriptField from '@/services/asset-inventory/components/ServiceAccountAddClusterScriptField.vue';
import { OPEN_COST_OPTIONS } from '@/services/asset-inventory/constants/service-account-constant';
import { useServiceAccountAgentStore } from '@/services/asset-inventory/stores/service-account-agent-store';



interface Props {
    visible: boolean;
    serviceAccountId: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();
const serviceAccountAgentStore = useServiceAccountAgentStore();

const storeState = reactive({
    appToken: computed(() => serviceAccountAgentStore.getters.currentAppToken),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    step: 1,
    title: computed(() => {
        if (state.step === 1) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.FIRST_TITLE');
        if (state.step === 2) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SECOND_TITLE');
        if (state.step === 3) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.THIRD_TITLE');
        return '';
    }),
    clusterOptions: computed(() => [
        {
            label: 'Yes',
            value: true,
        },
        {
            label: 'No',
            value: false,
        },
    ]),
    guideCollapsed: true,
});

const formState = reactive({
    clusterName: '',
    selectedClusterOptions: {
        [OPEN_COST_OPTIONS.kube_state_metric]: undefined,
        [OPEN_COST_OPTIONS.prometheus_node_exporter]: undefined,
    },
    firstStepValid: computed(() => formState.clusterName.length > 0
        && formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metric] !== undefined
        && formState.selectedClusterOptions[OPEN_COST_OPTIONS.prometheus_node_exporter] !== undefined),
    commonValidForDelay: false,
    isValid: computed(() => {
        if (state.step === 1) return formState.firstStepValid;
        // TODO: apply loading state
        return true;
    }),
});

const scriptState = reactive({
    loading: false,
    optionGuideScript: computed<Record<string, string>>(() => ({
        [OPEN_COST_OPTIONS.kube_state_metric]: i18n.t('kubectl get daemonsets --all-namespaces | grep kube-state-metrics') as string,
        [OPEN_COST_OPTIONS.prometheus_node_exporter]: i18n.t('kubectl get daemonsets --all-namespaces | grep node-exporter') as string,
    })),
    helmScript: computed(() => ['helm version\n', 'helm repo add sp1-agent https://github.com.~\nhelm repo update sp1-agent\n']),
    thirdScript: computed(() => 'helm repo add sp1-agent https://github.com.~'
        + `\nhelm repo updacurl -H "Authorization: Bearer ${storeState.appToken}"`
        + '\n"https://extension/service-account/agent/kubernetes?service_account_id=sa-xxxx"'
        + '\n| helm upgrade -i sp1-agent spaceone-agent/k8s-monitoring -n '
        + '\nspaceone-agent --create-namespace -f -te sp1-agent\n'),
});


/* Event */
const handleClickContinueButton = async () => {
    if (!formState.commonValidForDelay) return;
    formState.commonValidForDelay = false;

    if (state.step === 1) {
        goStep();
    } else if (state.step === 2) {
        await createAgentApp();
    } else if (state.step === 3) {
        await serviceAccountAgentStore.getAgent(props.serviceAccountId);
        closeModal();
        state.step = 1;
    }
};
const handleClickCancelButton = () => {
    closeModal();
    goStep(0);
};
// const handleClickPreviousButton = () => {
//     goStep(-1);
// };
const handleEnterKey = () => {
    if (formState.isValid) handleClickContinueButton();
};
const handleSelectClusterOptions = (key: string, value: boolean) => {
    formState.selectedClusterOptions[key] = value;
};

/* Method */
const closeModal = () => {
    state.proxyVisible = false;
    emit('close');
};
const goStep = (n?: number) => {
    if (n === -1) state.step -= 1;
    else if (n) state.step = n;
    else state.step += 1;
};
const createAgentApp = async () => {
    scriptState.loading = true;
    const options: AgentModel['options'] = {
        cluster_name: formState.clusterName,
        ...formState.selectedClusterOptions,
    };
    try {
        await serviceAccountAgentStore.createAgent(props.serviceAccountId, options);
        goStep();
    } catch (e: any) {
        ErrorHandler.handleError(e);
        showErrorMessage(e.message, e);
        formState.commonValidForDelay = true;
    } finally {
        setTimeout(() => {
            scriptState.loading = false;
        }, 1000);
    }
};

watch(() => state.step, () => {
    setTimeout(() => {
        formState.commonValidForDelay = true;
    }, 1500);
}, { immediate: true });

</script>

<template>
    <p-icon-modal class="service-account-add-cluster-modal"
                  :visible.sync="state.proxyVisible"
                  icon-name="img_musly-navigating-kubernetes"
                  hide-button
    >
        <template #custom-header>
            <p class="title">
                {{ state.title }}
            </p>
        </template>
        <template #body>
            <div class="cluster-content-wrapper">
                <div class="add-cluster-form"
                     :class="{ 'third-section-form': state.step === 3 }"
                >
                    <p-progress-bar :percentage="(state.step/3)*100"
                                    :color="violet[400]"
                    />
                    <div v-if="state.step === 1"
                         class="first-section"
                    >
                        <p-field-group :label="$t('Cluster Name')"
                                       required
                        >
                            <p-text-input class="cluster-name-input"
                                          :value.sync="formState.clusterName"
                                          :placeholder="$t('Cluster Name')"
                                          @keyup.enter="handleEnterKey"
                            />
                        </p-field-group>

                        <div class="information">
                            <p-i class="info-icon"
                                 name="ic_info-circle"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <div class="description">
                                <p class="mb-2">
                                    {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.INFORMATION') }}
                                </p>
                                <p>
                                    {{ $t('Find out how Kubernetes cluster kubectl passes and modifies configuration information.') }}
                                </p>
                                <p-link :href="'https://kubernetes.io/docs/reference/kubectl/quick-reference/#kubectl-context-and-configuration'"
                                        highlight
                                        :action-icon="ACTION_ICON.EXTERNAL_LINK"
                                >
                                    {{ $t('Find out') }}
                                </p-link>
                            </div>
                        </div>
                        <p-divider class="divider" />
                        <p-field-group :label="$t('Checklist - before connecting cluster')"
                                       required
                        >
                            <div class="checklist-wrapper">
                                <div class="checklist">
                                    <span class="text">
                                        Is
                                        <span class="code">{{ OPEN_COST_OPTIONS.kube_state_metric }}</span>
                                        installed?
                                    </span>
                                    <p-radio-group>
                                        <p-radio v-for="(options, index) in state.clusterOptions"
                                                 :key="`${OPEN_COST_OPTIONS.kube_state_metric}-${index}`"
                                                 :selected="formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metric]"
                                                 :value="options.value"
                                                 @click="handleSelectClusterOptions(OPEN_COST_OPTIONS.kube_state_metric, options.value)"
                                        >
                                            {{ options.label }}
                                        </p-radio>
                                    </p-radio-group>
                                </div>
                                <div class="checklist">
                                    <span class="text">
                                        Is
                                        <span class="code">{{ OPEN_COST_OPTIONS.prometheus_node_exporter }}</span>
                                        installed?
                                    </span>
                                    <p-radio-group>
                                        <p-radio v-for="(options, index) in state.clusterOptions"
                                                 :key="`${OPEN_COST_OPTIONS.prometheus_node_exporter}-${index}`"
                                                 :selected="formState.selectedClusterOptions[OPEN_COST_OPTIONS.prometheus_node_exporter]"
                                                 :value="options.value"
                                                 @click="handleSelectClusterOptions(OPEN_COST_OPTIONS.prometheus_node_exporter, options.value)"
                                        >
                                            {{ options.label }}
                                        </p-radio>
                                    </p-radio-group>
                                </div>
                            </div>
                            <div class="lean-guide">
                                <div v-if="!state.guideCollapsed"
                                     class="guide-content"
                                >
                                    <service-account-add-cluster-script-field :script="scriptState.optionGuideScript[OPEN_COST_OPTIONS.kube_state_metric]"
                                                                              highlightingt-term="kube-state-metric"
                                                                              :description="$t('To find out the kube-state-metrics, enter the command below:')"
                                                                              script-height="3.5rem"
                                    />
                                    <service-account-add-cluster-script-field :script="scriptState.optionGuideScript[OPEN_COST_OPTIONS.prometheus_node_exporter]"
                                                                              highlightingt-term="prometheus-node-exporter"
                                                                              :description="$t('To find out the prometheus-node-exporter, enter the command below:')"
                                                                              script-height="3.5rem"
                                    />
                                </div>
                                <p-collapsible-toggle :is-collapsed.sync="state.guideCollapsed">
                                    {{ state.guideCollapsed ? $t('Learn how to find out') : $t('hide') }}
                                </p-collapsible-toggle>
                            </div>
                        </p-field-group>
                    </div>
                    <div v-else-if="state.step === 2"
                         class="second-section"
                    >
                        <div class="script-wrapper">
                            <service-account-add-cluster-script-field :script="scriptState.helmScript[0]"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_FIRST')"
                                                                      script-height="3.5rem"
                            />
                            <service-account-add-cluster-script-field :script="scriptState.helmScript[1]"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_SECOND')"
                                                                      script-height="5rem"
                            />
                        </div>
                    </div>
                    <div v-else-if="state.step === 3"
                         class="third-section"
                    >
                        <p-data-loader class="script-loader"
                                       :loading="scriptState.loading"
                                       :data="true"
                                       loader-backdrop-color="0"
                        >
                            <template #loader>
                                <div class="custom-loader">
                                    <p-spinner style-type="gray"
                                               size="xl"
                                    />
                                    <p>{{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.LOADING') }}</p>
                                </div>
                            </template>
                            <service-account-add-cluster-script-field class="generated-script"
                                                                      :script="scriptState.thirdScript"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_THIRD')"
                                                                      script-height="9.5rem"
                            />
                        </p-data-loader>
                    </div>
                </div>
                <div class="button-wrapper">
                    <p-button class="continue-button"
                              :style-type="state.step === 3 ? 'primary' : 'substitutive'"
                              :icon-right="state.step === 3 ? undefined :'ic_arrow-right'"
                              :disabled="!formState.isValid || !formState.commonValidForDelay || scriptState.loading"
                              @click="handleClickContinueButton"
                    >
                        {{ state.step === 3 ? $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.DONE_BUTTON') : $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CONTINUE_BUTTON') }}
                    </p-button>
                    <p-button v-if="state.step !== 3"
                              class="not-now-button"
                              style-type="transparent"
                              @click="handleClickCancelButton"
                    >
                        {{ $t('Cancel') }}
                    </p-button>
                </div>
            </div>
        </template>
    </p-icon-modal>
</template>

<style lang="postcss" scoped>
.service-account-add-cluster-modal {

    .title {
        @apply text-violet-500 text-display-md font-bold;
        margin: auto;
        text-align: center;
        white-space: pre-line;
    }

    .cluster-content-wrapper {
        text-align: left;

        .add-cluster-form {
            @apply bg-violet-100;
            height: 27.625rem;
            max-height: 27.625rem;
            margin-bottom: 1.5rem;
            overflow: scroll;
            border-radius: 0.375rem;
            &.third-section-form {
                height: 30.125rem;
                max-height: 30.125rem;
            }

            .first-section {
                padding: 1.625rem 1rem 1rem;

                .cluster-name-input {
                    @apply w-full;
                }

                .information {
                    @apply flex gap-2;
                    .info-icon {
                        min-width: 0.875rem;
                        margin-top: 0.25rem;
                    }
                    .description {
                        @apply text-paragraph-md text-gray-700;
                    }
                }
                .divider {
                    margin: 1rem 0;
                }
                .checklist-wrapper {
                    @apply flex flex-col gap-1;
                    margin-top: 0.5rem;
                    .checklist {
                        @apply flex justify-between items-center rounded-lg border border-gray-200 bg-white;
                        height: 2.8125rem;
                        padding: 0.75rem;

                        .text {
                            @apply text-label-md text-gray-900;
                        }
                        .code {
                            @apply text-code-md text-red-600 rounded bg-gray-100 border border-gray-200;
                            height: 1.3125rem;
                            padding: 0 0.375rem;
                            margin: 0 0.375rem;
                        }
                    }
                }
                .lean-guide {
                    margin-top: 0.75rem;
                }
            }
            .second-section {
                padding: 2.125rem 1rem 1.5rem;
                max-height: 23rem;
                height: 23rem;

                .script-wrapper {
                    padding-bottom: 1rem;
                }
            }
            .third-section {
                max-height: 23rem;

                .script-loader {
                    height: 23rem;
                    .custom-loader {
                        @apply flex flex-col items-center gap-3 text-paragraph-md text-gray-500;
                    }

                    .generated-script {
                        padding: 2.125rem 1rem 1.5rem;
                    }
                }
            }
        }

        .button-wrapper {
            @apply flex flex-col gap-2;

            .continue-button {
                height: 2.5rem;
            }
            .not-now-button {
                height: 2.5rem;
            }
        }
    }
}
</style>
