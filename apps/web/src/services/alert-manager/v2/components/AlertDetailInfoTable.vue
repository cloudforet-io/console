<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';
import type { RawLocation } from 'vue-router/types/router';

import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    PBadge, PDefinitionTable,
    PLink,
    PPaneLayout,
    PTextButton,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_SEVERITY } from '@/api-clients/alert-manager/alert/schema/constants';
import type { AlertSeverityType } from '@/api-clients/alert-manager/alert/schema/type';
import { useCloudServiceApi } from '@/api-clients/inventory/cloud-service/composables/use-cloud-service-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useUserStore } from '@/store/user/user-store';


import AlertDetailInfoTableDescription from '@/services/alert-manager/v2/components/AlertDetailInfoTableDescription.vue';
import { useAlertGetQuery } from '@/services/alert-manager/v2/composables/use-alert-get-query';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

type BadgeInfo = {
    badgeType: string;
    styleType: string;
};

const userStore = useUserStore();
const userState = userStore.state;
const userWorkspaceStore = useUserWorkspaceStore();
const referenceMap = useAllReferenceDataModel();

const router = useRouter();
const route = useRoute();

const { alertData } = useAlertGetQuery(route.params.alertId as string);

const queryHelper = new QueryHelper();

const cloudServiceState = reactive({
    id: '',
    type: undefined as string | undefined,
    params: computed(() => {
        const [provider, group, name] = cloudServiceState.type.split('.');
        if (cloudServiceState.type) {
            return {
                provider,
                group,
                name,
                id: cloudServiceState.id,
            };
        }
        return {
            provider: cloudServiceData.value?.provider || provider,
            group: cloudServiceData.value?.cloud_service_group || group,
            name: cloudServiceData.value?.cloud_service_type || name,
            id: cloudServiceData.value?.cloud_service_id || cloudServiceState.id,
        };
    }),
});
const storeState = reactive({
    timezone: computed<string>(() => userState.timezone || 'UTC'),
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'alert_id', label: i18n.t('ALERT_MANAGER.ALERTS.ID') },
        { name: 'description', label: i18n.t('ALERT_MANAGER.ALERTS.DESC'), disableCopy: true },
        { name: 'rule', label: i18n.t('ALERT_MANAGER.ALERTS.RULE'), disableCopy: true },
        { name: 'severity', label: i18n.t('ALERT_MANAGER.ALERTS.SEVERITY'), disableCopy: true },
        { name: 'triggered_by', label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED_BY'), copyValueFormatter: () => alertData.value?.triggered_by },
        { name: 'service_id', label: i18n.t('ALERT_MANAGER.ALERTS.SERVICE'), disableCopy: true },
        { name: 'resources', label: i18n.t('ALERT_MANAGER.ALERTS.RESOURCE'), disableCopy: true },
        { name: 'created_at', label: i18n.t('ALERT_MANAGER.ALERTS.CREATED'), disableCopy: true },
        { name: 'acknowledged_at', label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), disableCopy: true },
        { name: 'resolved_at', label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), disableCopy: true },
        { name: 'labels', label: i18n.t('ALERT_MANAGER.ALERTS.LABEL'), disableCopy: true },
    ]),
});

const getCreatedByNames = (id: string): string => {
    if (id.includes('webhook')) {
        return referenceMap.alertManagerWebhook[id]?.label || id;
    }
    return id || '--';
};
const getBadgeInfo = (value: AlertSeverityType): BadgeInfo => {
    switch (value) {
    case ALERT_SEVERITY.CRITICAL:
        return {
            badgeType: 'solid-outline',
            styleType: 'alert',
        };
    case ALERT_SEVERITY.ERROR:
        return {
            badgeType: 'solid',
            styleType: 'alert',
        };
    case ALERT_SEVERITY.INFO:
        return {
            badgeType: 'subtle',
            styleType: 'gray200',
        };
    case ALERT_SEVERITY.WARNING:
        return {
            badgeType: 'subtle',
            styleType: 'yellow200',
        };
    default:
        return {} as BadgeInfo;
    }
};

const createRouteParams = (params: {
    provider: string;
    group: string;
    name: string;
    id: string;
}): RawLocation => ({
    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
    params: {
        provider: params.provider,
        group: params.group,
        name: params.name,
        workspaceId: userWorkspaceStore.getters.currentWorkspaceId || '',
    },
    query: {
        filters: queryHelper.setFilters([
            { k: 'cloud_service_id', v: params.id, o: '=' },
        ]).rawQueryStrings,
    },
});

const { cloudServiceAPI } = useCloudServiceApi();
const { key: cloudServiceQueryKey, params: cloudServiceQueryParams } = useServiceQueryKey('inventory', 'cloud-service', 'get', {
    params: computed(() => ({
        cloud_service_id: cloudServiceState.id,
    })),
});
const { data: cloudServiceData } = useScopedQuery({
    queryKey: cloudServiceQueryKey,
    queryFn: () => cloudServiceAPI.get(cloudServiceQueryParams.value),
    enabled: !!cloudServiceState.id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
}, ['WORKSPACE']);

const handleRouteViewButton = async (id: string, type?: string) => {
    if (!type && !id) {
        console.warn('Invalid parameters: both id and type are missing');
        return;
    }

    cloudServiceState.id = id;
    cloudServiceState.type = type;

    await window.open(router.resolve(createRouteParams(cloudServiceState.params)).href, '_blank');
};
</script>

<template>
    <p-pane-layout class="alert-detail-info-table overflow-hidden pb-10">
        <p-definition-table :fields="tableState.fields"
                            :data="alertData"
                            :skeleton-rows="10"
                            custom-key-width="10rem"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-detail-info-table-description :value="alertData?.description || ''"
                                                     :alert-id="alertData?.alert_id || ''"
                />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-severity="{value}">
                <p-badge :badge-type="getBadgeInfo(value).badgeType"
                         :style-type="getBadgeInfo(value).styleType"
                >
                    {{ (ALERT_SEVERITY[value] || value).toLowerCase().replace(/^./, (char) => char.toUpperCase()) }}
                </p-badge>
            </template>
            <template #data-resources="{ value }">
                <span v-if="value.length === 0">
                    --
                </span>
                <template v-else>
                    <div v-for="(item, idx) in value"
                         :key="`resource-item-${idx}`"
                         class="resource-item-wrapper flex items-center justify-between"
                    >
                        <p class="resource-item truncate">
                            {{ item?.name }}
                        </p>
                        <p-text-button v-if="item.asset_id"
                                       style-type="highlight"
                                       icon-right="ic_arrow-right-up"
                                       @click="handleRouteViewButton(item.asset_id, item.asset_type)"
                        >
                            {{ $t('ALERT_MANAGER.ALERTS.VIEW_RESOURCE') }}
                        </p-text-button>
                    </div>
                </template>
            </template>
            <template #data-triggered_by="{ value }">
                <span>{{ getCreatedByNames(value) }}</span>
            </template>
            <template #data-service_id="{ value }">
                <p-link v-if="referenceMap.service[value]?.label "
                        :text="referenceMap.service[value]?.label"
                        :to="{
                            name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                            params: {
                                serviceId: value
                            }
                        }"
                        size="md"
                        highlight
                        action-icon="internal-link"
                        new-tab
                />
                <span v-else>--</span>
            </template>
            <template #data-created_at="{ value }">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #data-acknowledged_at="{ value }">
                <span v-if="alertData?.acknowledged_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at="{ value }">
                <span v-if="alertData?.resolved_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-labels="{ value }">
                <div>
                    <div v-if="value.length > 0"
                         class="flex gap-2"
                    >
                        <p-badge v-for="(item, idx) in value"
                                 :key="`labels-${idx}`"
                                 badge-type="subtle"
                                 style-type="gray200"
                                 shape="square"
                                 class="label-item"
                        >
                            <span>{{ item }}</span>
                        </p-badge>
                    </div>
                    <span v-else>--</span>
                </div>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>

<style scoped lang="postcss">
.alert-detail-info-table {
    .resource-item-wrapper {
        & + .resource-item-wrapper {
            @apply relative;
            margin-top: 1rem;
            &::before {
                @apply absolute border-t border-gray-200;
                content: '';
                top: -0.5rem;
                left: 0;
                width: 100%;
                height: 0.125rem;
            }
        }
    }
    .label-item {
        @apply truncate;
        max-width: 9.875rem;
    }
}
</style>
