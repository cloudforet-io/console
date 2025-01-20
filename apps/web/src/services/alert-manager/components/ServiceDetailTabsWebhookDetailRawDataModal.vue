<script setup lang="ts">
import { reactive } from 'vue';

import {
    PButtonModal, PCodeEditor, PButton,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { copyAnyData } from '@/lib/helper/copy-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useProxyValue } from '@/common/composables/proxy-state';

interface Props {
    visible: boolean;
    rawData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    rawData: undefined,
});

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
});

const handleCloseModal = () => {
    state.proxyVisible = false;
};
const handleClickCopy = () => {
    copyAnyData(props.rawData);
    showSuccessMessage(i18n.t('ALERT_MANAGER.COPIED'), '');
};
</script>

<template>
    <p-button-modal :header-title="$t('ALERT_MANAGER.WEBHOOK.ERROR_DETAILS')"
                    size="lg"
                    hide-footer-close-button
                    :visible.sync="state.proxyVisible"
                    class="alert-detail-tabs-timeline-modal"
                    @confirm="handleCloseModal"
    >
        <template #body>
            <div>
                <div class="data-content">
                    <p-code-editor :code="props.rawData"
                                   class="code-block"
                                   read-only
                                   folded
                    />
                </div>
            </div>
        </template>
        <template #footer-extra>
            <div class="footer-extra">
                <p-button style-type="tertiary"
                          icon-left="ic_copy"
                          @click="handleClickCopy"
                >
                    {{ $t('ALERT_MANAGER.COPY_ALL') }}
                </p-button>
            </div>
        </template>
        <template #confirm-button>
            {{ $t('ALERT_MANAGER.OK') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.alert-detail-tabs-timeline-modal {
    .filter-wrapper {
        @apply flex items-center gap-2;
        .divider {
            height: 1rem;
        }
        .action-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            .divider {
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
        }
    }
    .data-content {
        max-height: 20.68rem;
        .code-block {
            min-height: 100%;
        }
    }
}
</style>
