<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PButton, PTooltip, PI,
} from '@spaceone/design-system';

import EnvelopeImage from '@/assets/images/img_envelope-filled.svg';
import DomainAdminImage from '@/assets/images/role/img_avatar_admin.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';
import { i18n } from '@/translations';

import CostReportOverviewCardTemplate from '@/services/cost-explorer/components/CostReportOverviewCardTemplate.vue';
import CostReportRecipientsModal from '@/services/cost-explorer/components/CostReportRecipientsModal.vue';


interface RecipientItem {
    icon: string;
    label: string;
    count: number;
    showTooltip: boolean;
    description?: string;
}
const state = reactive({
    recipientsItems: computed<RecipientItem[]>(() => ([
        {
            icon: DomainAdminImage,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ADMIN_ROLE') as string,
            count: 0,
            showTooltip: true,
        },
        {
            icon: WorkspaceOwnerImage,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.WORKSPACE_OWNER_ROLE') as string,
            count: 3,
            showTooltip: true,
        },
        {
            icon: EnvelopeImage,
            label: i18n.t('BILLING.COST_MANAGEMENT.COST_REPORT.ADDITIONAL_EMAIL') as string,
            count: 5,
            showTooltip: false,
            description: 'wonny@spaceone.io, jennykim@mz.co.kr, rocket@spaceone.io, planet@spaceone.io, moon@spaceon.e.io',
        },
    ])),
    settingsModalVisible: false,
});

/* Event */
const handleClickSettings = (): void => {
    state.settingsModalVisible = true;
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
            <p-button style-type="tertiary"
                      icon-left="ic_settings"
                      size="sm"
                      @click="handleClickSettings"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_REPORT.SETTINGS') }}
            </p-button>
        </template>
        <template #content>
            <div v-for="recipient in state.recipientsItems"
                 :key="`temp-key-${recipient.label}`"
                 class="recipient-item"
            >
                <img :src="recipient.icon"
                     alt="icon"
                     class="icon"
                >
                <div class="description-column">
                    <div class="inline-grid">
                        <div class="left-part">
                            <span class="text">{{ recipient.label }}</span>
                            <p-tooltip v-if="recipient.showTooltip"
                                       position="bottom"
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
                        <div v-if="recipient.description?.length"
                             class="description"
                        >
                            {{ recipient.description }}
                        </div>
                    </div>
                    <span class="count"
                          :class="{ 'text-gray-400': !recipient.count }"
                    >
                        {{ recipient.count }}
                    </span>
                </div>
            </div>
            <cost-report-recipients-modal :visible.sync="state.settingsModalVisible" />
        </template>
    </cost-report-overview-card-template>
</template>

<style lang="scss" scoped>
.recipient-item {
    display: flex;
    align-items: flex-start;
    padding-top: 0.375rem;
    .icon {
        @apply rounded-full;
        width: 1.125rem;
        height: 1.125rem;
        margin-right: 0.5rem;
    }
    .description-column {
        @apply border-b border-gray-200;
        display: flex;
        width: 100%;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.25rem;
        padding-bottom: 0.375rem;
        padding-right: 0.75rem;
        .left-part {
            display: flex;
            align-items: center;
            .text {
                @apply text-label-md;
                padding-right: 0.25rem;
            }
            .tooltip {
                @apply text-gray-500;
                display: flex;
            }
        }
        .description {
            @apply text-paragraph-sm text-gray-500;
            width: 100%;
        }
        .count {
            @apply text-label-md;
            font-weight: 500;
        }
    }
    &:last-child {
        .description-column {
            border: none;
        }
    }
}
</style>
