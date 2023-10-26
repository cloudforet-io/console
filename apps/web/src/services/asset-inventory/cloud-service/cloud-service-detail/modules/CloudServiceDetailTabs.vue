<script setup lang="ts">

import { computed, reactive } from 'vue';

import { PDynamicLayout, PTab, PEmpty } from '@spaceone/design-system';
import type { DynamicLayoutFieldHandler } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import { get } from 'lodash';

import { i18n } from '@/translations';

import type { Reference } from '@/lib/reference/type';


import Monitoring from '@/common/modules/monitoring/Monitoring.vue';
import type { MonitoringProps, MonitoringResourceType } from '@/common/modules/monitoring/type';

import CloudServiceAdmin
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceAdmin.vue';
import CloudServiceDetail
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceDetail.vue';
import CloudServiceHistory
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceHistory.vue';
import CloudServiceLogTab
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceLogTab.vue';
import CloudServiceTagsPanel
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceTagsPanel.vue';



interface Props {
    tableState: any;
    fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>>;
    group: string;
    name: string;
    isServerPage: boolean;
    selectedIndex: number;
    timezone: string;
}

const props = defineProps<Props>();


/* Tabs */
const singleItemTabState = reactive({
    tabs: computed(() => ([
        { name: 'detail', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_DETAILS') },
        { name: 'tag', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_TAG') },
        { name: 'member', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MEMBER') },
        { name: 'history', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_HISTORY') },
        { name: 'log', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_LOG') },
        { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
    ])),
    activeTab: 'detail',
});

const multiItemTabState = reactive({
    tabs: computed(() => ([
        { name: 'data', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_SELECTED_DATA') },
        { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
    ])),
    activeTab: 'data',
});

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
            />
        </template>

        <template #tag>
            <cloud-service-tags-panel :resource-id="tableState.selectedCloudServiceIds[0]"
                                      :disabled="!tableState.hasManagePermission"
                                      :provider="tableState.selectedItems[0].provider"
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
    </p-tab>
    <p-tab v-else-if="props.selectedIndex > 1"
           :tabs="multiItemTabState.tabs"
           :active-tab.sync="multiItemTabState.activeTab"
           :class="multiItemTabState.activeTab"
    >
        <template #data>
            <p-dynamic-layout v-if="tableState.multiSchema"
                              type="simple-table"
                              :options="tableState.multiSchema.options"
                              :type-options="{ colCopy: true, timezone: props.timezone }"
                              :data="tableState.selectedItems"
                              :field-handler="fieldHandler"
                              class="selected-data-tab"
            />
        </template>
        <template #monitoring>
            <monitoring :resources="monitoringState.resources" />
        </template>
    </p-tab>
    <p-empty v-else
             style="height: auto; margin-top: 4rem;"
    >
        {{ $t('INVENTORY.CLOUD_SERVICE.PAGE.NO_SELECTED') }}
    </p-empty>
</template>
