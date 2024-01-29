<script setup lang="ts">
import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PDataLoader, PLink } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { CostReportGetParameters } from '@/schema/cost-analysis/cost-report/api-verbs/get';
import type { CostReportModel } from '@/schema/cost-analysis/cost-report/model';

import { ERROR_ROUTE } from '@/router/constant';

import TableHeader from '@/common/components/cost-report-page/table-header.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import ConsoleLogo from '@/services/auth/components/ConsoleLogo.vue';

const router = useRouter();

interface Props {
    accessToken?: string;
    costReportId?: string;
}
interface State {
    loading: boolean;
    baseInfo?: CostReportModel;
    isExpired: boolean;
    reportDateRage: ComputedRef<string>;
    totalCost: ComputedRef<string|undefined>;
}
const props = withDefaults(defineProps<Props>(), {
    accessToken: undefined,
    costReportId: undefined,
});

const state = reactive<State>({
    loading: true,
    baseInfo: undefined,
    isExpired: false,
    reportDateRage: computed(() => {
        const baseDate = dayjs(state.baseInfo?.issue_date);
        if (!baseDate) return '';
        const lastMonth = baseDate.subtract(1, 'month');
        const startDate = lastMonth.startOf('month').format('YYYY-MM-DD');
        const endDate = lastMonth.endOf('month').format('YYYY-MM-DD');
        return `${startDate} ~ ${endDate}`;
    }),
    totalCost: computed(() => numberFormatter(10000000)),
});

const fetchReportData = async () => {
    try {
        const { costReportId } = props;
        if (!costReportId) return;
        state.baseInfo = await SpaceConnector.clientV2.costAnalysis.costReport.get<CostReportGetParameters, CostReportModel>({
            cost_report_id: costReportId,
        });
    } catch (e: any) {
        ErrorHandler.handleError(e);
        await router.push({ name: ERROR_ROUTE.EXPIRED_LINK._NAME });
    } finally {
        state.loading = false;
    }
};

/* Init */
const initStatesByUrlSSOToken = async ():Promise<boolean> => {
    try {
        if (!props.accessToken) return false;
        SpaceConnector.setToken(props.accessToken, '');
        return true;
    } catch (e: any) {
        state.isExpired = true;
        return false;
    }
};
(async () => {
    const isSucceeded = await initStatesByUrlSSOToken();
    if (!isSucceeded) return;
    await fetchReportData();
})();
</script>

<template>
    <p-data-loader
        class="cost-report-page"
        :loading="state.loading"
    >
        <div class="contents-wrapper">
            <div class="content">
                <div class="header">
                    <p class="main-title">
                        {{ $t('COMMON.COST_REPORT.COST_REPORT') }}
                    </p>
                    <console-logo :size-ratio="0.8"
                                  :position-fixed="false"
                    />
                </div>
                <div class="invoice-information">
                    <p class="report-name">
                        {{ state.baseInfo?.cost_report_id }}
                    </p>
                    <p class="report-info">
                        <label>{{ $t('COMMON.COST_REPORT.REPORT_NUMBER') }}:</label>{{ state.baseInfo?.report_number }}
                    </p>
                    <p class="report-info">
                        <label>{{ $t('COMMON.COST_REPORT.ISSUE_DATE') }}:</label>{{ state.baseInfo?.issue_date }} <span class="real-date-range">({{ state.reportDateRage }})</span>
                    </p>
                    <p class="report-info">
                        <label>{{ $t('COMMON.COST_REPORT.CURRENCY_REFERENCE') }}:</label> {{ state.baseInfo?.currency_date }}({{ state.baseInfo?.bank_name }})
                    </p>
                </div>
                <div class="total"
                     :style="{borderTopColor: gray[500], borderBottomColor: gray[200]}"
                >
                    <span class="title">{{ $t('COMMON.COST_REPORT.TOTAL') }}</span>
                    <span>{{ state.totalCost }}</span>
                </div>
                <div class="index-wrapper">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.INDEX') }}
                    </p>
                    <p-link to="#total-amount-by-provider"
                            class="table-link"
                            highlight
                    >
                        {{ $t('COMMON.COST_REPORT.TOTAL_AMOUNT_BY_PROVIDER') }}
                    </p-link>
                    <p-link to="#details-by-product"
                            class="table-link"
                            highlight
                    >
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                    </p-link>
                    <p-link to="#details-by-project"
                            class="table-link"
                            highlight
                    >
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                    </p-link>
                    <p-link to="#details-by-service-account"
                            class="table-link"
                            highlight
                    >
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                    </p-link>
                </div>
                <div id="total-amount-by-provider">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROVIDER') }}
                    </p>
                </div>
                <div id="details-by-product">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PRODUCT') }}
                    </p>
                    <table-header title="Amazon Elastic Compute Cloud - Compute"
                                  sub-total="1,000,000"
                                  provider="AWS"
                                  provider-icon-src="https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/aws.svg"
                    />
                </div>
                <div id="details-by-project">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_PROJECT') }}
                    </p>
                </div>
                <div id="details-by-service-account">
                    <p class="title">
                        {{ $t('COMMON.COST_REPORT.DETAILS_BY_SERVICE_ACCOUNT') }}
                    </p>
                </div>
            </div>
        </div>
    </p-data-loader>
</template>

<style lang="postcss" scoped>
.title {
    @apply text-label-xl font-bold;
    margin-bottom: 0.75rem;
}

.contents-wrapper {
    @apply flex flex-col items-center justify-center;
    .content {
        padding: 1.4rem 0 3rem 0;
        width: 48rem;

        .header {
            @apply flex items-end justify-between;
            width: 100%;
            .main-title {
                @apply text-display-lg font-bold;
            }
        }

        .invoice-information {
            @apply flex flex-col;
            margin: 3rem 0;

            .report-name {
                @apply text-display-md;
            }

            .report-info {
                @apply text-label-md;
                margin-top: 0.5rem;

                & label {
                    @apply text-label-md font-bold;
                    margin-right: 0.5rem;
                }

                &:nth-child(2) {
                    margin-top: 1.5rem;
                }
                &:nth-child(3) {
                    margin-bottom: 1.5rem;
                    .real-date-range {
                        @apply text-label-md text-gray-500;
                    }
                }
            }
        }

        .total {
            @apply border-t border-b flex  justify-between;
            padding-top: 0.875rem;
            height: 4.75rem;
        }

        .index-wrapper {
            @apply flex flex-col;
            margin-top: 2rem;
            margin-bottom: 2.25rem;
            .table-link {
                margin-bottom: 0.75rem;
            }
        }
    }
}

</style>
