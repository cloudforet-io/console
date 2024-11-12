<script setup lang="ts">
import { reactive } from 'vue';

import {
    PButtonModal, PTextEditor,
} from '@cloudforet/mirinae';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { CostJobItem } from '@/services/cost-explorer/types/data-sources-type';

interface Props {
    modalVisible: boolean;
    selectedJobItem?: CostJobItem;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
    selectedJobItem: undefined,
});

const emit = defineEmits<{(e: 'update:modal-visible'): void }>();

const state = reactive({
    proxyVisible: useProxyValue('modalVisible', props, emit),
});
</script>

<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_TITLE')"
        centered
        size="md"
        fade
        backdrop
        hide-footer-close-button
        :visible.sync="state.proxyVisible"
        class="data-source-management-tab-data-collection-history-modal"
        @confirm="state.modalVisible = false"
    >
        <template #body>
            <div class="content">
                <p class="error-info">
                    {{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_CODE') }}:
                    <span class="error-code">
                        {{ props.selectedJobItem.error_code }}
                    </span>
                </p>
                <p-text-editor read-only
                               :code="props.selectedJobItem.error_message"
                />
            </div>
        </template>
        <template #confirm-button>
            <span>{{ $t('BILLING.COST_MANAGEMENT.DATA_SOURCES.ERROR_FOUND_OK') }}</span>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.data-source-management-tab-data-collection-history-modal {
    .content {
        @apply flex flex-col;
        padding-bottom: 0.75rem;
        gap: 1rem;
        .error-info {
            @apply flex items-center text-label-md font-bold;
            gap: 0.5rem;
            .error-code {
                @apply text-code-md text-red-600 font-normal bg-gray-100 border border-gray-200;
                padding-right: 0.375rem;
                padding-left: 0.375rem;
                border-radius: 0.25rem;
            }
        }
    }

    /* custom design-system component - p-text-editor */
    :deep(.p-text-editor) {
        .CodeMirror {
            border-radius: 0.375rem;
        }
    }
}
</style>

