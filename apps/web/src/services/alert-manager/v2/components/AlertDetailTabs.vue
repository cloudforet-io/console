<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import AlertDetailTabsDetails from '@/services/alert-manager/v2/components/AlertDetailTabsDetails.vue';
import AlertDetailTabsTimeline from '@/services/alert-manager/v2/components/AlertDetailTabsTimeline.vue';

const DETAIL_TABS = {
    DETAIL: 'detail',
    TIMELINE: 'timeline',
} as const;

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: DETAIL_TABS.DETAIL, label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS') },
        { name: DETAIL_TABS.TIMELINE, label: i18n.t('ALERT_MANAGER.ALERTS.TIMELINE') },
    ])),
    activeTab: DETAIL_TABS.DETAIL,
});
</script>

<template>
    <p-tab :key="i18n.locale"
           :tabs="tabState.tabs"
           :active-tab.sync="tabState.activeTab"
    >
        <template #detail>
            <alert-detail-tabs-details />
        </template>
        <template #timeline>
            <alert-detail-tabs-timeline />
        </template>
    </p-tab>
</template>
