<script setup lang="ts">
import { reactive } from 'vue';

import {
    PIconModal, PButton, PProgressBar, PFieldGroup, PTextInput, PI,
} from '@spaceone/design-system';

import { useProxyValue } from '@/common/composables/proxy-state';

import { violet } from '@/styles/colors';

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
    clusterName: '',
});

// const handleClickButton = () => {
//     state.proxyVisible = false;
//     emit('close');
// };

</script>

<template>
    <p-icon-modal class="service-account-add-cluster-modal"
                  :visible.sync="state.proxyVisible"
                  icon-name="img_musly-navigating-kubernetes"
                  disable-button
    >
        <template #custom-header>
            <p class="title">
                {{ $t('INVENTORY.SERVICE_ACCOUNT.CLUSTER_MODAL.TITLE') }}
            </p>
        </template>
        <template #body>
            <div class="cluster-content-wrapper">
                <div class="add-cluster-form">
                    <p-progress-bar class="progress-bar"
                                    :percentage="100/3"
                                    :color="violet[400]"
                    />
                    <div class="first-section">
                        <p-field-group :label="$t('Kubernetes Cluster Name')"
                                       required
                        >
                            <p-text-input class="cluster-name-input"
                                          :value.sync="state.clusterName"
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
                </div>
                <div class="button-wrapper">
                    <p-button class="continue-button"
                              icon-right="ic_arrow-right"
                    >
                        Continue
                    </p-button>
                    <p-button style-type="transparent">
                        Not now
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
        width: 19.625rem;
        margin: auto;
        text-align: center;
        white-space: pre-line;
    }

    .cluster-content-wrapper {
        text-align: left;

        .add-cluster-form {
            @apply relative bg-violet-100 rounded;
            height: 20.875rem;
            margin-bottom: 1.5rem;

            .progress-bar {
                @apply absolute top-0;
            }

            .first-section {
                padding: 2.5rem 1rem;

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
        }

        .button-wrapper {
            @apply flex flex-col gap-2;
            .continue-button {
                @apply bg-violet-400;
            }
        }
    }
}
</style>
