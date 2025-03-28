<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import {
    PIconModal, PButton, PProgressBar, PFieldGroup, PTextInput, PI, PSpinner, PLink, PDivider, PRadioGroup, PRadio, PCollapsibleToggle,
} from '@cloudforet/mirinae';


import type { AgentModel } from '@/api-clients/identity/agent/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useFormValidator } from '@/common/composables/form-validator';
import { useProxyValue } from '@/common/composables/proxy-state';

import { red, violet } from '@/styles/colors';

import ServiceAccountAddClusterScriptField from '@/services/service-account/components/ServiceAccountAddClusterScriptField.vue';
import { OPEN_COST_OPTIONS } from '@/services/service-account/constants/service-account-constant';
import { useServiceAccountAgentStore } from '@/services/service-account/stores/service-account-agent-store';



interface Props {
    visible: boolean;
    serviceAccountId: string;
    addClusterModalType: 'ADD' | 'REGENERATE'
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    addClusterModalType: 'ADD',
});
const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();
const serviceAccountAgentStore = useServiceAccountAgentStore();
const userStore = useUserStore();

const storeState = reactive({
    appToken: computed(() => serviceAccountAgentStore.getters.currentAppToken),
    loading: computed(() => serviceAccountAgentStore.state.loading),
    language: computed<string|undefined>(() => userStore.state.language),
});

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    step: 1,
    title: computed(() => {
        if (state.step === 1) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.FIRST_TITLE');
        if (state.step === 2) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SECOND_TITLE');
        if (state.step === 3) {
            return props.addClusterModalType === 'ADD'
                ? i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.THIRD_TITLE') : i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.THIRD_TITLE_RECONNECT');
        }
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
        [OPEN_COST_OPTIONS.kube_state_metrics]: undefined,
        [OPEN_COST_OPTIONS.prometheus_node_exporter]: undefined,
    },
    firstStepValid: computed(() => !invalidState.clusterName && invalidState.clusterName !== undefined
            && formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metrics] !== undefined
            && formState.selectedClusterOptions[OPEN_COST_OPTIONS.prometheus_node_exporter] !== undefined),
    commonValidForDelay: false,
    isValid: computed(() => {
        if (state.step === 1) return formState.firstStepValid;
        // TODO: apply loading state
        return true;
    }),
});

const {
    forms: { clusterName },
    invalidState,
    invalidTexts,
    setForm,
} = useFormValidator({
    clusterName: formState.clusterName,
}, {
    clusterName: (val: string) => {
        if (val?.length < 2) {
            return i18n.t('IDENTITY.SERVICE_ACCOUNT.ADD.NAME_INVALID');
        }
        return true;
    },
});

const scriptState = reactive({
    endPoint: computed(() => config.get('CONSOLE_API_V2.ENDPOINT')),
    optionGuideScript: computed<Record<string, string>>(() => ({
        [OPEN_COST_OPTIONS.kube_state_metrics]: 'kubectl get deployments --all-namespaces | grep kube-state-metrics',
        [OPEN_COST_OPTIONS.prometheus_node_exporter]: 'kubectl get daemonsets --all-namespaces | grep node-exporter',
    })),
    helmScript: computed(() => ['helm version\n', 'helm repo add spaceone-agent https://cloudforet-io.github.io/charts\nhelm repo update spaceone-agent']),
    thirdScript: computed(() => "curl -X 'GET' \\\n"
        + `  '${scriptState.endPoint}/console-api/extension/agent/kubernetes?service_account_id=${props.serviceAccountId}' \\\n`
        + "  -H 'accept: application/json' \\\n"
        + `  -H 'Authorization: Bearer ${storeState.appToken}' > agent.yaml && \\\n`
        + '  helm upgrade -i spaceone-agent spaceone-agent/k8s-monitoring -n spaceone-agent --create-namespace -f agent.yaml && \\\n'
        + '  rm agent.yaml'),
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

const handleEnterKey = () => {
    if (formState.isValid) handleClickContinueButton();
};
const handleSelectClusterOptions = (key: string, value: boolean) => {
    formState.selectedClusterOptions[key] = value;
};

/* Method */
const closeModal = () => {
    setForm('clusterName', undefined);
    formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metrics] = undefined;
    formState.selectedClusterOptions[OPEN_COST_OPTIONS.prometheus_node_exporter] = undefined;
    state.proxyVisible = false;
    emit('close');
};
const goStep = (n?: number) => {
    if (n === -1) state.step -= 1;
    else if (n) state.step = n;
    else state.step += 1;
};
const createAgentApp = async () => {
    const options: AgentModel['options'] = {
        cluster_name: clusterName.value,
        kube_state_metrics: formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metrics],
        prometheus_node_exporter: formState.selectedClusterOptions[OPEN_COST_OPTIONS.prometheus_node_exporter],
    };
    try {
        await serviceAccountAgentStore.createAgent(props.serviceAccountId, options);
        goStep();
    } catch (e: any) {
        ErrorHandler.handleError(e);
        showErrorMessage(e.message, e);
        formState.commonValidForDelay = true;
    }
};

watch(() => state.step, () => {
    setTimeout(() => {
        formState.commonValidForDelay = true;
    }, 1500);
}, { immediate: true });

watch(() => props.visible, (visible) => {
    if (visible) {
        if (props.addClusterModalType === 'ADD') state.step = 1;
        if (props.addClusterModalType === 'REGENERATE') state.step = 3;
    }
});

</script>

<template>
    <p-icon-modal class="service-account-add-cluster-modal"
                  :visible.sync="state.proxyVisible"
                  icon-name="img_musly-navigating-kubernetes"
    >
        <template #custom-header>
            <p class="title">
                {{ state.title }}
            </p>
        </template>
        <template #body>
            <div :class="{ 'add-cluster-form': true, 'third-section-form': state.step === 3 }">
                <p-progress-bar :percentage="(state.step/3)*100"
                                :color="violet[400]"
                />
                <div v-if="state.step === 1"
                     class="first-section"
                >
                    <p-field-group :label="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CLUSTER_NAME')"
                                   :invalid="invalidState.clusterName"
                                   :invalid-text="invalidTexts.clusterName"
                                   required
                    >
                        <template #default="{invalid}">
                            <p-text-input class="cluster-name-input"
                                          :value="clusterName"
                                          :invalid="invalid"
                                          :placeholder="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CLUSTER_NAME')"
                                          @keyup.enter="handleEnterKey"
                                          @update:value="setForm('clusterName', $event)"
                            />
                        </template>
                    </p-field-group>

                    <div class="information">
                        <p-i class="info-icon"
                             name="ic_info-circle"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <div class="description">
                            <p class="mb-2">
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CLUSTER_NAME_INFORMATION') }}
                            </p>
                            <p>
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.FIND_OUT_INFORMATION') }}
                            </p>
                            <p-link :href="'https://kubernetes.io/docs/reference/kubectl/quick-reference/#kubectl-context-and-configuration'"
                                    highlight
                                    action-icon="external-link"
                            >
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.FIND_OUT') }}
                            </p-link>
                        </div>
                    </div>
                    <p-divider class="divider" />
                    <p-field-group :label="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CHECKLIST_OPTION_LABEL')"
                                   required
                    >
                        <div class="checklist-wrapper">
                            <div class="checklist">
                                <span class="text">
                                    Is
                                    <span class="code">{{ OPEN_COST_OPTIONS.kube_state_metrics }}</span>
                                    installed?
                                </span>
                                <p-radio-group>
                                    <p-radio v-for="(options, index) in state.clusterOptions"
                                             :key="`${OPEN_COST_OPTIONS.kube_state_metrics}-${index}`"
                                             :selected="formState.selectedClusterOptions[OPEN_COST_OPTIONS.kube_state_metrics]"
                                             :value="options.value"
                                             @click="handleSelectClusterOptions(OPEN_COST_OPTIONS.kube_state_metrics, options.value)"
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
                    </p-field-group>
                    <div class="information">
                        <p-i class="info-icon"
                             name="ic_info-circle"
                             width="0.875rem"
                             height="0.875rem"
                        />
                        <div class="description">
                            <p>
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CONFLICT_INFO') }}
                            </p>
                            <p-link :href="`https://cloudforet.io/${storeState.language}/docs/guides/account-hierarchy/kubernetes`"
                                    highlight
                                    action-icon="external-link"
                            >
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.LEARN_MORE') }}
                            </p-link>
                        </div>
                    </div>
                    <p-divider class="divider second" />
                    <div class="lean-guide">
                        <div v-if="!state.guideCollapsed"
                             class="guide-content"
                        >
                            <service-account-add-cluster-script-field :script="scriptState.optionGuideScript[OPEN_COST_OPTIONS.kube_state_metrics]"
                                                                      highlightingt-term="kube-state-metric"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.KUBE_STATE_METRIC_SCRIPT_GUIDE')"
                                                                      script-height="3.5rem"
                            />
                            <service-account-add-cluster-script-field :script="scriptState.optionGuideScript[OPEN_COST_OPTIONS.prometheus_node_exporter]"
                                                                      highlightingt-term="prometheus-node-exporter"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.PROMETHEUS_NODE_EXPORTER_SCRIPT_GUIDE')"
                                                                      script-height="3.5rem"
                            />
                        </div>
                        <p-collapsible-toggle :is-collapsed.sync="state.guideCollapsed">
                            {{
                                state.guideCollapsed ?
                                    $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.OPTIONS_SCRIPT_TOGGLE_OPEN_TEXT')
                                    : $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.OPTIONS_SCRIPT_TOGGLE_CLOSE_TEXT')
                            }}
                        </p-collapsible-toggle>
                    </div>
                </div>
                <div v-else-if="state.step === 2"
                     class="second-section"
                >
                    <div class="script-wrapper">
                        <!--                        <service-account-add-cluster-script-field :script="scriptState.helmScript[0]"-->
                        <!--                                                                  :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_FIRST')"-->
                        <!--                                                                  script-height="3.5rem"-->
                        <!--                        />-->
                        <service-account-add-cluster-script-field :script="scriptState.helmScript[1]"
                                                                  :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_SECOND')"
                                                                  script-height="5rem"
                        />
                    </div>
                    <div class="create-agent-warning-contents">
                        <p-i class="warning-icon"
                             name="ic_error-filled"
                             :color="red[400]"
                        />
                        <p class="warning-text">
                            {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CONNECT_CLUSTER_WARNING') }}
                        </p>
                    </div>
                </div>
                <div v-else-if="state.step === 3"
                     class="third-section"
                >
                    <div class="script-wrapper">
                        <div v-if="storeState.loading"
                             class="loader"
                        >
                            <p-spinner style-type="gray"
                                       size="xl"
                            />
                            <p>{{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.LOADING') }}</p>
                        </div>
                        <service-account-add-cluster-script-field v-else
                                                                  class="generated-script"
                                                                  :script="scriptState.thirdScript"
                                                                  :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_THIRD')"
                                                                  script-height="9.5rem"
                        />
                    </div>
                </div>
            </div>
        </template>
        <template #custom-button>
            <div class="button-wrapper">
                <p-button class="continue-button"
                          :style-type="state.step === 3 ? 'primary' : 'substitutive'"
                          :icon-right="state.step === 3 ? undefined :'ic_arrow-right'"
                          :disabled="!formState.isValid || !formState.commonValidForDelay || storeState.loading"
                          @click="handleClickContinueButton"
                >
                    {{ state.step === 3 ? $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.DONE_BUTTON') : $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CONTINUE_BUTTON') }}
                </p-button>
                <p-button v-if="state.step !== 3"
                          class="not-now-button"
                          style-type="transparent"
                          @click="handleClickCancelButton"
                >
                    {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CANCEL') }}
                </p-button>
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

    .add-cluster-form {
        @apply bg-violet-100 flex-shrink;
        text-align: left;
        height: 27.625rem;
        max-height: calc(100vh - 28.125rem);
        overflow: scroll;
        border-radius: 0.375rem;
        &.third-section-form {
            height: 30.125rem;
            max-height: calc(100vh - 25.625rem);
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

                &.second {
                    margin: 0.75rem 0;
                }
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

            .create-agent-warning-contents {
                @apply w-full bg-red-100 flex gap-1 rounded;
                padding: 0.625rem 1rem;

                .warning-text {
                    @apply text-paragraph-md text-gray-900;
                }
            }
        }
        .third-section {
            max-height: 23rem;

            .script-wrapper {
                height: 23rem;
                .loader {
                    @apply flex flex-col items-center justify-center gap-3 text-paragraph-md text-gray-500 h-full;
                }

                .generated-script {
                    padding: 2.125rem 1rem 1.5rem;
                }
            }
        }
    }

    .button-wrapper {
        @apply flex flex-col gap-2;
        min-height: 7rem;
        padding-top: 1.5rem;

        .continue-button {
            height: 2.5rem;
        }
        .not-now-button {
            height: 2.5rem;
        }
    }
}
</style>
