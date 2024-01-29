<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PTooltip, PI, PToggleButton, PButton,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import type {
    CostReportConfigUpdateRecipientsParameters,
} from '@/schema/cost-analysis/cost-report-config/api-verbs/update-recipients';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import { useCostReportPageStore } from '@/services/cost-explorer/stores/cost-report-page-store';


const router = useRouter();
const costReportPageStore = useCostReportPageStore();
const costReportPageState = costReportPageStore.state;
const costReportPageGetters = costReportPageStore.getters;
const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    enableWorkspaceOwnerRecipients: false,
});

/* Api */
const updateRecipients = async (val: boolean): Promise<boolean> => {
    try {
        const updatedConfig = await SpaceConnector.clientV2.costAnalysis.costReportConfig.updateRecipients<CostReportConfigUpdateRecipientsParameters, CostReportConfigModel>({
            cost_report_config_id: costReportPageState.costReportConfig?.cost_report_config_id ?? '',
            recipients: {
                ...costReportPageGetters.recipients,
                role_types: val ? ['WORKSPACE_OWNER'] : [],
            },
        });
        costReportPageStore.setCostReportConfig(updatedConfig);
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_S_UPDATE_RECIPIENTS'), '');
        return true;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ALT_E_UPDATE_RECIPIENTS'));
        return false;
    }
};

/* Event */
const handleToggleRecipients = async (val: boolean) => {
    const result = await updateRecipients(val);
    if (result) state.enableWorkspaceOwnerRecipients = val;
};
const handleClickManageRoles = () => {
    router.push({ name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE._NAME) });
};

/* Watcher */
watch(() => costReportPageState.costReportConfig, (costReportConfig) => {
    state.enableWorkspaceOwnerRecipients = costReportConfig?.recipients?.role_types?.includes('WORKSPACE_OWNER') ?? false;
}, { immediate: true });
</script>

<template>
    <cost-report-overview-card-template>
        <template #title>
            <span class="title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.REPORT_RECIPIENTS') }}
            </span>
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
                <p-toggle-button v-if="storeState.isAdminMode"
                                 :value="state.enableWorkspaceOwnerRecipients"
                                 @change-toggle="handleToggleRecipients"
                />
                <span v-else
                      class="on-off-text"
                      :class="{ 'on': state.enableWorkspaceOwnerRecipients }"
                >
                    {{ state.enableWorkspaceOwnerRecipients ? 'ON' : 'OFF' }}
                </span>
            </div>
            <p-button v-if="storeState.isAdminMode"
                      class="manage-roles-button"
                      style-type="tertiary"
                      icon-left="ic_settings"
                      size="sm"
                      @click="handleClickManageRoles"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.MANAGE_ROLES') }}
            </p-button>
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
.manage-roles-button {
    margin-top: 0.75rem;
    width: 100%;
}
</style>
