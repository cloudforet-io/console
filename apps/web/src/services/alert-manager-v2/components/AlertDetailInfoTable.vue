<script setup lang="ts">
import { computed, reactive } from 'vue';


import {
    PBadge, PDefinitionTable, PPaneLayout,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/src/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_SEVERITY } from '@/schema/alert-manager/alert/constants';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import AlertDetailInfoTableDescription from '@/services/alert-manager-v2/components/AlertDetailInfoTableDescription.vue';
import { ALERT_SEVERITY_COLORS } from '@/services/alert-manager-v2/constants/common-constant';

const userStore = useUserStore();

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const tableState = reactive({
    fields: computed<DefinitionField[]>(() => [
        { name: 'description', label: i18n.t('ALERT_MANAGER.ALERTS.DESC'), disableCopy: true },
        { name: 'rule', label: i18n.t('ALERT_MANAGER.ALERTS.RULE'), disableCopy: true },
        { name: 'severity', label: i18n.t('ALERT_MANAGER.ALERTS.SEVERITY'), disableCopy: true },
        { name: 'triggered_by', label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED_BY'), copyValueFormatter: () => state.data.triggered_by },
        { name: 'account', label: i18n.t('ALERT_MANAGER.ALERTS.ACCOUNT_ID'), copyValueFormatter: () => state.data.account },
        { name: 'resources', label: i18n.t('ALERT_MANAGER.ALERTS.RESOURCE'), disableCopy: true },
        { name: 'responder', label: i18n.t('ALERT_MANAGER.ALERTS.RESPONDER') },
        { name: 'created_at', label: i18n.t('ALERT_MANAGER.ALERTS.CREATED'), disableCopy: true },
        { name: 'acknowledged_at', label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), disableCopy: true },
        { name: 'resolved_at', label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), disableCopy: true },
    ]),
});
const state = reactive({
    data: {
        alert_id: 'alert_id',
        description: 'description',
        rule: {},
        severity: 'CRITICAL',
        triggered_by: 'webhook-db1678262551',
        account: '722069360300',
        resources: [],
        responder: 'wonny@mz.co.kr',
        created_at: '2023-11-28 15:06:51',
        acknowledged_at: '2023-11-28 15:06:51',
        resolved_at: '2023-11-28 15:06:51',
    },
});
</script>

<template>
    <p-pane-layout class="alert-detail-info-table overflow-hidden pb-10">
        <p-definition-table :fields="tableState.fields"
                            :data="state.data"
                            :skeleton-rows="10"
                            custom-key-width="10rem"
                            style-type="white"
                            block
        >
            <template #data-description>
                <alert-detail-info-table-description />
            </template>
            <template #data-rule="{value}">
                <span v-if="Object.keys(value).length === 0">
                    --
                </span>
            </template>
            <template #data-severity="{value}">
                <p-badge background-color="white"
                         :text-color="ALERT_SEVERITY_COLORS[value]"
                         :outline-color="ALERT_SEVERITY_COLORS[value]"
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
            <template #data-created_at="{ value }">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #data-acknowledged_at="{ value }">
                <span v-if="state.data.acknowledged_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
            <template #data-resolved_at="{ value }">
                <span v-if="state.data.resolved_at"> {{ iso8601Formatter(value, storeState.timezone) }}</span>
                <span v-else>--</span>
            </template>
        </p-definition-table>
    </p-pane-layout>
</template>
