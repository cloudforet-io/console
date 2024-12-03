<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.SERVICE.OVERVIEW'), name: SERVICE_DETAIL_TABS.OVERVIEW },
        { label: i18n.t('ALERT_MANAGER.WEBHOOK.TITLE'), name: SERVICE_DETAIL_TABS.WEBHOOK },
        { label: i18n.t('ALERT_MANAGER.NOTIFICATIONS.TITLE'), name: SERVICE_DETAIL_TABS.NOTIFICATIONS },
        { label: i18n.t('ALERT_MANAGER.EVENT_RULE.TITLE'), name: SERVICE_DETAIL_TABS.EVENT_RULE },
        { label: i18n.t('ALERT_MANAGER.ESCALATION_POLICY.TITLE'), name: SERVICE_DETAIL_TABS.ESCALATION_POLICY },
    ])),
    activeTab: SERVICE_DETAIL_TABS.OVERVIEW,
});
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #overview>
            overview
        </template>
        <template #webhook>
            webhook
        </template>
        <template #notifications>
            notifications
        </template>
        <template #event_rule>
            event_rule
        </template>
        <template #escalation_policy>
            escalation_policy
        </template>
    </p-tab>
</template>
