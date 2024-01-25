<script lang="ts" setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PTooltip, PI, PToggleButton, PButton,
} from '@spaceone/design-system';

import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';


const router = useRouter();
const state = reactive({
    enableWorkspaceOwnerRecipients: false,
});

/* Event */
const handleToggleRecipients = () => {
    state.enableWorkspaceOwnerRecipients = !state.enableWorkspaceOwnerRecipients;
};
const handleClickManageRoles = () => {
    router.push({ name: makeAdminRouteName(ADMINISTRATION_ROUTE.IAM.ROLE._NAME) });
};
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
                <p-toggle-button :value="state.enableWorkspaceOwnerRecipients"
                                 @change-toggle="handleToggleRecipients"
                />
            </div>
            <p-button class="manage-roles-button"
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
}
.manage-roles-button {
    margin-top: 0.75rem;
    width: 100%;
}
</style>
