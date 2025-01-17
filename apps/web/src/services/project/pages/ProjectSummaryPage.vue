<script lang="ts" setup>
import {
    reactive,
} from 'vue';

import { PI, PIconButton } from '@cloudforet/mirinae';

import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import { gray, indigo } from '@/styles/colors';

import CloudServices from '@/services/asset-inventory-v1/components/CloudServices.vue';
import ProjectSummaryAllSummaryWidget from '@/services/project/components/ProjectSummaryAllSummaryWidget.vue';
import ProjectSummaryBillingWidget from '@/services/project/components/ProjectSummaryBillingWidget.vue';
import ProjectSummaryPersonalHealthDashboardWidget from '@/services/project/components/ProjectSummaryPersonalHealthDashboardWidget.vue';
import ProjectSummaryServiceAccountsWidget from '@/services/project/components/ProjectSummaryServiceAccountsWidget.vue';
import ProjectSummaryTrustedAdvisorWidget from '@/services/project/components/ProjectSummaryTrustedAdvisorWidget.vue';



interface Props {
    id: string;
}
const props = defineProps<Props>();
const state = reactive({
    deprecatedNotiVisible: true,
});

const handleClickNotiClose = () => {
    state.deprecatedNotiVisible = false;
};
</script>

<template>
    <div class="project-summary-page">
        <div v-if="state.deprecatedNotiVisible"
             class="deprecated-notification"
        >
            <div class="contents-wrapper">
                <p-i name="ic_info-circle"
                     width="1.25rem"
                     height="1.25rem"
                     :color="indigo[500]"
                />
                <div>
                    <p class="title">
                        {{ $t('PROJECT.DETAIL.SUMMARY.DEPRECATED_TITLE') }}
                    </p>
                    <p class="description">
                        {{ $t('PROJECT.DETAIL.SUMMARY.DEPRECATED_DESC') }}
                    </p>
                </div>
            </div>
            <p-icon-button name="ic_close"
                           size="sm"
                           width="1.5rem"
                           height="1.5rem"
                           :color="gray[400]"
                           @click="handleClickNotiClose"
            />
        </div>
        <project-summary-all-summary-widget
            :key="`project-summary-all-summary-widget-${props.id}`"
            class="col-span-12"
            :project-id="props.id"
        />
        <div class="col-span-12 lg:col-span-9 grid grid-cols-12 left-part">
            <!--            <project-v1-summary-billing-widget-->
            <!--                class="col-span-12"-->
            <!--                :project-v1-id="props.id"-->
            <!--            />-->
            <project-summary-billing-widget
                :key="`project-summary-billing-widget-${props.id}`"
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-personal-health-dashboard-widget
                :key="`project-summary-personal-health-dashboard-widget-${props.id}`"
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-service-accounts-widget
                :key="`project-summary-service-accounts-widget-${props.id}`"
                class="col-span-12 service-accounts-table"
                :project-id="props.id"
            />
        </div>
        <div class="col-span-12 lg:col-span-3 grid grid-cols-12 right-part">
            <daily-updates :key="`daily-updates-${props.id}`"
                           class="col-span-12 daily-updates"
                           :project-id="props.id"
            />
            <cloud-services :key="`cloud-services-${props.id}`"
                            class="col-span-12 cloud-services"
                            :more-info="true"
                            :project-id="props.id"
            />
            <project-summary-trusted-advisor-widget
                :key="`project-summary-trusted-advisor-widget-${props.id}`"
                class="col-span-12 trusted-advisor"
                :project-id="props.id"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
/* custom widget-layout */
:deep(.widget-layout) {
    .title {
        font-size: 1rem;
        font-weight: bold;
        line-height: 1.6;
    }
}

.project-summary-page {
    grid-gap: 1rem;
    padding: 2rem 1rem 0;

    .deprecated-notification {
        @apply bg-indigo-100 rounded-md flex w-full justify-between;
        padding: 1rem 0.5rem;
        margin-bottom: 1.5rem;

        .contents-wrapper {
            @apply flex gap-1;

            .title {
                @apply text-label-lg font-bold text-indigo-600;
            }
            .description {
                @apply text-paragraph-md text-gray-900;
            }
        }
    }

    .left-part, .right-part {
        display: grid;
        grid-auto-rows: max-content;
        row-gap: 1rem;
    }

    .cloud-services {
        @apply border border-gray-200 rounded-md;
        min-height: 25rem;
        max-height: 35rem;

        @screen tablet {
            height: 26rem;
        }
    }

    .trusted-advisor {
        @apply border border-gray-200 rounded-md;
    }

    .service-accounts-table {
        @apply border border-gray-200 rounded-md;
    }

    .daily-updates {
        @apply border border-gray-200 rounded-md;
        max-height: 35rem;
    }
}
</style>

