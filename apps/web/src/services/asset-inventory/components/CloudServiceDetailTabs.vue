<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { get } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PDynamicLayout, PTab, PEmpty, PTextButton, PI, PHeading,
} from '@cloudforet/mirinae';
import type { DynamicLayoutFieldHandler } from '@cloudforet/mirinae/types/data-display/dynamic/dynamic-layout/type';

import type { CloudServiceGetParameters } from '@/schema/inventory/cloud-service/api-verbs/get';
import type { CloudServiceModel } from '@/schema/inventory/cloud-service/model';
import { i18n } from '@/translations';

import { useServiceRouter } from '@/router/composables/use-service-router';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useGlobalConfigUiAffectsSchema } from '@/lib/config/global-config/composables/use-global-config-ui-affects-schema';
import { MENU_ID } from '@/lib/menu/config';
import type { Reference } from '@/lib/reference/type';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';
import ErrorHandler from '@/common/composables/error/errorHandler';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';
import type { MonitoringProps, MonitoringResourceType } from '@/common/modules/monitoring/type';

import CloudServiceAdmin
    from '@/services/asset-inventory/components/CloudServiceAdmin.vue';
import CloudServiceAlertsTab from '@/services/asset-inventory/components/CloudServiceAlertsTab.vue';
import CloudServiceDetail
    from '@/services/asset-inventory/components/CloudServiceDetail.vue';
import CloudServiceMultipleSelectedData
    from '@/services/asset-inventory/components/CloudServiceDetailMultipleSelectedData.vue';
import CloudServiceHistory
    from '@/services/asset-inventory/components/CloudServiceHistory.vue';
import CloudServiceLogTab
    from '@/services/asset-inventory/components/CloudServiceLogTab.vue';
import CloudServiceTagsPanel
    from '@/services/asset-inventory/components/CloudServiceTagsPanel.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import BoardTaskTable from '@/services/ops-flow/components/BoardTaskTable.vue';
import {
    useTaskManagementTemplateStore,
} from '@/services/ops-flow/task-management-templates/stores/use-task-management-template-store';

interface Props {
    tableState: any;
    fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>>;
    group: string;
    name: string;
    isServerPage: boolean;
    isSecurityPage: boolean;
    selectedIndex: number;
    timezone: string;
}

const props = defineProps<Props>();

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const taskManagementTemplateStore = useTaskManagementTemplateStore();
const alertManagerUiAffectsSchema = useGlobalConfigUiAffectsSchema('ALERT_MANAGER');


const router = useRouter();
const serviceRouter = useServiceRouter(router);

const { visibleContents } = useContentsAccessibility(MENU_ID.OPS_FLOW);

/* Tabs */
const state = reactive({
    visibleAlertTab: computed(() => alertManagerUiAffectsSchema.value?.visibleAssetAlertTab),
});
const singleItemTabState = reactive({
    tabs: computed(() => {
        const defaultTabs = [
            { name: 'detail', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_DETAILS') },
            { name: 'tag', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_TAG') },
            { name: 'member', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MEMBER') },
            { name: 'history', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_HISTORY') },
        ];
        if (!props.isSecurityPage) {
            defaultTabs.push(
                { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
                { name: 'log', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_LOG') },
            );
        }
        if (state.visibleAlertTab) {
            defaultTabs.push({ name: 'alerts', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_ALERTS') });
        }
        if (visibleContents.value) {
            defaultTabs.push({ name: 'task', label: taskManagementTemplateStore.templates.Task });
        }
        return defaultTabs;
    }),
    activeTab: 'detail',
});

const multiItemTabState = reactive({
    tabs: computed(() => {
        const defaultTabs = [
            { name: 'data', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_SELECTED_DATA') },
            { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
        ];
        if (visibleContents.value) {
            defaultTabs.push({ name: 'task', label: taskManagementTemplateStore.templates.Task });
        }
        return defaultTabs;
    }),
    activeTab: 'data',
});

/* Event */
const handleClickLinkButton = async (type: string, workspaceId: string, id: string) => {
    if (type === 'workspace') {
        try {
            const response = await SpaceConnector.clientV2.inventory.cloudService.get<CloudServiceGetParameters, CloudServiceModel>({
                cloud_service_id: id,
            });
            window.open(router.resolve({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: response.provider,
                    group: response.cloud_service_group,
                    name: response.cloud_service_type,
                    workspaceId,
                },
            }).href, '_blank');
        } catch (e: any) {
            ErrorHandler.handleRequestError(e, e.message);
        }
    } else {
        window.open(serviceRouter.resolve({
            feature: MENU_ID.PROJECT,
            routeKey: 'detail',
            params: { id, workspaceId },
        }).href, '_blank');
    }
};

/* Monitoring Tab */
const monitoringState: MonitoringProps = reactive({
    resourceType: 'inventory.CloudService',
    resources: computed(() => props.tableState.selectedItems.map((d) => ({
        id: get(d, 'cloud_service_id'),
        name: d.name,
        provider: d.provider,
    }))) as unknown as MonitoringResourceType[],
});

</script>

<template>
    <p-tab v-if="tableState.selectedItems.length === 1"
           :tabs="singleItemTabState.tabs"
           :active-tab.sync="singleItemTabState.activeTab"
           :class="singleItemTabState.activeTab"
    >
        <template #detail>
            <cloud-service-detail
                :cloud-service-id="tableState.selectedCloudServiceIds[0]"
                :cloud-service-group="props.group"
                :cloud-service-type="props.name"
                :is-server-page="props.isServerPage"
                :is-security-page="props.isSecurityPage"
            />
        </template>

        <template #tag>
            <cloud-service-tags-panel v-if="tableState.selectedCloudServiceIds[0]"
                                      :resource-id="tableState.selectedCloudServiceIds[0]"
                                      :disabled="!tableState.hasAdminOrWorkspaceOwnerRole"
                                      :provider="tableState.selectedItems[0].provider ?? ''"
            />
        </template>
        <template #member>
            <cloud-service-admin :cloud-service-project-id="tableState.selectedItems[0].project_id" />
        </template>
        <template #history>
            <cloud-service-history :cloud-service-item="tableState.selectedItems[0]"
                                   :provider="tableState.selectedItems[0].provider"
            />
        </template>
        <template #log>
            <cloud-service-log-tab :cloud-service-id="tableState.selectedItems[0].cloud_service_id"
                                   :provider="tableState.selectedItems[0].provider"
            />
        </template>
        <template #monitoring>
            <monitoring :resources="monitoringState.resources" />
        </template>
        <template #alerts>
            <cloud-service-alerts-tab
                :cloud-service-id="tableState.selectedCloudServiceIds[0]"
            />
        </template>
        <template #task>
            <p-heading class="py-6 px-4"
                       heading-type="sub"
            >
                {{ taskManagementTemplateStore.templates.Task }}
            </p-heading>
            <board-task-table :key="tableState.selectedItems[0].cloud_service_id"
                              tag="div"
                              :related-assets="[tableState.selectedItems[0].cloud_service_id]"
            />
        </template>
    </p-tab>
    <p-tab v-else-if="props.selectedIndex > 1"
           :tabs="multiItemTabState.tabs"
           :active-tab.sync="multiItemTabState.activeTab"
           :class="multiItemTabState.activeTab"
    >
        <template #data>
            <p-dynamic-layout v-if="tableState.multiSchema && props.isServerPage"
                              type="simple-table"
                              :options="tableState.multiSchema.options"
                              :type-options="{ colCopy: true, timezone: props.timezone }"
                              :data="tableState.selectedItems"
                              :field-handler="fieldHandler"
                              class="selected-data-tab"
            >
                <template #col-workspace_id-format="{value, item}">
                    <p-text-button class="report-link"
                                   size="md"
                                   @click="handleClickLinkButton('workspace', value, item.cloud_service_id)"
                    >
                        {{ allReferenceGetters.workspace[value]?.label }}
                        <p-i name="ic_arrow-right-up"
                             class="link-mark"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                        />
                    </p-text-button>
                </template>
                <template #col-project_id-format="{value, item}">
                    <p-text-button class="report-link"
                                   size="md"
                                   @click="handleClickLinkButton('project', item.workspace_id, value)"
                    >
                        {{ allReferenceGetters.project[value]?.label }}
                        <p-i name="ic_arrow-right-up"
                             class="link-mark"
                             height="0.875rem"
                             width="0.875rem"
                             color="inherit"
                        />
                    </p-text-button>
                </template>
            </p-dynamic-layout>
            <cloud-service-multiple-selected-data v-else
                                                  :cloud-service-group="props.group"
                                                  :cloud-service-type="props.name"
                                                  :cloud-service-id-list="tableState.selectedItems.map((item) => item?.cloud_service_id)"
                                                  :is-security-page="props.isSecurityPage"
            />
        </template>
        <template #monitoring>
            <monitoring :resources="monitoringState.resources" />
        </template>
        <template #task>
            <board-task-table :key="tableState.selectedItems.map((d) => d.cloud_service_id).join(',')"
                              tag="div"
                              :related-assets="tableState.selectedItems.map(d => d.cloud_service_id)"
            />
        </template>
    </p-tab>
    <p-empty v-else
             style="height: auto; margin-top: 4rem;"
    >
        {{ $t('INVENTORY.CLOUD_SERVICE.PAGE.NO_SELECTED') }}
    </p-empty>
</template>

<style lang="postcss" scoped>
.selected-data-tab {
    .report-link {
        @apply flex items-center text-gray-900;
        gap: 0.25rem;
    }
}
</style>
