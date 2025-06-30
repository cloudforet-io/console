<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PDefinitionTable, PLink } from '@cloudforet/mirinae';

import { useCostReportApi } from '@/api-clients/cost-analysis/cost-report/composables/use-cost-report-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/display/constant';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useCostReportGetQuery } from '@/services/cost-explorer/composables/use-cost-report-get-query';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


interface Props {
    visible: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;
const { costReportAPI } = useCostReportApi();

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm', value: string[]): void;
}>();

const { costReport, isLoading } = useCostReportGetQuery(computed(() => costReportPageState.selectedCostReportId));

const state = reactive({
    loading: false,
    proxyVisible: useProxyValue('visible', props, emit),
    currency: computed(() => costReport.value?.currency || 'KRW'),
    reportUrl: undefined as string|undefined,
    fields: computed(() => [
        { name: 'issue_date', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ISSUE_DATE'), disableCopy: true },
        { name: 'report_number', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_NUMBER'), disableCopy: true },
        { name: 'workspace_name', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE'), disableCopy: true },
        { name: 'cost', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.COST'), disableCopy: true },
        { name: 'recipients', label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.RECIPIENTS'), disableCopy: true },
    ]),
    data: [],
});

/* Event */
const handleUpdateVisible = async (visible: boolean) => {
    state.proxyVisible = visible;
    if (!visible) {
        costReportPageStore.setSelectedCostReportId(undefined);
    }
};
const handleConfirm = () => {
    postCostReportsResend();
};
const roleFormatter = (type: RoleType) => {
    switch (type) {
    case ROLE_TYPE.DOMAIN_ADMIN: return {
        name: 'Domain Admin Role',
    };
    case ROLE_TYPE.WORKSPACE_OWNER: return {
        name: 'Workspace Owner Role',
    };
    default: return {
        name: '',
    };
    }
};

/* API */
const postCostReportsResend = async (): Promise<void> => {
    if (!costReportPageState.selectedCostReportId) return;

    state.loading = true;
    try {
        await costReportAPI.send({
            cost_report_id: costReportPageState.selectedCostReportId as string,
        });
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_RESEND_REPORT'), '');
        state.proxyVisible = false;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALE_E_SEND_REPORT'));
    } finally {
        state.loading = false;
    }
};

/* Watch */
watch(() => costReportPageState.selectedCostReportId, async (newId) => {
    if (newId) {
        try {
            const response = await costReportAPI.getUrl({
                cost_report_id: newId,
            });
            state.reportUrl = response.cost_report_link;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    } else {
        state.reportUrl = undefined;
    }
}, { immediate: true });
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
                                :data="costReport"
                                :loading="isLoading"
                                :skeleton-rows="5"
            >
                <template #data-report_number="{value}">
                    <p-link :text="value"
                            :href="state.reportUrl"
                            new-tab
                            action-icon="internal-link"
                    />
                </template>
                <template #data-cost="{value}">
                    <span class="currency-symbol">{{ CURRENCY_SYMBOL[state.currency] }}</span>
                    <span class="text"> {{ currencyMoneyFormatter(value[state.currency], { currency: state.currency, style: 'decimal' }) }}</span>
                    <span class="currency-text"> ({{ state.currency }})</span>
                </template>
                <template #data-recipients="{value}">
                    <p v-for="(item, idx) in value.role_types"
                       :key="`recipients-${idx}`"
                    >
                        <span>{{ roleFormatter(item).name }}</span>
                    </p>
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
