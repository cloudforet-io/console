<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PIconModal, PButton, PProgressBar, PFieldGroup, PTextInput, PI, PTextButton,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';

import { violet } from '@/styles/colors';

import ServiceAccountAddClusterScriptField from '@/services/asset-inventory/components/ServiceAccountAddClusterScriptField.vue';

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible'): void;
    (e: 'close'): void;
}>();


const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    step: 1,
    title: computed(() => {
        if (state.step === 1) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.FIRST_TITLE');
        if (state.step === 2) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SECOND_TITLE');
        if (state.step === 3) return i18n.t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.THIRD_TITLE');
        return '';
    }),
});

const formState = reactive({
    clusterName: '',
    firstStepValid: computed(() => formState.clusterName.length > 0),
    commonValidForDelay: false,
    isValid: computed(() => {
        if (state.step === 1) return formState.firstStepValid;
        // TODO: apply loading state
        return true;
    }),
});

const scriptState = reactive({
    firstScript: computed(() => 'helm version\n'),
    secondScript: computed(() => 'helm repo add sp1-agent https://github.com.~\nhelm repo update sp1-agent\n'),
});


/* Event */
const handleClickContinueButton = () => {
    if (!formState.commonValidForDelay) return;
    formState.commonValidForDelay = false;

    if (state.step === 1) {
        goStep();
    } else if (state.step === 2) {
        // TODO: Generate API key
        // TODO: Generate Script
        // TODO: Generate App Name
        goStep();
    } else if (state.step === 3) {
        // TODO: Do something
        closeModal();
        state.step = 1;
    }
};
const handleClickNotNowButton = () => {
    closeModal();
};
const handleClickPreviousButton = () => {
    goStep(-1);
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
                <div class="add-cluster-form">
                    <p-progress-bar :percentage="(state.step/3)*100"
                                    :color="violet[400]"
                    />
                    <div v-if="state.step === 1"
                         class="first-section"
                    >
                        <p-field-group :label="$t('Kubernetes Cluster Name')"
                                       required
                        >
                            <p-text-input class="cluster-name-input"
                                          :value.sync="formState.clusterName"
                                          :placeholder="$t('Cluster Name')"
                            />
                        </p-field-group>

                        <div class="information">
                            <p-i class="info-icon"
                                 name="ic_info-circle"
                                 width="0.875rem"
                                 height="0.875rem"
                            />
                            <span class="description">
                                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.INFORMATION') }}
                            </span>
                        </div>
                    </div>
                    <div v-else-if="state.step === 2"
                         class="second-section"
                    >
                        <div class="script-wrapper">
                            <service-account-add-cluster-script-field :script="scriptState.firstScript"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_FIRST')"
                                                                      script-height="3.5rem"
                            />
                            <service-account-add-cluster-script-field :script="scriptState.secondScript"
                                                                      :description="$t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.SCRIPT_GUIDE_SECOND')"
                                                                      script-height="5rem"
                            />
                        </div>
                        <p-text-button class="previous-button"
                                       style-type="highlight"
                                       icon-left="ic_arrow-left"
                                       @click="handleClickPreviousButton"
                        >
                            {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.PREVIOUS_BUTTON') }}
                        </p-text-button>
                    </div>
                </div>
                <div class="button-wrapper">
                    <p-button :style-type="state.step === 3 ? 'primary' : 'substitutive'"
                              :icon-right="state.step === 3 ? undefined :'ic_arrow-right'"
                              :disabled="!formState.isValid || !formState.commonValidForDelay"
                              @click="handleClickContinueButton"
                    >
                        {{ state.step === 3 ? $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.DONE_BUTTON') : $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.CONTINUE_BUTTON') }}
                    </p-button>
                    <p-button v-if="state.step === 1"
                              style-type="transparent"
                              @click="handleClickNotNowButton"
                    >
                        {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.NOT_NOW_BUTTON') }}
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
            min-height: 20.875rem;
            margin-bottom: 1.5rem;
            overflow: hidden;
            border-radius: 0.375rem;

            .first-section {
                padding: 2.125rem 1rem 2.5rem;

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
            }
            .second-section {
                padding: 2.125rem 1rem 1.5rem;
                .script-wrapper {
                    padding-bottom: 1rem;
                }
            }
        }

        .button-wrapper {
            @apply flex flex-col gap-2;
        }
    }
}
</style>
