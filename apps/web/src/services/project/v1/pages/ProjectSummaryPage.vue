<script lang="ts" setup>
import {
    computed,
    reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PI, PIconButton } from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ProjectAlertConfigListParameters } from '@/schema/monitoring/project-alert-config/api-verbs/list';
import type { ProjectAlertConfigModel } from '@/schema/monitoring/project-alert-config/model';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';
import DailyUpdates from '@/common/modules/widgets/DailyUpdates.vue';

import { gray, indigo } from '@/styles/colors';

import CloudServices from '@/services/asset-inventory/components/CloudServices.vue';
import ProjectSummaryAlertWidget from '@/services/project/v1/components/ProjectSummaryAlertWidget.vue';
import ProjectSummaryAllSummaryWidget from '@/services/project/v1/components/ProjectSummaryAllSummaryWidget.vue';
import ProjectSummaryBillingWidget from '@/services/project/v1/components/ProjectSummaryBillingWidget.vue';
import ProjectSummaryPersonalHealthDashboardWidget from '@/services/project/v1/components/ProjectSummaryPersonalHealthDashboardWidget.vue';
import ProjectSummaryServiceAccountsWidget from '@/services/project/v1/components/ProjectSummaryServiceAccountsWidget.vue';
import ProjectSummaryTrustedAdvisorWidget from '@/services/project/v1/components/ProjectSummaryTrustedAdvisorWidget.vue';

interface Props {
    id: string;
}
const props = defineProps<Props>();

const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');

const { visibleContents: visibleAssetContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);
const { visibleContents: visibleAlertContents } = useContentsAccessibility(MENU_ID.ALERT_MANAGER);

const state = reactive({
    visibleAlertTab: computed<boolean>(() => visibleAlertContents.value && (alertManagerUiAffectsSchema.value?.visibleProjectAlertTab ?? false)),
    hasAlertConfig: false,
    deprecatedNotiVisible: true,
});
const handleClickNotiClose = () => {
    state.deprecatedNotiVisible = false;
};

/* api */
const getProjectAlertConfig = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.monitoring.projectAlertConfig.list<ProjectAlertConfigListParameters, ListResponse<ProjectAlertConfigModel>>({
            project_id: props.id,
        });
        state.hasAlertConfig = !!results?.length;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => props.id, () => {
    if (state.visibleAlertTab) getProjectAlertConfig();
}, { immediate: true });
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
            <project-summary-alert-widget v-if="state.visibleAlertTab && state.hasAlertConfig"
                                          :key="`project-summary-alert-widget-${props.id}`"
                                          class="col-span-12"
                                          :project-id="props.id"
            />
            <!--            <project-summary-billing-widget-->
            <!--                class="col-span-12"-->
            <!--                :project-id="props.id"-->
            <!--            />-->
            <project-summary-billing-widget
                :key="`project-summary-billing-widget-${props.id}`"
                class="col-span-12"
                :project-id="props.id"
            />
            <project-summary-personal-health-dashboard-widget
                v-if="visibleAssetContents"
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
            <daily-updates v-if="visibleAssetContents"
                           :key="`daily-updates-${props.id}`"
                           class="col-span-12 daily-updates"
                           :project-id="props.id"
            />
            <cloud-services v-if="visibleAssetContents"
                            :key="`cloud-services-${props.id}`"
                            class="col-span-12 cloud-services"
                            :more-info="true"
                            :project-id="props.id"
            />
            <project-summary-trusted-advisor-widget
                v-if="visibleAssetContents"
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

