<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PButtonModal, PDefinitionTable } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { CostReportSendParameters } from '@/schema/cost-analysis/cost-report/api-verbs/send';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';

interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string[]): void;
}>();

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    item: computed(() => costReportPageState.reportItem),
    fields: computed(() => [
        { name: 'issue_date', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DATE'), disableCopy: true },
        { name: 'cost_report_number', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_NUMBER'), disableCopy: true },
        { name: 'workspace_name', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE'), disableCopy: true },
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
    postCostReportsResend();
    state.proxyVisible = false;
};

/* API */
const postCostReportsResend = async (): Promise<void> => {
    state.loading = true;
    try {
        await SpaceConnector.clientV2.costAnalysis.costReport.send<CostReportSendParameters>({
            cost_report_id: state.item.cost_report_id,
        });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_RESEND_REPORT'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_E_RESEND_REPORT'));
    } finally {
        state.loading = false;
    }
};

</script>

<template>
    <p-button-modal :header-title="$t('BILLING.COST_MANAGEMENT.COST_REPORT.RESEND_REPORT')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :loading="state.loading"
                    :visible="state.proxyVisible"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-definition-table :fields="state.fields"
                                :data="state.item"
                                :skeleton-rows="5"
            >
                <template #data-cost="{value}">
                    <span class="currency-symbol">{{ CURRENCY_SYMBOL[state.item.currency] }}</span>
                    <span class="text"> {{ numberFormatter(value[state.item.currency]) }}</span>
                    <span class="currency-text"> ({{ state.item.currency }})</span>
                </template>
            </p-definition-table>
        </template>
        <template #confirm-button>
            {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.RESEND') }}
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-definition */
:deep(.p-definition) {
    .key {
        min-width: 9rem;
    }
}
</style>
