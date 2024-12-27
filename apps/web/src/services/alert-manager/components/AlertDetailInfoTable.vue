<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PBadge, PDefinitionTable, PPaneLayout,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_SEVERITY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertSeverityType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

import AlertDetailInfoTableDescription from '@/services/alert-manager/components/AlertDetailInfoTableDescription.vue';
import { useAlertDetailPageStore } from '@/services/alert-manager/stores/alert-detail-page-store';

type BadgeInfo = {
    badgeType: string;
    styleType: string;
};

const alertDetailPageStore = useAlertDetailPageStore();
const alertDetailPageState = alertDetailPageStore.state;
const alertDetailPageGetters = alertDetailPageStore.getters;

const storeState = reactive({
    timezone: computed<string>(() => alertDetailPageGetters.timezone),
    alertInfo: computed<AlertModel>(() => alertDetailPageState.alertInfo),
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'description', label: i18n.t('ALERT_MANAGER.ALERTS.DESC'), disableCopy: true },
        { name: 'rule', label: i18n.t('ALERT_MANAGER.ALERTS.RULE'), disableCopy: true },
        { name: 'severity', label: i18n.t('ALERT_MANAGER.ALERTS.SEVERITY'), disableCopy: true },
        { name: 'triggered_by', label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED_BY'), copyValueFormatter: () => storeState.alertInfo.triggered_by },
        { name: 'account', label: i18n.t('ALERT_MANAGER.ALERTS.ACCOUNT_ID'), copyValueFormatter: () => storeState.alertInfo.account },
        { name: 'resources', label: i18n.t('ALERT_MANAGER.ALERTS.RESOURCE'), disableCopy: true },
        { name: 'created_at', label: i18n.t('ALERT_MANAGER.ALERTS.CREATED'), disableCopy: true },
        { name: 'acknowledged_at', label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), disableCopy: true },
        { name: 'resolved_at', label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), disableCopy: true },
    ]),
});

const getBadgeInfo = (value: AlertSeverityType): BadgeInfo => {
    switch (value) {
    case ALERT_SEVERITY.CRITICAL:
        return {
            badgeType: 'outline-solid',
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
</script>

<template>
    <p-pane-layout class="alert-detail-info-table overflow-hidden pb-10">
        <p-definition-table :fields="tableState.fields"
                            :data="storeState.alertInfo"
                            :skeleton-rows="10"
                            custom-key-width="10rem"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-detail-info-table-description :value="storeState.alertInfo.description"
                                                     :alert-id="storeState.alertInfo.alert_id"
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
                    {{ ALERT_SEVERITY[value] || value }}
                </p-badge>
            </template>
            <template #data-resources="{ value }">
                <span v-if="value.length === 0">
                    --
                </span>
                <template v-else>
                    <p v-for="resource in value"
                       :key="resource.resource_id"
                       class="text-label-md"
                    >
                        {{ resource.name }}
                    </p>
                </template>
            </template>
            <template #data-triggered_by="{ value }">
                {{ value || '--' }}
            </template>
            <template #data-account="{ value }">
                {{ value || '--' }}
            </template>
            <template #data-created_at="{ value }">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #data-acknowledged_at="{ value }">
                <span v-if="storeState.alertInfo.acknowledged_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at="{ value }">
                <span v-if="storeState.alertInfo.resolved_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>
