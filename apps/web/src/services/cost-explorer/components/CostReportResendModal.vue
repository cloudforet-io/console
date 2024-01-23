<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButtonModal, PDefinitionTable } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string[]): void;
}>();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    fields: computed(() => [
        { name: 'issueDate', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DATE'), disableCopy: true },
        { name: 'reportNumber', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_NUMBER'), disableCopy: true },
        { name: 'workspace', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE'), disableCopy: true },
        { name: 'cost', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.COST'), disableCopy: true },
        { name: 'recipients', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.RECIPIENTS'), disableCopy: true },
    ]),
    data: [],
});

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleConfirm = () => {
    state.proxyVisible = false;
};
</script>

<template>
    <p-button-modal :header-title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.RESEND_REPORT')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible="state.proxyVisible"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-definition-table :fields="state.fields"
                                :data="state.data"
                                :skeleton-rows="5"
            />
        </template>
        <template #confirm-button>
            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.RESEND') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
</style>
