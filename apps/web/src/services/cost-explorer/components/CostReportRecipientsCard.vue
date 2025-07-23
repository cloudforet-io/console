<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useMutation, useQueryClient } from '@tanstack/vue-query';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PTooltip, PI, PToggleButton, PLink,
} from '@cloudforet/mirinae';

import type {
    CostReportConfigUpdateRecipientsParameters,
} from '@/api-clients/cost-analysis/cost-report-config/schema/api-verbs/update-recipients';
import type { CostReportConfigModel } from '@/api-clients/cost-analysis/cost-report-config/schema/model';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';


import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { useCostReportConfigQuery } from '@/services/cost-explorer/composables/use-cost-report-config-query';
import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';


interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const appContextStore = useAppContextStore();
const queryClient = useQueryClient();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const enableWorkspaceOwnerRecipients = computed<boolean>(() => costReportConfig.value?.recipients?.role_types?.includes('WORKSPACE_OWNER') ?? false);

/* Api */
const { costReportConfig, key: costReportConfigQueryKey } = useCostReportConfigQuery();
const { mutate: updateRecipients } = useMutation<CostReportConfigModel, Error, boolean>({
    mutationFn: async (val: boolean) => SpaceConnector.clientV2.costAnalysis.costReportConfig.updateRecipients<CostReportConfigUpdateRecipientsParameters, CostReportConfigModel>({
        cost_report_config_id: costReportConfig.value?.cost_report_config_id ?? '',
        recipients: {
            role_types: val ? ['WORKSPACE_OWNER'] : [],
        },
    }),
    onSuccess: () => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_UPDATE_RECIPIENTS'), '');
        queryClient.invalidateQueries({ queryKey: costReportConfigQueryKey.value });
    },
    onError: (error) => {
        ErrorHandler.handleRequestError(error, i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_E_UPDATE_RECIPIENTS'));
    },
});

/* Event */
const handleToggleRecipients = async (val: boolean) => {
    updateRecipients(val);
};
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_RECIPIENTS') }}
            </span>
        </template>
        <template #right-extra>
            <p-link v-if="storeState.isAdminMode"
                    action-icon="internal-link"
                    highlight
                    :to="{ name: ADMIN_IAM_ROUTE.ROLE._NAME }"
                    size="md"
                    new-tab
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MANAGE_ROLES') }}
            </p-link>
        </template>
        <template #content>
            <div class="recipient-wrapper">
                <div class="left-part">
                    <img :src="WorkspaceOwnerImage"
                         alt="icon"
                         class="icon"
                    >
                    <span class="text">{{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE_OWNER_ROLE') }}</span>
                    <p-tooltip position="bottom"
                               :contents="$t('BILLING.COST_MANAGEMENT.COST_REPORT.RECIPIENTS_TOOLTIP')"
                               class="tooltip"
                    >
                        <p-i name="ic_info-circle"
                             class="icon-info"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                        />
                    </p-tooltip>
                </div>
                <p-toggle-button v-if="props.hasReadWriteAccess && storeState.isAdminMode"
                                 :value="enableWorkspaceOwnerRecipients"
                                 @change-toggle="handleToggleRecipients"
                />
                <span v-else
                      class="on-off-text"
                      :class="{ 'on': enableWorkspaceOwnerRecipients }"
                >
                    {{ enableWorkspaceOwnerRecipients ? 'ON' : 'OFF' }}
                </span>
            </div>
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="scss" scoped>
.recipient-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    .left-part {
        display: flex;
        align-items: center;
    }
    .icon {
        @apply rounded-full;
        width: 1.125rem;
        height: 1.125rem;
        margin-right: 0.5rem;
    }
    .text {
        @apply text-label-md;
        padding-right: 0.25rem;
    }
    .tooltip {
        @apply text-gray-500;
        display: flex;
    }
    .on-off-text {
        @apply text-gray-300 text-label-md;
        &.on {
            @apply text-secondary;
        }
    }
}
</style>
